import React, { useState, useEffect } from 'react';
import type {
  VideoLink,
  VideoComment,
  WhatsAppRoom,
  WhatsAppMessage,
  BibleVerse,
  TopicCategory,
  AnonymousTrailPeer,
  UserBibleProgress,
  UserProfile,
  SanctuarySpace,
  SpaceMember,
  ConversationUpload,
  AuthMode,
} from './types/index.ts';
import {
  INITIAL_VIDEO_LINKS,
  INITIAL_COMMENTS,
  INITIAL_WHATSAPP_ROOMS,
  INITIAL_WHATSAPP_MESSAGES,
  INITIAL_ANONYMOUS_PEERS,
  INITIAL_USER_PROGRESS,
} from './data/initialLinks.ts';
import { INITIAL_TOPIC_CATEGORIES } from './data/topicCategories.ts';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_GUEST_PROFILE,
  DEFAULT_SANCTUARY_SPACE,
  INITIAL_CONVERSATION_UPLOADS,
  exportSanctuaryData,
  downloadSanctuaryJSON,
} from './utils/sanctuaryStorage.ts';
import { Navbar, type NavTab } from './components/Navbar.tsx';
import { BibleReader } from './components/BibleReader.tsx';
import { PilgrimMap } from './components/PilgrimMap.tsx';
import { TopicExplorer } from './components/TopicExplorer.tsx';
import { VideoArchive } from './components/VideoArchive.tsx';
import { DensityHeatmap } from './components/DensityHeatmap.tsx';
import { ProgressAnalytics } from './components/ProgressAnalytics.tsx';
import { TrailCompanions } from './components/TrailCompanions.tsx';
import { VideoModal } from './components/VideoModal.tsx';
import { PostVideoModal } from './components/PostVideoModal.tsx';
import { WhatsAppSpace } from './components/WhatsAppSpace.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SpaceAdminModal } from './components/SpaceAdminModal.tsx';
import { UploadManagerModal } from './components/UploadManagerModal.tsx';
import { MessageSquare, BookOpen, Film, Network, Plus, Heart, Share2, Sparkles, Layers, Users, BarChart3, Compass, Crown, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('bible');
  const [currentBookId, setCurrentBookId] = useState<string>('John');
  const [currentChapter, setCurrentChapter] = useState<number>(3);

  // Categories
  const [categories, setCategories] = useState<TopicCategory[]>(() => {
    try {
      const saved = localStorage.getItem('sw_topic_categories');
      return saved ? JSON.parse(saved) : INITIAL_TOPIC_CATEGORIES;
    } catch {
      return INITIAL_TOPIC_CATEGORIES;
    }
  });

  // Anonymous Peers
  const [peers, setPeers] = useState<AnonymousTrailPeer[]>(() => {
    try {
      const saved = localStorage.getItem('sw_anonymous_peers');
      return saved ? JSON.parse(saved) : INITIAL_ANONYMOUS_PEERS;
    } catch {
      return INITIAL_ANONYMOUS_PEERS;
    }
  });

  // User Bible Reading Progress
  const [progress, setProgress] = useState<UserBibleProgress>(() => {
    try {
      const saved = localStorage.getItem('sw_user_progress');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROGRESS;
    } catch {
      return INITIAL_USER_PROGRESS;
    }
  });

  // Video Links
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>(() => {
    try {
      const saved = localStorage.getItem('sw_video_links');
      return saved ? JSON.parse(saved) : INITIAL_VIDEO_LINKS;
    } catch {
      return INITIAL_VIDEO_LINKS;
    }
  });

  // Comments
  const [comments, setComments] = useState<Record<string, VideoComment[]>>(() => {
    try {
      const saved = localStorage.getItem('sw_video_comments');
      return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });

  // WhatsApp Rooms & Messages
  const [rooms, setRooms] = useState<WhatsAppRoom[]>(() => {
    try {
      const saved = localStorage.getItem('sw_wa_rooms');
      return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_ROOMS;
    } catch {
      return INITIAL_WHATSAPP_ROOMS;
    }
  });

  const [messages, setMessages] = useState<Record<string, WhatsAppMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('sw_wa_messages');
      return saved ? JSON.parse(saved) : INITIAL_WHATSAPP_MESSAGES;
    } catch {
      return INITIAL_WHATSAPP_MESSAGES;
    }
  });

  const [activeWhatsAppRoomId, setActiveWhatsAppRoomId] = useState<string>('room-verse-john-3-16');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoLink | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [prefillVerseRef, setPrefillVerseRef] = useState<string | undefined>(undefined);

  // Auth, Ownership & Space State (Sovereign Phone Installation)
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    try {
      const saved = localStorage.getItem('sw_auth_mode');
      return (saved as AuthMode) || 'admin';
    } catch {
      return 'admin';
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('sw_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [sanctuarySpace, setSanctuarySpace] = useState<SanctuarySpace>(() => {
    try {
      const saved = localStorage.getItem('sw_sanctuary_space');
      return saved ? JSON.parse(saved) : DEFAULT_SANCTUARY_SPACE;
    } catch {
      return DEFAULT_SANCTUARY_SPACE;
    }
  });

  const [conversations, setConversations] = useState<ConversationUpload[]>(() => {
    try {
      const saved = localStorage.getItem('sw_conversation_uploads');
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATION_UPLOADS;
    } catch {
      return INITIAL_CONVERSATION_UPLOADS;
    }
  });

  // Modal Open States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSpaceAdminModalOpen, setIsSpaceAdminModalOpen] = useState<boolean>(false);
  const [isUploadManagerModalOpen, setIsUploadManagerModalOpen] = useState<boolean>(false);
  const [systemToast, setSystemToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('sw_topic_categories', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_anonymous_peers', JSON.stringify(peers));
    } catch {}
  }, [peers]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_user_progress', JSON.stringify(progress));
    } catch {}
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_video_links', JSON.stringify(videoLinks));
    } catch {}
  }, [videoLinks]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_video_comments', JSON.stringify(comments));
    } catch {}
  }, [comments]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_wa_rooms', JSON.stringify(rooms));
      localStorage.setItem('sw_wa_messages', JSON.stringify(messages));
    } catch {}
  }, [rooms, messages]);

  useEffect(() => {
    try {
      localStorage.setItem('sw_auth_mode', authMode);
      localStorage.setItem('sw_user_profile', JSON.stringify(userProfile));
      localStorage.setItem('sw_sanctuary_space', JSON.stringify(sanctuarySpace));
      localStorage.setItem('sw_conversation_uploads', JSON.stringify(conversations));
    } catch {}
  }, [authMode, userProfile, sanctuarySpace, conversations]);

  // Track Pilgrim Map exploration whenever reader is at a book/chapter
  useEffect(() => {
    const key = `${currentBookId}:${currentChapter}`;
    setProgress((prev) => {
      const existing = prev.exploredChapters || [];
      if (existing.includes(key)) return prev;
      return {
        ...prev,
        exploredChapters: [...existing, key],
      };
    });
  }, [currentBookId, currentChapter]);

  // Auto-detect invitation links via URL query params (?spaceCode=... or ?host=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const spaceCode = params.get('spaceCode');
      const host = params.get('host');
      if (spaceCode) {
        setSystemToast({
          message: `🕊️ Welcome! You've joined ${host ? `${decodeURIComponent(host)}'s` : 'the'} fellowship space (${spaceCode}).`,
          type: 'success',
        });
        setAuthMode('member');
        setUserProfile((prev) => ({
          ...prev,
          role: 'berean',
          isOwner: false,
          spaceName: `${host || 'Fellow'} Sanctuary`,
        }));
      }
    }
  }, []);

  // Handlers
  const handleLikeVideo = (videoId: string) => {
    setVideoLinks((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, likesCount: v.likesCount + 1 } : v))
    );
    if (activeVideoModal && activeVideoModal.id === videoId) {
      setActiveVideoModal((prev) => (prev ? { ...prev, likesCount: prev.likesCount + 1 } : null));
    }
  };

  const handleAddVideo = (newVideoData: Omit<VideoLink, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => {
    const newId = `link-${Date.now()}`;
    const newVideo: VideoLink = {
      ...newVideoData,
      id: newId,
      createdAt: 'Just now',
      likesCount: 1,
      commentsCount: 0,
    };
    setVideoLinks([newVideo, ...videoLinks]);

    // Create WhatsApp room for newly linked video
    const newRoom: WhatsAppRoom = {
      id: `room-video-${newId}`,
      title: `${newVideo.speaker}: ${newVideo.title.slice(0, 32)}...`,
      subtitle: `Video Discussion · ${newVideo.verses.join(', ')}`,
      avatar: `https://img.youtube.com/vi/${newVideo.youtubeId}/default.jpg`,
      type: 'video',
      videoId: newId,
      unreadCount: 0,
      lastMessage: `Newly linked video exegesis for ${newVideo.verses.join(', ')}`,
      lastMessageTime: 'Just now',
    };

    setRooms((prev) => [newRoom, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [
        {
          id: `msg-${Date.now()}`,
          roomId: newRoom.id,
          senderName: newVideo.postedBy.name,
          senderAvatar: newVideo.postedBy.avatar,
          isMe: true,
          text: `Welcome! Here is my linked video exegesis on ${newVideo.verses.join(', ')}: "${newVideo.notes}"`,
          timestamp: 'Just now',
          quoteVideo: {
            title: newVideo.title,
            youtubeId: newVideo.youtubeId,
            timestampFormatted: newVideo.timestampFormatted,
          },
          status: 'read',
        },
      ],
    }));

    // Update user activity in progress
    setProgress((prev) => ({
      ...prev,
      watchedVideoIds: Array.from(new Set([...prev.watchedVideoIds, newId])),
      totalWatchTimeMinutes: prev.totalWatchTimeMinutes + 10,
    }));
  };

  const handleAddComment = (
    videoId: string,
    content: string,
    timestampTag?: string,
    timestampSeconds?: number
  ) => {
    const newComment: VideoComment = {
      id: `c-${Date.now()}`,
      videoId,
      author: {
        name: 'You (Fellow Berean)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        handle: '@berean_disciple',
      },
      content,
      timestampTag,
      timestampSeconds,
      createdAt: 'Just now',
      likes: 0,
    };

    setComments((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }));

    setVideoLinks((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        const updatedTimed = v.timedComments ? [...v.timedComments] : [];
        if (timestampSeconds !== undefined && timestampTag) {
          updatedTimed.push({
            id: newComment.id,
            videoId,
            timestampSeconds,
            timestampFormatted: timestampTag,
            author: { ...newComment.author, isMe: true },
            content,
            createdAt: 'Just now',
            likes: 0,
          });
        }
        return {
          ...v,
          commentsCount: v.commentsCount + 1,
          timedComments: updatedTimed,
        };
      })
    );

    // Update active video modal if currently open
    if (activeVideoModal && activeVideoModal.id === videoId) {
      setActiveVideoModal((prev) => {
        if (!prev) return null;
        const updatedTimed = prev.timedComments ? [...prev.timedComments] : [];
        if (timestampSeconds !== undefined && timestampTag) {
          updatedTimed.push({
            id: newComment.id,
            videoId,
            timestampSeconds,
            timestampFormatted: timestampTag,
            author: { ...newComment.author, isMe: true },
            content,
            createdAt: 'Just now',
            likes: 0,
          });
        }
        return {
          ...prev,
          commentsCount: prev.commentsCount + 1,
          timedComments: updatedTimed,
        };
      });
    }
  };

  const handleLikeComment = (videoId: string, commentId: string) => {
    setComments((prev) => {
      const list = prev[videoId] || [];
      return {
        ...prev,
        [videoId]: list.map((c) =>
          c.id === commentId ? { ...c, likes: c.likes + 1, isLikedByUser: true } : c
        ),
      };
    });
  };

  const handleSendWhatsAppMessage = (
    roomId: string,
    text: string,
    quoteVerse?: { reference: string; text: string },
    quoteVideo?: { title: string; youtubeId: string; timestampFormatted?: string }
  ) => {
    const newMsg: WhatsAppMessage = {
      id: `m-${Date.now()}`,
      roomId,
      senderName: userProfile.name || (authMode === 'admin' ? 'Sanctuary Sovereign' : 'You'),
      senderAvatar: userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      isMe: true,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quoteVerse,
      quoteVideo,
      status: 'delivered',
    };

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMsg],
    }));

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              lastMessage: text,
              lastMessageTime: 'Just now',
            }
          : r
      )
    );
  };

  const handleOpenWhatsAppForVerse = (verse: BibleVerse) => {
    const existingRoom = rooms.find(
      (r) => r.type === 'verse' && r.targetReference === verse.reference
    );

    let targetRoomId = existingRoom?.id;

    if (!existingRoom) {
      targetRoomId = `room-verse-${verse.bookId}-${verse.chapter}-${verse.verse}`;
      const newRoom: WhatsAppRoom = {
        id: targetRoomId,
        title: `${verse.reference} Exegesis Room`,
        subtitle: `Verse Discussion · KJV Holy Bible`,
        avatar: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=100&h=100&fit=crop',
        type: 'verse',
        targetReference: verse.reference,
        unreadCount: 0,
        lastMessage: `Study group created for ${verse.reference}`,
        lastMessageTime: 'Just now',
      };
      setRooms((prev) => [newRoom, ...prev]);
      setMessages((prev) => ({
        ...prev,
        [targetRoomId!]: [
          {
            id: `msg-${Date.now()}`,
            roomId: targetRoomId!,
            senderName: 'Veritas Scribe',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
            isMe: false,
            text: `Welcome to the dedicated exegesis room for ${verse.reference}. Feel free to link your favorite sermons and textual commentary!`,
            timestamp: 'Just now',
            quoteVerse: {
              reference: verse.reference,
              text: verse.text,
            },
            status: 'read',
          },
        ],
      }));
    }

    setActiveWhatsAppRoomId(targetRoomId!);
    setIsWhatsAppOpen(true);
  };

  const handleOpenWhatsAppForVideo = (video: VideoLink) => {
    const existingRoom = rooms.find((r) => r.videoId === video.id);
    let targetRoomId = existingRoom?.id;

    if (!existingRoom) {
      targetRoomId = `room-video-${video.id}`;
      const newRoom: WhatsAppRoom = {
        id: targetRoomId,
        title: `${video.speaker}: ${video.title.slice(0, 28)}...`,
        subtitle: `Video Discussion · ${video.verses.join(', ')}`,
        avatar: `https://img.youtube.com/vi/${video.youtubeId}/default.jpg`,
        type: 'video',
        videoId: video.id,
        unreadCount: 0,
        lastMessage: `Discussion for ${video.title}`,
        lastMessageTime: 'Just now',
      };
      setRooms((prev) => [newRoom, ...prev]);
      setMessages((prev) => ({
        ...prev,
        [targetRoomId!]: [
          {
            id: `msg-${Date.now()}`,
            roomId: targetRoomId!,
            senderName: 'Scripture With Links Host',
            senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
            isMe: false,
            text: `Open conversation regarding "${video.title}" linked to ${video.verses.join(', ')}.`,
            timestamp: 'Just now',
            quoteVideo: {
              title: video.title,
              youtubeId: video.youtubeId,
              timestampFormatted: video.timestampFormatted,
            },
            status: 'read',
          },
        ],
      }));
    }

    setActiveWhatsAppRoomId(targetRoomId!);
    setIsWhatsAppOpen(true);
  };

  // Connect anonymous peer into WhatsApp private room
  const handleConnectPeer = (peer: AnonymousTrailPeer) => {
    const roomId = `room-peer-${peer.id}`;
    const existing = rooms.find((r) => r.id === roomId);

    if (!existing) {
      const newRoom: WhatsAppRoom = {
        id: roomId,
        title: `Anonymous Study: ${peer.pseudonym}`,
        subtitle: `${peer.overlapPercentage}% Trail Match · In ${peer.currentFocusBook} ${peer.currentFocusChapter}`,
        avatar: peer.avatar,
        type: 'companion',
        companionPseudonym: peer.pseudonym,
        unreadCount: 0,
        lastMessage: `Connected anonymously to explore ${peer.recentStudies.join(', ')} together.`,
        lastMessageTime: 'Just now',
      };

      setRooms((prev) => [newRoom, ...prev]);
      setMessages((prev) => ({
        ...prev,
        [roomId]: [
          {
            id: `m-peer-init-${Date.now()}`,
            roomId,
            senderName: peer.pseudonym,
            senderAvatar: peer.avatar,
            isMe: false,
            text: `Greetings fellow Berean! I am following a similar scripture trail in ${peer.currentFocusBook} ${peer.currentFocusChapter}. Glad to study the Word together!`,
            timestamp: 'Just now',
            quoteVerse: {
              reference: peer.recentStudies[0] || `${peer.currentFocusBook} ${peer.currentFocusChapter}:1`,
              text: 'Iron sharpeneth iron; so a man sharpeneth the countenance of his friend. (Proverbs 27:17)',
            },
            status: 'read',
          },
        ],
      }));

      setPeers((prev) =>
        prev.map((p) => (p.id === peer.id ? { ...p, isChatInitiated: true } : p))
      );
    }

    setActiveWhatsAppRoomId(roomId);
    setIsWhatsAppOpen(true);
  };

  const handleToggleChapterCompleted = (chapterKey: string) => {
    const lower = chapterKey.toLowerCase();
    setProgress((prev) => {
      const exists = prev.completedChapters.some((c) => c.toLowerCase() === lower);
      const updated = exists
        ? prev.completedChapters.filter((c) => c.toLowerCase() !== lower)
        : [...prev.completedChapters, chapterKey];
      return {
        ...prev,
        completedChapters: updated,
      };
    });
  };

  const handleCreateTopicCategory = (name: string, description: string) => {
    const newCat: TopicCategory = {
      id: `cat-${Date.now()}`,
      name,
      description,
      subcategories: [
        {
          id: `sub-${Date.now()}-1`,
          parentCategoryId: `cat-${Date.now()}`,
          name: 'General Discussion',
          description: `Expositions under ${name}`,
          count: 0,
        },
      ],
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleCreateTopicSubcategory = (parentCategoryId: string, name: string, description: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== parentCategoryId) return cat;
        const newSub = {
          id: `sub-${Date.now()}`,
          parentCategoryId,
          name,
          description,
          count: 0,
        };
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSub],
        };
      })
    );
  };

  const handleJumpToBible = (bookId: string, chapter: number) => {
    setCurrentBookId(bookId);
    setCurrentChapter(chapter);
    setActiveTab('bible');
  };

  const handleLinkVerseFromReader = (ref: string) => {
    setPrefillVerseRef(ref);
    setIsPostModalOpen(true);
  };

  const handleOpenVideo = (video: VideoLink) => {
    setActiveVideoModal(video);
    const chKey = `${video.primaryBookId}:${video.primaryChapter}`;
    setProgress((prev) => ({
      ...prev,
      watchedVideoIds: Array.from(new Set([...prev.watchedVideoIds, video.id])),
      totalWatchTimeMinutes: prev.totalWatchTimeMinutes + 12,
      exploredChapters: Array.from(new Set([...(prev.exploredChapters || []), chKey])),
    }));
  };

  const handleAddBulkVideos = (bulkList: Omit<VideoLink, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>[]) => {
    const formatted: VideoLink[] = bulkList.map((v, i) => ({
      ...v,
      id: `bulk-${Date.now()}-${i}`,
      createdAt: 'Just now',
      likesCount: 1,
      commentsCount: 0,
    }));
    setVideoLinks((prev) => [...formatted, ...prev]);

    // Create corresponding WhatsApp study rooms
    const newRooms: WhatsAppRoom[] = formatted.map((newVideo) => ({
      id: `room-video-${newVideo.id}`,
      title: `${newVideo.speaker}: ${newVideo.title.slice(0, 32)}...`,
      subtitle: `Video Discussion · ${newVideo.verses.join(', ')}`,
      avatar: `https://img.youtube.com/vi/${newVideo.youtubeId}/default.jpg`,
      type: 'video' as const,
      videoId: newVideo.id,
      unreadCount: 0,
      lastMessage: `Bulk uploaded exegesis on ${newVideo.verses.join(', ')}`,
      lastMessageTime: 'Just now',
    }));
    setRooms((prev) => [...newRooms, ...prev]);

    // Update progress with added link IDs
    setProgress((prev) => ({
      ...prev,
      userAddedLinkIds: Array.from(new Set([...(prev.userAddedLinkIds || []), ...formatted.map((f) => f.id)])),
    }));

    setSystemToast({
      message: `Successfully uploaded ${formatted.length} video exegesis links to your phone sanctuary!`,
      type: 'success',
    });
  };

  const handleUploadConversation = (
    title: string,
    rawText: string,
    detectedVerses: string[],
    targetRoomId?: string
  ) => {
    const newConv: ConversationUpload = {
      id: `conv-${Date.now()}`,
      title,
      source: 'whatsapp',
      rawText,
      detectedVerses,
      createdAt: new Date().toISOString().split('T')[0],
      uploadedBy: userProfile.name,
      messageCount: rawText.split('\n').filter((l) => l.trim().length > 0).length,
    };
    setConversations((prev) => [newConv, ...prev]);

    const roomId = targetRoomId || `room-conv-${newConv.id}`;
    const newRoom: WhatsAppRoom = {
      id: roomId,
      title: title.slice(0, 36),
      subtitle: detectedVerses.length > 0 ? `Verses: ${detectedVerses.slice(0, 2).join(', ')}` : 'Uploaded Chat Transcript',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
      type: 'general',
      unreadCount: 0,
      lastMessage: `Conversation uploaded (${newConv.messageCount} messages)`,
      lastMessageTime: 'Just now',
    };
    setRooms((prev) => [newRoom, ...prev.filter((r) => r.id !== roomId)]);
    setMessages((prev) => ({
      ...prev,
      [roomId]: [
        {
          id: `msg-conv-intro-${Date.now()}`,
          roomId,
          senderName: userProfile.name,
          senderAvatar: userProfile.avatar,
          isMe: true,
          text: `📜 Uploaded conversation archive: "${title}". Verses detected: ${detectedVerses.join(', ') || 'General Fellowship'}.`,
          timestamp: 'Just now',
          status: 'read',
        },
      ],
    }));

    setSystemToast({
      message: `Uploaded conversation archive "${title}" and opened study room!`,
      type: 'success',
    });
  };

  const handleExportBackup = () => {
    const jsonStr = exportSanctuaryData(
      userProfile,
      sanctuarySpace,
      progress,
      videoLinks,
      comments,
      categories,
      rooms,
      messages,
      conversations
    );
    downloadSanctuaryJSON(jsonStr, `scripture-with-links-sanctuary-${sanctuarySpace.code.toLowerCase()}.json`);
    setSystemToast({
      message: 'Full sanctuary block backup exported and saved to device storage!',
      type: 'success',
    });
  };

  const handleImportBackup = (importedData: any): boolean => {
    if (!importedData || !importedData.videoLinks) return false;
    try {
      if (importedData.userProfile) setUserProfile(importedData.userProfile);
      if (importedData.sanctuarySpace) setSanctuarySpace(importedData.sanctuarySpace);
      if (importedData.userProgress) setProgress(importedData.userProgress);
      if (Array.isArray(importedData.videoLinks)) setVideoLinks(importedData.videoLinks);
      if (importedData.comments) setComments(importedData.comments);
      if (Array.isArray(importedData.categories)) setCategories(importedData.categories);
      if (Array.isArray(importedData.whatsappRooms)) setRooms(importedData.whatsappRooms);
      if (importedData.whatsappMessages) setMessages(importedData.whatsappMessages);
      if (Array.isArray(importedData.conversationUploads)) setConversations(importedData.conversationUploads);
      setSystemToast({
        message: 'Sanctuary block successfully restored from on-device backup file!',
        type: 'success',
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleResetToBaseline = () => {
    setVideoLinks(INITIAL_VIDEO_LINKS);
    setComments(INITIAL_COMMENTS);
    setRooms(INITIAL_WHATSAPP_ROOMS);
    setMessages(INITIAL_WHATSAPP_MESSAGES);
    setCategories(INITIAL_TOPIC_CATEGORIES);
    setPeers(INITIAL_ANONYMOUS_PEERS);
    setProgress(INITIAL_USER_PROGRESS);
    setUserProfile(DEFAULT_USER_PROFILE);
    setSanctuarySpace(DEFAULT_SANCTUARY_SPACE);
    setConversations(INITIAL_CONVERSATION_UPLOADS);
    setAuthMode('admin');
    setSystemToast({
      message: 'Reset sanctuary to original baseline.',
      type: 'info',
    });
  };

  const handleSelectMode = (mode: AuthMode, updatedProfile?: Partial<UserProfile>, spaceCodeToJoin?: string) => {
    setAuthMode(mode);
    if (updatedProfile) {
      setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
    }
    if (spaceCodeToJoin) {
      setSanctuarySpace((prev) => ({
        ...prev,
        code: spaceCodeToJoin,
        name: `Sanctuary (${spaceCodeToJoin})`,
      }));
    }
    setSystemToast({
      message: mode === 'admin'
        ? 'Sanctuary Sovereign Admin Mode active: You develop and own this entire phone installation!'
        : mode === 'guest'
        ? 'Guest Mode active: 100% private exploration without sign-in.'
        : `Connected to space ${spaceCodeToJoin || sanctuarySpace.code} as Member.`,
      type: 'success',
    });
  };

  const handleAddSpaceMember = (newMem: SpaceMember) => {
    setSanctuarySpace((prev) => ({
      ...prev,
      members: [newMem, ...prev.members],
    }));
    setSystemToast({
      message: `Added ${newMem.name} to space member registry.`,
      type: 'success',
    });
  };

  const handleRemoveSpaceMember = (memberId: string) => {
    setSanctuarySpace((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPostModal={() => {
          setPrefillVerseRef(undefined);
          setIsPostModalOpen(true);
        }}
        onOpenUploadModal={() => setIsUploadManagerModalOpen(true)}
        onOpenSpaceAdminModal={() => setIsSpaceAdminModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onToggleWhatsApp={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
        isWhatsAppOpen={isWhatsAppOpen}
        totalLinksCount={videoLinks.length}
        userProfile={userProfile}
        authMode={authMode}
      />

      {/* Floating or Top System Toast Notification */}
      {systemToast && (
        <div className="bg-amber-900 text-amber-50 px-4 py-2 text-xs flex items-center justify-between shadow-md border-b border-amber-700 animate-fadeIn z-20">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{systemToast.message}</span>
          </div>
          <button
            onClick={() => setSystemToast(null)}
            className="text-amber-300 hover:text-white p-1 cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sovereign Phone Ownership Status Ribbon */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-300 text-xs py-2 px-4 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {authMode === 'admin' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                SOVEREIGN OWNER
              </span>
            ) : authMode === 'member' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-500/30">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                FELLOWSHIP MEMBER
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-700 text-stone-300 font-mono text-[11px] border border-stone-600">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                GUEST PILGRIM (NO SIGN-IN)
              </span>
            )}

            <span className="text-[11px] text-stone-400">
              {authMode === 'admin'
                ? `You develop and administer this complete block installation. Space: "${sanctuarySpace.name}"`
                : authMode === 'member'
                ? `Connected to "${sanctuarySpace.name}" (Host: ${sanctuarySpace.hostName})`
                : '100% private phone sandbox. No telemetry, zero subscription fees.'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>On-Device Storage</span>
            </span>

            {authMode === 'admin' && (
              <button
                onClick={() => setIsSpaceAdminModalOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Invite Members</span>
              </button>
            )}

            <button
              onClick={() => setIsUploadManagerModalOpen(true)}
              className="text-stone-300 hover:text-white font-medium hover:underline cursor-pointer"
            >
              Manage Uploads
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'bible' && (
          <BibleReader
            currentBookId={currentBookId}
            currentChapter={currentChapter}
            onSelectBookAndChapter={(book, ch) => {
              setCurrentBookId(book);
              setCurrentChapter(ch);
            }}
            videoLinks={videoLinks}
            onOpenVideo={handleOpenVideo}
            onLinkVerse={handleLinkVerseFromReader}
            onOpenWhatsAppForVerse={handleOpenWhatsAppForVerse}
          />
        )}

        {activeTab === 'map' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <PilgrimMap
              progress={progress}
              videoLinks={videoLinks}
              onSelectBookChapter={handleJumpToBible}
              onOpenVideoById={(vidId) => {
                const v = videoLinks.find((item) => item.id === vidId);
                if (v) handleOpenVideo(v);
              }}
            />
          </div>
        )}

        {activeTab === 'topics' && (
          <TopicExplorer
            categories={categories}
            videoLinks={videoLinks}
            onOpenVideo={handleOpenVideo}
            onJumpToBibleVerse={handleJumpToBible}
            onOpenWhatsAppForVideo={handleOpenWhatsAppForVideo}
            onCreateCategory={handleCreateTopicCategory}
            onCreateSubcategory={handleCreateTopicSubcategory}
            onOpenPostModal={() => {
              setPrefillVerseRef(undefined);
              setIsPostModalOpen(true);
            }}
          />
        )}

        {activeTab === 'archive' && (
          <VideoArchive
            videoLinks={videoLinks}
            onOpenVideo={handleOpenVideo}
            onJumpToBibleVerse={handleJumpToBible}
            onLikeVideo={handleLikeVideo}
            onOpenWhatsAppForVideo={handleOpenWhatsAppForVideo}
            onOpenPostModal={() => {
              setPrefillVerseRef(undefined);
              setIsPostModalOpen(true);
            }}
          />
        )}

        {activeTab === 'density' && (
          <DensityHeatmap
            videoLinks={videoLinks}
            onSelectBook={(book, ch) => {
              setCurrentBookId(book);
              setCurrentChapter(ch);
              setActiveTab('bible');
            }}
            onOpenPostModal={() => {
              setPrefillVerseRef(undefined);
              setIsPostModalOpen(true);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <ProgressAnalytics
            progress={progress}
            videoLinks={videoLinks}
            comments={comments}
            rooms={rooms}
            messages={messages}
            onToggleChapterCompleted={handleToggleChapterCompleted}
            onJumpToBibleVerse={handleJumpToBible}
            onOpenVideo={handleOpenVideo}
            onOpenWhatsAppRoom={(roomId) => {
              setActiveWhatsAppRoomId(roomId);
              setIsWhatsAppOpen(true);
            }}
          />
        )}

        {activeTab === 'pilgrims' && (
          <TrailCompanions
            peers={peers}
            userProgress={progress}
            onConnectPeer={handleConnectPeer}
            onJumpToBibleVerse={handleJumpToBible}
          />
        )}
      </main>

      {/* Floating WhatsApp Quick Action Button (accessible from ANY point in the app!) */}
      <button
        onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer border-2 border-white"
        title="Open WhatsApp Fellowship Chat from any point"
        aria-label="Open WhatsApp Fellowship Chat"
      >
        <MessageSquare className="w-7 h-7 fill-current" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          4
        </span>
      </button>

      {/* WhatsApp Open Conversation Drawer */}
      <WhatsAppSpace
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        rooms={rooms}
        activeRoomId={activeWhatsAppRoomId}
        onSelectRoom={(id) => setActiveWhatsAppRoomId(id)}
        messages={messages}
        onSendMessage={handleSendWhatsAppMessage}
        onJumpToBibleVerse={handleJumpToBible}
        onOpenVideoById={(vidId) => {
          const v = videoLinks.find((item) => item.id === vidId);
          if (v) handleOpenVideo(v);
        }}
        onOpenSpaceAdmin={() => setIsSpaceAdminModalOpen(true)}
        spaceName={sanctuarySpace.name}
        hostName={sanctuarySpace.hostName}
        isHostAdmin={authMode === 'admin'}
      />

      {/* Video Modal Player with Timed Comments Scrub Rail & Extension HUD */}
      {activeVideoModal && (
        <VideoModal
          video={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          comments={comments[activeVideoModal.id] || []}
          onAddComment={handleAddComment}
          onLikeVideo={handleLikeVideo}
          onLikeComment={handleLikeComment}
          onJumpToBibleVerse={handleJumpToBible}
          onOpenWhatsAppForVideo={handleOpenWhatsAppForVideo}
        />
      )}

      {/* Post Video Link Modal with Topic & Structured Summary */}
      <PostVideoModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setPrefillVerseRef(undefined);
        }}
        categories={categories}
        onSaveVideo={handleAddVideo}
        prefillVerseRef={prefillVerseRef}
      />

      {/* Sovereign Admin Space Configuration & Peer Invite Modal */}
      <SpaceAdminModal
        isOpen={isSpaceAdminModalOpen}
        onClose={() => setIsSpaceAdminModalOpen(false)}
        space={sanctuarySpace}
        userProfile={userProfile}
        onUpdateSpace={setSanctuarySpace}
        onAddMember={handleAddSpaceMember}
        onRemoveMember={handleRemoveSpaceMember}
        onOpenWhatsApp={() => {
          setIsSpaceAdminModalOpen(false);
          setIsWhatsAppOpen(true);
        }}
      />

      {/* Account Mode Switcher Modal (No-login vs Sovereign Admin vs Member) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentMode={authMode}
        userProfile={userProfile}
        onSelectMode={handleSelectMode}
      />

      {/* Repository & Upload Manager Modal (Links, Conversations, JSON Backup) */}
      <UploadManagerModal
        isOpen={isUploadManagerModalOpen}
        onClose={() => setIsUploadManagerModalOpen(false)}
        categories={categories}
        onAddVideo={handleAddVideo}
        onAddBulkVideos={handleAddBulkVideos}
        onUploadConversation={handleUploadConversation}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetToBaseline={handleResetToBaseline}
        conversations={conversations}
      />

      {/* Minimal Curatorial Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-display-sacred font-bold text-stone-900 tracking-wider">
              SCRIPTURE WITH LINKS
            </span>
            <span aria-hidden="true">·</span>
            <span>King James Bible &amp; YouTube Theological Exposition Network</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600">
            <span>{videoLinks.length} Links Populated</span>
            <span aria-hidden="true">·</span>
            <span>66 Canonical Books</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="text-emerald-700 hover:underline font-medium cursor-pointer"
            >
              Open WhatsApp Fellowship
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
