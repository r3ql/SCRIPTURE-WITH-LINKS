import React, { useState, useMemo } from 'react';
import type { UserBibleProgress, VideoLink, VideoComment, WhatsAppRoom, WhatsAppMessage } from '../types/index.ts';
import { calculateCanonicalBibleProgress, formatWatchTime, TOTAL_BIBLE_CHAPTERS } from '../utils/analyticsAndMatchUtils.ts';
import { BIBLE_BOOKS } from '../data/kjvBibleData.ts';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Film,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Award,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  Calendar
} from 'lucide-react';

interface ProgressAnalyticsProps {
  progress: UserBibleProgress;
  videoLinks: VideoLink[];
  comments: Record<string, VideoComment[]>;
  rooms: WhatsAppRoom[];
  messages: Record<string, WhatsAppMessage[]>;
  onToggleChapterCompleted: (chapterKey: string) => void;
  onJumpToBibleVerse: (bookId: string, chapter: number) => void;
  onOpenVideo: (video: VideoLink) => void;
  onOpenWhatsAppRoom: (roomId: string) => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  progress,
  videoLinks,
  comments,
  rooms,
  messages,
  onToggleChapterCompleted,
  onJumpToBibleVerse,
  onOpenVideo,
  onOpenWhatsAppRoom,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'discussions' | 'checkoff'>('overview');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const stats = useMemo(() => {
    return calculateCanonicalBibleProgress(progress.completedChapters);
  }, [progress.completedChapters]);

  // Aggregate all comments ever made by the user
  const userCommentsHistory = useMemo(() => {
    const list: Array<{
      video: VideoLink;
      comment: VideoComment;
    }> = [];

    Object.entries(comments).forEach(([vidId, commentList]) => {
      const vid = videoLinks.find((v) => v.id === vidId);
      if (!vid) return;

      commentList.forEach((c) => {
        if (c.author.handle === '@berean_disciple' || c.author.name.includes('You')) {
          list.push({ video: vid, comment: c });
        }
      });
    });

    return list;
  }, [comments, videoLinks]);

  // Discussions the user started in WhatsApp / Fellowship rooms
  const userDiscussionsHistory = useMemo(() => {
    return rooms.map((room) => {
      const roomMsgs = messages[room.id] || [];
      const userMsgs = roomMsgs.filter((m) => m.isMe);
      const firstUserMsg = userMsgs[0];
      const otherMsgsCount = roomMsgs.filter((m) => !m.isMe).length;

      return {
        room,
        totalMessages: roomMsgs.length,
        userMessagesCount: userMsgs.length,
        repliesReceived: otherMsgsCount,
        firstMessage: firstUserMsg?.text || room.lastMessage,
        lastActive: room.lastMessageTime || 'Recently',
      };
    });
  }, [rooms, messages]);

