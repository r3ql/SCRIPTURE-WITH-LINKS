export type Testament = 'OT' | 'NT';

export interface BibleBook {
  id: string;
  name: string;
  testament: Testament;
  chaptersCount: number;
  category: 'Law' | 'History' | 'Poetry & Wisdom' | 'Major Prophets' | 'Minor Prophets' | 'Gospels' | 'Acts' | 'Pauline Epistles' | 'General Epistles' | 'Prophecy';
  abbreviation: string;
}

export interface BibleVerse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface TopicSubcategory {
  id: string;
  parentCategoryId: string;
  name: string;
  description: string;
  count?: number;
}

export interface TopicCategory {
  id: string;
  name: string;
  description: string;
  subcategories: TopicSubcategory[];
}

export interface TimedComment {
  id: string;
  videoId: string;
  timestampSeconds: number;
  timestampFormatted: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    isMe?: boolean;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLikedByUser?: boolean;
  replies?: TimedComment[];
}

export interface StructuredSummary {
  coreThesis: string;
  keyTakeaways: string[];
  canonicalConnection: string;
}

export interface VideoLink {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  speaker: string;
  channelTitle: string;
  timestampSeconds?: number;
  timestampFormatted?: string;
  verses: string[]; // e.g., ["John 3:16", "Romans 8:28"]
  primaryBookId: string;
  primaryChapter: number;
  primaryVerseStart: number;
  primaryVerseEnd?: number;
  notes: string;
  tags: string[];
  categoryId?: string;
  subcategoryId?: string;
  structuredSummary?: StructuredSummary;
  timedComments?: TimedComment[];
  durationSeconds?: number;
  postedBy: {
    name: string;
    avatar: string;
    handle: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface VideoComment {
  id: string;
  videoId: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  content: string;
  timestampTag?: string; // e.g. "02:45"
  timestampSeconds?: number;
  createdAt: string;
  likes: number;
  isLikedByUser?: boolean;
  replies?: VideoComment[];
}

export interface WhatsAppRoom {
  id: string;
  title: string;
  subtitle: string;
  avatar: string;
  type: 'verse' | 'video' | 'general' | 'topic' | 'companion';
  targetReference?: string;
  videoId?: string;
  companionPseudonym?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  isPinned?: boolean;
}

export interface WhatsAppMessage {
  id: string;
  roomId: string;
  senderName: string;
  senderAvatar: string;
  isMe: boolean;
  text: string;
  timestamp: string;
  quoteVerse?: {
    reference: string;
    text: string;
  };
  quoteVideo?: {
    title: string;
    youtubeId: string;
    timestampFormatted?: string;
  };
  status?: 'sent' | 'delivered' | 'read';
}

export interface UserBibleProgress {
  watchedVideoIds: string[];
  watchedSeconds: Record<string, number>; // videoId -> seconds watched
  completedChapters: string[]; // e.g. "John:3", "Romans:8"
  readVersesCount: number;
  totalWatchTimeMinutes: number;
  lastActiveDate: string;
  exploredChapters?: string[]; // chapters opened and inspected e.g. "John:1", "Genesis:1"
  userAddedLinkIds?: string[]; // links created by this local user
  commentedChapterKeys?: string[]; // chapters where comments were made
}

export interface AnonymousTrailPeer {
  id: string;
  pseudonym: string; // e.g. "Berean Pilgrim #342"
  avatar: string;
  currentFocusBook: string;
  currentFocusChapter: number;
  activeTopics: string[];
  overlapPercentage: number;
  matchedTrailDescription: string;
  recentStudies: string[];
  isChatInitiated?: boolean;
}

export type AuthMode = 'guest' | 'admin' | 'member';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: 'admin' | 'guest' | 'contributor' | 'berean';
  isOwner: boolean;
  spaceName: string;
  bio?: string;
  phoneInstanceId?: string;
}

export interface SpaceMember {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: 'admin' | 'contributor' | 'berean';
  joinedAt: string;
  status: 'active' | 'pending';
  canUploadLinks: boolean;
  canUploadChats: boolean;
}

export interface SanctuarySpace {
  spaceId: string;
  name: string;
  code: string;
  hostName: string;
  hostId: string;
  inviteUrl: string;
  createdAt: string;
  members: SpaceMember[];
  allowGuestAccess: boolean;
}

export interface ConversationUpload {
  id: string;
  title: string;
  source: 'whatsapp' | 'manual' | 'file';
  rawText: string;
  detectedVerses: string[];
  linkedVideoIds?: string[];
  createdAt: string;
  uploadedBy: string;
  messageCount: number;
  roomId?: string;
}

export interface PilgrimMilestone {
  bookId: string;
  bookName: string;
  chapter: number;
  isExplored: boolean;
  isRead: boolean;
  watchedVideosCount: number;
  addedLinksCount: number;
  commentsCount: number;
  lastInteractedAt?: string;
}
