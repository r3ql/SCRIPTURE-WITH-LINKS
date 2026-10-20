import type {
  VideoLink,
  VideoComment,
  WhatsAppRoom,
  WhatsAppMessage,
  TopicCategory,
  AnonymousTrailPeer,
  UserBibleProgress,
  UserProfile,
  SanctuarySpace,
  ConversationUpload,
  SpaceMember,
} from '../types/index.ts';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-admin-local',
  name: 'Sanctuary Sovereign',
  handle: '@sanctuary_admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
  role: 'admin',
  isOwner: true,
  spaceName: 'Berean Fellowship Sanctuary',
  bio: 'Local Administrator & Curator of this Scripture With Links instance.',
  phoneInstanceId: 'inst-' + Math.random().toString(36).substring(2, 9),
};

export const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'usr-guest-local',
  name: 'Pilgrim Guest',
  handle: '@guest_berean',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces',
  role: 'guest',
  isOwner: false,
  spaceName: 'Guest Pilgrim Session',
  bio: 'Exploring Scripture With Links without an account.',
  phoneInstanceId: 'inst-guest',
};

export const DEFAULT_SANCTUARY_SPACE: SanctuarySpace = {
  spaceId: 'space-berean-main',
  name: 'The Berean Sanctuary Space',
  code: 'BEREAN-7749',
  hostName: 'Sanctuary Sovereign',
  hostId: 'usr-admin-local',
  inviteUrl: typeof window !== 'undefined' ? `${window.location.origin}/?spaceCode=BEREAN-7749` : 'https://scripture-with-links.app/?spaceCode=BEREAN-7749',
  createdAt: '2026-01-01',
  allowGuestAccess: true,
  members: [
    {
      id: 'usr-admin-local',
      name: 'Sanctuary Sovereign (You)',
      handle: '@sanctuary_admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
      role: 'admin',
      joinedAt: 'Founding Host',
      status: 'active',
      canUploadLinks: true,
      canUploadChats: true,
    },
    {
      id: 'mem-priscilla',
      name: 'Priscilla of Achaia',
      handle: '@priscilla_exegete',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
      role: 'contributor',
      joinedAt: '3 days ago',
      status: 'active',
      canUploadLinks: true,
      canUploadChats: true,
    },
    {
      id: 'mem-apollos',
      name: 'Apollos of Alexandria',
      handle: '@apollos_eloquent',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
      role: 'contributor',
      joinedAt: 'Yesterday',
      status: 'active',
      canUploadLinks: true,
      canUploadChats: true,
    },
  ],
};

export const INITIAL_CONVERSATION_UPLOADS: ConversationUpload[] = [
  {
    id: 'conv-romans-8',
    title: 'WhatsApp Group Discussion: Golden Chain of Redemption',
    source: 'whatsapp',
    createdAt: '2026-03-15',
    uploadedBy: 'Sanctuary Sovereign',
    messageCount: 8,
    detectedVerses: ['Romans 8:28', 'Romans 8:29', 'Romans 8:30'],
    roomId: 'room-verse-romans-8-28',
    rawText: `[14/03/2026, 19:30:12] Priscilla: Looking at Romans 8:28 today. Note the phrase "to them that love God".
[14/03/2026, 19:31:05] Apollos: Exactly. And in Greek, "synergei eis agathon" (worketh together for good) refers back to God's sovereign hand.
[14/03/2026, 19:32:40] Sanctuary Sovereign: Verse 29 connects with "foreknowledge" not merely as prescience, but covenantal loving affection.
[14/03/2026, 19:35:10] Priscilla: Amen! Check the video linked on Romans 8 for the full exposition of the Golden Chain!`,
  },
  {
    id: 'conv-john-3',
    title: 'Pastoral Exchange: The Heavenly Birth in John 3',
    source: 'whatsapp',
    createdAt: '2026-03-10',
    uploadedBy: 'Sanctuary Sovereign',
    messageCount: 5,
    detectedVerses: ['John 3:3', 'John 3:5', 'John 3:16'],
    roomId: 'room-verse-john-3-16',
    rawText: `[09/03/2026, 21:12:00] Berean Student: Why does Jesus tell Nicodemus "ye must be born from above" (anōthen)?
[09/03/2026, 21:14:22] Sanctuary Sovereign: Because natural flesh cannot inherit the realm of the spirit; it requires divine monergistic regeneration.
[09/03/2026, 21:16:45] Apollos: It mirrors Ezekiel 36:26—taking out the heart of stone and giving a heart of flesh.`,
  },
];

// Regex for detecting common Bible verses inside chat transcripts
export const BIBLE_VERSE_REGEX = /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1\s*Samuel|2\s*Samuel|1\s*Kings|2\s*Kings|1\s*Chronicles|2\s*Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s*of\s*Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1\s*Corinthians|2\s*Corinthians|Galatians|Ephesians|Philippians|Colossians|1\s*Thessalonians|2\s*Thessalonians|1\s*Timothy|2\s*Timothy|Titus|Philemon|Hebrews|James|1\s*Peter|2\s*Peter|1\s*John|2\s*John|3\s*John|Jude|Revelation)\s*\d+[:\.]\d+(?:-\d+)?/gi;