  // Watched videos detail
  const watchedVideosList = useMemo(() => {
    return progress.watchedVideoIds.map((vidId) => {
      const vid = videoLinks.find((v) => v.id === vidId);
      const watchedSecs = progress.watchedSeconds[vidId] || 300;
      return {
        video: vid,
        watchedSecs,
      };
    }).filter((item) => item.video !== undefined);
  }, [progress, videoLinks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-stone-200">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-900 font-semibold">
          Whole Bible Canonical Journey &amp; Activeness Tracker
        </span>
        <h1 className="text-3xl font-serif-reading font-semibold text-stone-900 mt-1">
          Through The Whole Bible Analytics
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl font-sans">
          Track your progress through all 1,189 chapters of the Holy Bible, measure video exposition watch-time and participation, and review all discussions and comments you have initiated.
        </p>

        {/* 4 Macro Key Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Bible Progress</span>
              <BookOpen className="w-4 h-4 text-amber-800" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {stats.overallPercentage}%
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              {stats.totalChaptersRead} of {TOTAL_BIBLE_CHAPTERS} chapters
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Exposition Time</span>
              <Clock className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {formatWatchTime(progress.totalWatchTimeMinutes)}
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              {progress.watchedVideoIds.length} videos studied
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Comments Posted</span>
              <MessageSquare className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {userCommentsHistory.length}
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              with timestamp anchors
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Discussions Active</span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {userDiscussionsHistory.length}
            </div>
            <span className="text-[11px] text-stone-500 font-mono">
              Fellowship study rooms
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-900 text-white font-semibold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Canonical Completion Overview
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'comments'
              ? 'bg-amber-900 text-white font-semibold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          My Comments &amp; Timestamps ({userCommentsHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('discussions')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'discussions'
              ? 'bg-amber-900 text-white font-semibold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Fellowship Threads ({userDiscussionsHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('checkoff')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'checkoff'
              ? 'bg-amber-900 text-white font-semibold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Chapter Study Check-off
        </button>
      </div>

      {/* TAB 1: Canonical Completion Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dual Testament Progress Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Testament */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-bold">
                    Old Testament (39 Books)
                  </span>
                  <h3 className="font-serif-reading text-xl font-bold text-stone-900">
                    Law, History, Poetry &amp; Prophets
                  </h3>
                </div>
                <span className="text-2xl font-mono font-bold text-stone-900 tabular-nums">
                  {stats.otPercentage}%
                </span>
              </div>

              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-800 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.otPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>{stats.otChaptersRead} chapters completed</span>
                <span>{stats.otTotalChapters} total OT chapters</span>
              </div>
            </div>

            {/* New Testament */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-bold">
                    New Testament (27 Books)
                  </span>
                  <h3 className="font-serif-reading text-xl font-bold text-stone-900">
                    Gospels, Epistles &amp; Revelation
                  </h3>
                </div>
                <span className="text-2xl font-mono font-bold text-stone-900 tabular-nums">
                  {stats.ntPercentage}%
                </span>
              </div>

              <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.ntPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>{stats.ntChaptersRead} chapters completed</span>
                <span>{stats.ntTotalChapters} total NT chapters</span>
              </div>
            </div>
          </div>

          {/* Canonical Divisions Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <h3 className="font-serif-reading text-lg font-bold text-stone-900 mb-4">
              Canonical Divisions Progress
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.divisionProgress.map((div) => (
                <div key={div.division} className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                    <span>{div.division}</span>
                    <span className="font-mono tabular-nums text-amber-900">{div.percentage}%</span>
                  </div>

                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-800 h-full rounded-full transition-all duration-300"
                      style={{ width: `${div.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span>{div.read} read</span>
                    <span>{div.total} chapters</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Videos Watched & Activeness Log */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-reading text-lg font-bold text-stone-900">
                Watched Video Expositions &amp; Activeness Log
              </h3>
              <span className="text-xs font-mono text-stone-500">
                {watchedVideosList.length} expositions completed
              </span>
            </div>

            <div className="space-y-3">
              {watchedVideosList.map(({ video, watchedSecs }) => {
                if (!video) return null;
                return (
                  <div
                    key={video.id}
                    onClick={() => onOpenVideo(video)}
                    className="p-3.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-xs text-stone-900 truncate">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-sans mt-0.5">
                          <span>{video.speaker}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-amber-900 font-semibold">{video.verses.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center text-xs">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono text-[11px]">
                        100% Watched
                      </span>
                      <button className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded text-stone-800 font-medium cursor-pointer">
                        Re-watch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: My Comments & Timestamps History */}
      {activeTab === 'comments' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif-reading text-xl font-bold text-stone-900">
                All Comments You Have Ever Made
              </h3>
              <p className="text-xs text-stone-500">
                Complete audit trail of your exegesis notes, timestamp anchors, and replies.
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500 tabular-nums">
              {userCommentsHistory.length} comment{userCommentsHistory.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            {userCommentsHistory.length === 0 ? (
              <p className="text-xs text-stone-400 italic text-center py-6">
                You haven't posted any comments yet. Watch a video and leave a timestamped thought!
              </p>
            ) : (
              userCommentsHistory.map(({ video, comment }) => (
                <div
                  key={comment.id}
                  className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        {video.verses.join(' · ')}
                      </span>
                      <span className="font-semibold text-stone-800">{video.title}</span>
                      {comment.timestampTag && (
                        <span className="font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          @{comment.timestampTag}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {comment.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 font-serif-reading text-[13px] leading-relaxed pl-2">
                    "{comment.content}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px] text-stone-500">
                    <span className="tabular-nums font-mono">{comment.likes} likes received</span>
                    <button
                      onClick={() => onOpenVideo(video)}
                      className="text-amber-900 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>View in Video Player</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Fellowship Discussions History */}
      {activeTab === 'discussions' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif-reading text-xl font-bold text-stone-900">
                Discussions You Have Participated In or Started
              </h3>
              <p className="text-xs text-stone-500">
                Real-time tracking of theological chats, responses received, and conversation progression.
              </p>
            </div>
            <span className="text-xs font-mono text-stone-500 tabular-nums">
              {userDiscussionsHistory.length} thread{userDiscussionsHistory.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="space-y-3">
            {userDiscussionsHistory.map((item) => (
              <div
                key={item.room.id}
                className="p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-emerald-600/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-stone-900">
                      {item.room.title}
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {item.room.type}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-serif-reading text-[13px] italic truncate">
                    Latest: "{item.room.lastMessage || 'Open fellowship'}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono">
                    <span>{item.totalMessages} total messages</span>
                    <span>·</span>
                    <span>{item.userMessagesCount} by you</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold">{item.repliesReceived} replies received</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenWhatsAppRoom(item.room.id)}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium cursor-pointer shrink-0"
                >
                  Enter Room
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Chapter Study Check-off Matrix */}
      {activeTab === 'checkoff' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif-reading text-xl font-bold text-stone-900">
                Whole Bible Chapter Check-off Matrix
              </h3>
              <p className="text-xs text-stone-500">
                Click any chapter to mark it read / studied as you journey through the 66 canonical books.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Division:</span>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="text-xs bg-stone-100 border border-stone-200 rounded-md px-2 py-1"
              >
                <option value="all">All Divisions</option>
                <option value="Law">Law (Torah)</option>
                <option value="History">History</option>
                <option value="Poetry & Wisdom">Poetry &amp; Wisdom</option>
                <option value="Major Prophets">Major Prophets</option>
                <option value="Gospels">Gospels</option>
                <option value="Pauline Epistles">Pauline Epistles</option>
              </select>
            </div>
          </div>

          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
            {BIBLE_BOOKS.filter((b) => selectedDivision === 'all' || b.category === selectedDivision).map((book) => {
              return (
                <div key={book.id} className="border border-stone-100 rounded-xl p-3.5 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif-reading font-bold text-sm text-stone-900">
                      {book.name} <span className="text-xs font-normal text-stone-500">({book.testament})</span>
                    </span>
                    <button
                      onClick={() => onJumpToBibleVerse(book.id, 1)}
                      className="text-[11px] text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read book</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: book.chaptersCount }, (_, i) => i + 1).map((ch) => {
                      const key = `${book.id.toLowerCase()}:${ch}`;
                      const isDone = progress.completedChapters.some((c) => c.toLowerCase() === key);

                      return (
                        <button
                          key={ch}
                          onClick={() => onToggleChapterCompleted(key)}
                          className={`w-7 h-7 rounded text-[11px] font-mono font-medium transition-all cursor-pointer flex items-center justify-center ${
                            isDone
                              ? 'bg-amber-900 text-white font-bold shadow-2xs'
                              : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                          }`}
                          title={`${book.name} Chapter ${ch} (${isDone ? 'Studied' : 'Click to complete'})`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
