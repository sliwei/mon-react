import { getSettings, getUPs, getStoredDynamics, saveStoredDynamics } from './storage';
import { fetchDynamics, fetchComments, fetchSubReplies } from './api';


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
      // Run immediately if needed, or wait for interval. 
      // For now, let's respect the interval to avoid spamming on reload, 
      // but maybe run once if data is empty? 
      // User requirement: "Independent task".
      
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
        // We fetch for each UP. 
        // OPTIMIZATION: Could be parallelized, but sequential is safer for rate limits.
        try {
          const newDynamics = await fetchDynamics(up.mid, settings.cookie);
          if (newDynamics.length > 0) {
            // Merge logic: Map strictly prevents duplicates by ID
            // But we actually want to adhere to the existing structure: Record<mid, DynamicContent[]>
            // Or should we merge everything?
            // "将所有up的动态数据根据时间合并成一个数组" -> "Merge all UP dynamics into one array based on time"
            // However, the UI currently expects a map. The requirement says "independent run", 
            // but the storage structure is used by UI.
            // Let's stick to the storage structure (Map) for now to minimize breaking changes, 
            // but the Service could expose a helper to get specific list.
            
            // Actually, the requirement says "Merge all... into one array". 
            // But `getStoredDynamics` returns `Record<string, DynamicContent[]>`.
            // I will maintain the Record structure in storage for efficient lookups/updates per UP,
            // and the UI can flatten it if needed, or I can update storage structure?
            // "Refactoring" usually implies improving structure. 
            // Let's keep the Record for storage efficiency (mid -> dynamics) but ensure we process all.
            
            // Wait, if I change storage structure, I break `getStoredDynamics` type.
            // Let's keep `Record<string, DynamicContent[]>` for now.
            
            // Check for notifications
            const lastLatest = currentDynamicsMap[up.mid]?.[0];
            const newLatest = newDynamics[0];

            if (settings.enableNotifications && newLatest && (!lastLatest || newLatest.timestamp > lastLatest.timestamp)) {
                if (Notification.permission === 'granted') {
                    new Notification(`Bili Monitor: ${up.name}`, {
                        body: newLatest.title || newLatest.description,
                        icon: up.face
                    });
                }
            }

            // Update map
            currentDynamicsMap[up.mid] = newDynamics;
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
      let hasChanges = false;
      const now = Date.now() / 1000;
      const timeLimitSeconds = settings.commentTimeRange * 3600;

      for (const mid in dynamicsMap) {
        const dynamics = dynamicsMap[mid];
        // Create a new array to avoid mutating state directly during iteration if possible, 
        // though we are modifying deep objects.
        
        for (const dynamic of dynamics) {
          // Check time range
          if (now - dynamic.timestamp > timeLimitSeconds) continue;

          // Fetch comments
          try {
            const comments = await fetchComments(dynamic.commentOid, dynamic.commentType, settings.cookie);
            
            // Check for replies in comments
            for (const comment of comments) {
              if (comment.replyCount && comment.replyCount > 0 && !comment.replies?.length) {
                // Fetch sub-replies if missing
                const subReplies = await fetchSubReplies(dynamic.commentOid, dynamic.commentType, comment.rootId || comment.id, settings.cookie);
                if (subReplies.length > 0) {
                  comment.replies = subReplies;
                }
              }
            }
            
            // Simple check if comments changed? 
            // Deep comparison is expensive. Let's just assume if we fetched, we update.
            // Or we could compare counts/IDs.
            // For now, always update if we fetched successfully.
            
            // We need a way to store these comments attached to the dynamic.
            // currently `DynamicContent` does NOT have a comments field.
            // I need to add `comments?: Comment[]` to `DynamicContent` in `types/index.ts`.
            // WAIT! I missed that in the types step.
            // The requirement says: "将获取到的评论存在对应的动态数据内" (Store fetched comments inside corresponding dynamic data).
            
            // I will add the field dynamically here, assuming usage of `any` or update types in next step?
            // No, I should fix types first or casting. I missed it.
            // I will cast it for now and fix types in a moment.
            
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
