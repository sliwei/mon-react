import { getSettings, getUPs, getStoredDynamics, saveStoredDynamics, isMarkedRead } from './storage';
import { fetchDynamics, fetchComments, fetchSubReplies } from './api';
import type { Comment } from '../types';


type Listener = () => void;

class PollingService {
  private dynamicTimer: ReturnType<typeof setInterval> | null = null;
  private commentTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<Listener> = new Set();
  private isPollingDynamics = false;
  private isPollingComments = false;

  constructor() {
    // Initial check on load
    this.restart();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  restart() {
    this.stop();
    this.start();
  }

  stop() {
    if (this.dynamicTimer) {
      clearInterval(this.dynamicTimer);
      this.dynamicTimer = null;
    }
    if (this.commentTimer) {
      clearInterval(this.commentTimer);
      this.commentTimer = null;
    }
  }

  start() {
    const settings = getSettings();
    
    // Dynamic Polling
    if (settings.enableDynamicPolling && settings.dynamicPollingInterval > 0) {
      this.dynamicTimer = setInterval(() => {
        this.pollDynamics();
      }, settings.dynamicPollingInterval * 60 * 1000);
    }

    // Comment Polling
    if (settings.enableCommentPolling && settings.commentPollingInterval > 0) {
      this.commentTimer = setInterval(() => {
        this.pollComments();
      }, settings.commentPollingInterval * 60 * 1000);
    }
  }

  async forceRefreshDynamics() {
    await this.pollDynamics();
  }

  private async pollDynamics() {
    if (this.isPollingDynamics) return;
    const settings = getSettings();
    if (!settings.cookie) return;

    this.isPollingDynamics = true;
    try {
      const ups = getUPs();
      const currentDynamicsMap = getStoredDynamics();
      let hasChanges = false;

      for (const up of ups) {
        try {
          const fetchedDynamics = await fetchDynamics(up.mid, settings.cookie);
          
          if (fetchedDynamics.length > 0) {
            const existingDynamics = currentDynamicsMap[up.mid] || [];
            const existingIds = new Set(existingDynamics.map(d => d.id));
            
            // Process fetched dynamics
            const newDynamics = fetchedDynamics.map(d => ({
              ...d,
              isRead: isMarkedRead(d.id)
            }));

            // Check for NEW dynamics for notification
            // We only notify if it's NOT in existingIds
            const latestDynamic = newDynamics[0];
            if (latestDynamic && !existingIds.has(latestDynamic.id)) {
               if (settings.enableNotifications && Notification.permission === 'granted') {
                    new Notification(`Bili Monitor: ${up.name} 发步了新动态`, {
                        body: latestDynamic.title || latestDynamic.description || '点击查看',
                        icon: up.face
                    });
                }
            }

            // Update map - we replace the list with new fetch but preserve strictly older ones if we wanted to keep history?
            // The current logic "replaces" the list with fetched list. `fetchDynamics` usually returns latest 12.
            // If we want to keep history we should merge.
            // For now, I will just replace as per previous logic but respecting `isRead`.
            
            // Actually, we should preserve `comments` if we already fetched them!
            // `fetchDynamics` does NOT return comments. `pollComments` fills them.
            // So we MUST merge: if ID exists in `existingDynamics`, copy `comments` from it.
            
            const mergedDynamics = newDynamics.map(nd => {
                const existing = existingDynamics.find(ed => ed.id === nd.id);
                if (existing) {
                    return { 
                        ...nd, 
                        // Preserve comments from existing
                        comments: existing.comments,
                        // Preserve isRead if existing has it true (backup if isMarkedRead fails or race condition)
                        isRead: nd.isRead || existing.isRead 
                    }; 
                }
                return nd;
            });

            currentDynamicsMap[up.mid] = mergedDynamics;
            hasChanges = true;
          }
        } catch (e) {
          console.error(`Failed to poll dynamics for ${up.name}`, e);
        }
      }

      if (hasChanges) {
        saveStoredDynamics(currentDynamicsMap);
        this.notify();
      }
    } finally {
      this.isPollingDynamics = false;
    }
  }

  private async pollComments() {
    if (this.isPollingComments) return;
    const settings = getSettings();
    if (!settings.cookie) return;

    this.isPollingComments = true;
    try {
      const dynamicsMap = getStoredDynamics();
      const ups = getUPs();
      let hasChanges = false;
      const now = Date.now() / 1000;
      const timeLimitSeconds = settings.commentTimeRange * 3600;

      for (const mid in dynamicsMap) {
        const up = ups.find(u => u.mid === mid);
        const upName = up ? up.name : ''; // We use name for matching UP comments if mid is missing in comment
        
        const dynamics = dynamicsMap[mid];
        
        for (const dynamic of dynamics) {
          // Check time range
          if (now - dynamic.timestamp > timeLimitSeconds) continue;

          // Fetch comments
          try {
            const comments = await fetchComments(dynamic.commentOid, dynamic.commentType, settings.cookie);
            
            // Fetch sub-replies
            for (const comment of comments) {
              const replen = comment.replies?.length || 0
              if (comment.replyCount && comment.replyCount > 0 && replen < comment.replyCount) {
                const subReplies = await fetchSubReplies(dynamic.commentOid, dynamic.commentType, comment.rootId || comment.id, settings.cookie);
                if (subReplies.length > 0) {
                  comment.replies = subReplies;
                }
              }
            }
            
            // Inject isRead
            const existingComments = dynamic.comments || [];
            const existingCommentsMap = new Map<string, Comment>();
            const buildMap = (list: Comment[]) => {
                list.forEach(c => {
                    existingCommentsMap.set(c.id, c);
                    if (c.replies) buildMap(c.replies);
                });
            }
            buildMap(existingComments);

            const processComment = (c: Comment) => {
                const existing = existingCommentsMap.get(c.id);
                c.isRead = isMarkedRead(c.id) || (existing && existing.isRead);
                if (c.replies) c.replies.forEach(processComment);
            };
            comments.forEach(processComment);

            // Notification Logic for UP's comments/replies
            if (settings.enableNotifications && upName) {
                const existingComments = dynamic.comments || [];
                const existingIds = new Set<string>();
                const collectIds = (c: Comment) => {
                    existingIds.add(c.id);
                    if (c.replies) c.replies.forEach(collectIds);
                };
                existingComments.forEach(collectIds);

                // Check for new comments from UP
                let hasNewUpComment = false;
                const checkNewUpComment = (c: Comment) => {
                    if (!existingIds.has(c.id) && c.userName === upName) {
                        hasNewUpComment = true;
                    }
                    if (c.replies) c.replies.forEach(checkNewUpComment);
                }
                comments.forEach(checkNewUpComment);

                if (hasNewUpComment && Notification.permission === 'granted') {
                     new Notification(`Bili Monitor: ${upName} 回复了评论`, {
                        body: `在动态 "${dynamic.title || dynamic.description.substring(0, 20)}..." 下`,
                        icon: up?.face
                    });
                }
            }
            
            dynamic.comments = comments; 
            hasChanges = true;

          } catch (e) {
            console.error(`Failed to poll comments for dynamic ${dynamic.id}`, e);
          }
        }
      }

      if (hasChanges) {
        saveStoredDynamics(dynamicsMap);
        this.notify();
      }
    } finally {
      this.isPollingComments = false;
    }
  }
}

export const pollingService = new PollingService();