export interface ParsedChatMessage {
  sender: string;
  time: string;
  text: string;
  detectedVerses: string[];
}

export function parseWhatsAppChatText(rawText: string): {
  messages: ParsedChatMessage[];
  detectedVerses: string[];
} {
  const lines = rawText.split('\n');
  const messages: ParsedChatMessage[] = [];
  const allVersesSet = new Set<string>();

  // WhatsApp patterns:
  // [14/03/2026, 19:30:12] Sender: Message
  // 14/03/2026, 19:30 - Sender: Message
  const waRegex1 = /^\[?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*(?:-\s*)?([^:]+):\s*(.*)$/;

  let currentMsg: ParsedChatMessage | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(waRegex1);
    if (match) {
      if (currentMsg) {
        messages.push(currentMsg);
      }
      const time = match[1].trim();
      const sender = match[2].trim();
      const text = match[3].trim();

      const lineVerses = (text.match(BIBLE_VERSE_REGEX) || []).map((v) => v.trim());
      lineVerses.forEach((v) => allVersesSet.add(v));

      currentMsg = {
        sender,
        time,
        text,
        detectedVerses: lineVerses,
      };
    } else if (currentMsg) {
      currentMsg.text += '\n' + trimmed;
      const lineVerses = (trimmed.match(BIBLE_VERSE_REGEX) || []).map((v) => v.trim());
      lineVerses.forEach((v) => allVersesSet.add(v));
    } else {
      // Standalone line without header
      const lineVerses = (trimmed.match(BIBLE_VERSE_REGEX) || []).map((v) => v.trim());
      lineVerses.forEach((v) => allVersesSet.add(v));
      messages.push({
        sender: 'Fellow Scribe',
        time: 'Chat Log',
        text: trimmed,
        detectedVerses: lineVerses,
      });
    }
  }

  if (currentMsg) {
    messages.push(currentMsg);
  }

  return {
    messages,
    detectedVerses: Array.from(allVersesSet),
  };
}

export interface SanctuaryFullExport {
  exportVersion: string;
  exportedAt: string;
  appName: string;
  license: string;
  userProfile: UserProfile;
  sanctuarySpace: SanctuarySpace;
  userProgress: UserBibleProgress;
  videoLinks: VideoLink[];
  comments: Record<string, VideoComment[]>;
  categories: TopicCategory[];
  whatsappRooms: WhatsAppRoom[];
  whatsappMessages: Record<string, WhatsAppMessage[]>;
  conversationUploads: ConversationUpload[];
}

export function exportSanctuaryData(
  userProfile: UserProfile,
  sanctuarySpace: SanctuarySpace,
  userProgress: UserBibleProgress,
  videoLinks: VideoLink[],
  comments: Record<string, VideoComment[]>,
  categories: TopicCategory[],
  rooms: WhatsAppRoom[],
  messages: Record<string, WhatsAppMessage[]>,
  conversationUploads: ConversationUpload[]
): string {
  const exportData: SanctuaryFullExport = {
    exportVersion: '2.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'SCRIPTURE WITH LINKS',
    license: 'Complete Block Product - 100% Free & Open Sanctuary',
    userProfile,
    sanctuarySpace,
    userProgress,
    videoLinks,
    comments,
    categories,
    whatsappRooms: rooms,
    whatsappMessages: messages,
    conversationUploads,
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadSanctuaryJSON(jsonString: string, filename = 'scripture-with-links-sanctuary.json') {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface EncodedSpaceInvitePayload {
  spaceId: string;
  name: string;
  code: string;
  hostName: string;
  hostAvatar?: string;
  curatedLinksCount?: number;
  featuredVerses?: string[];
}

export function generateSpaceInviteToken(space: SanctuarySpace, hostProfile: UserProfile, links: VideoLink[]): string {
  const payload: EncodedSpaceInvitePayload = {
    spaceId: space.spaceId,
    name: space.name,
    code: space.code,
    hostName: hostProfile.name || space.hostName,
    hostAvatar: hostProfile.avatar,
    curatedLinksCount: links.length,
    featuredVerses: Array.from(new Set(links.flatMap((l) => l.verses))).slice(0, 5),
  };

  const json = JSON.stringify(payload);
  if (typeof btoa !== 'undefined') {
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  }
  return encodeURIComponent(Buffer.from(json).toString('base64'));
}

export function parseSpaceInviteToken(token: string): EncodedSpaceInvitePayload | null {
  try {
    const decodedUri = decodeURIComponent(token);
    let jsonString = '';
    if (typeof atob !== 'undefined') {
      jsonString = decodeURIComponent(escape(atob(decodedUri)));
    } else {
      jsonString = Buffer.from(decodedUri, 'base64').toString('utf8');
    }
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.spaceId && parsed.code) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

