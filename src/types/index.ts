export interface UP {
  mid: string;
  name: string;
  face: string;
}

export interface Settings {
  cookie: string;
  refreshInterval: number; // in minutes
  enableNotifications: boolean;
}

export interface DynamicContent {
  id: string;
  mid: string;
  timestamp: number;
  title: string;
  description: string;
  cover?: string;
  images: string[];
  jumpUrl: string;
  commentOid: string;
  commentType: number;
}

export interface Comment {
  id: string;
  content: string;
  timestamp: number;
  userName: string;
  userFace: string;
  isPinned?: boolean;
  replyCount?: number;
  rootId?: string; // used for fetching more sub-replies
  replies?: Comment[];
}
