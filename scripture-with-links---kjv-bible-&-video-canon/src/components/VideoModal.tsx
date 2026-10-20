import React, { useState, useEffect } from 'react';
import type { VideoLink, VideoComment, TimedComment } from '../types/index.ts';
import { formatSecondsToTime, parseTimeToSeconds } from '../utils/bibleUtils.ts';
import { findActiveTimedComment } from '../utils/analyticsAndMatchUtils.ts';
import {
  X,
  Play,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Clock,
  Send,
  ThumbsUp,
  CornerDownRight,
  Sparkles,
  Check,
  Radio,
  FileText,
  Sliders,
  Pin
} from 'lucide-react';

interface VideoModalProps {
  video: VideoLink | null;
  onClose: () => void;
  comments: VideoComment[];
  onAddComment: (videoId: string, content: string, timestampTag?: string, timestampSeconds?: number) => void;
  onLikeVideo: (videoId: string) => void;
  onLikeComment: (videoId: string, commentId: string) => void;
  onJumpToBibleVerse: (bookId: string, chapter: number) => void;
  onOpenWhatsAppForVideo: (video: VideoLink) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  onClose,
  comments,
  onAddComment,
  onLikeVideo,
  onLikeComment,
  onJumpToBibleVerse,
  onOpenWhatsAppForVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'timed' | 'summary' | 'all'>('timed');
  const [newCommentText, setNewCommentText] = useState('');
  const [targetTimestampSeconds, setTargetTimestampSeconds] = useState<number>(
    video?.timestampSeconds || 0
  );
  const [currentPlayheadTime, setCurrentPlayheadTime] = useState<number>(
    video?.timestampSeconds || 0
  );
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTimedCommentId, setSelectedTimedCommentId] = useState<string | null>(null);
  const [isExtensionOverlayActive, setIsExtensionOverlayActive] = useState(true);

  // Initialize and synchronize player timestamp
  useEffect(() => {
    if (video?.timestampSeconds) {
      setTargetTimestampSeconds(video.timestampSeconds);
      setCurrentPlayheadTime(video.timestampSeconds);
    }
  }, [video]);

  // Combine video's built-in timed comments and community comments with timestamps
  const allTimedComments: TimedComment[] = React.useMemo(() => {
    if (!video) return [];
    const seedTimed: TimedComment[] = video.timedComments || [];

    const fromCommunity: TimedComment[] = comments
      .filter((c) => c.timestampTag || c.timestampSeconds !== undefined)
      .map((c) => {
        const sec = c.timestampSeconds !== undefined
          ? c.timestampSeconds
          : parseTimeToSeconds(c.timestampTag || '0');
        return {
          id: c.id,
          videoId: c.videoId,
          timestampSeconds: sec,
          timestampFormatted: c.timestampTag || formatSecondsToTime(sec),
          author: c.author,
          content: c.content,
          createdAt: c.createdAt,
          likes: c.likes,
        };
      });

    // Merge and deduplicate by id, sort chronologically by timestamp
    const map = new Map<string, TimedComment>();
    [...seedTimed, ...fromCommunity].forEach((item) => map.set(item.id, item));
    return Array.from(map.values()).sort((a, b) => a.timestampSeconds - b.timestampSeconds);
  }, [video, comments]);

  // Find active comment matching current playhead time
  const activeTimedComment = React.useMemo(() => {
    if (selectedTimedCommentId) {
      const found = allTimedComments.find((c) => c.id === selectedTimedCommentId);
      if (found) return found;
    }
    return findActiveTimedComment(allTimedComments, currentPlayheadTime);
  }, [allTimedComments, currentPlayheadTime, selectedTimedCommentId]);

  if (!video) return null;

  const handlePostTimedComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onAddComment(
      video.id,
      newCommentText.trim(),
      formatSecondsToTime(targetTimestampSeconds),
      targetTimestampSeconds
    );
    setNewCommentText('');
  };

  const handleSeekToTimestamp = (seconds: number, commentId?: string) => {
    setTargetTimestampSeconds(seconds);
    setCurrentPlayheadTime(seconds);
    if (commentId) setSelectedTimedCommentId(commentId);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `${video.title} on Scripture With Links: ${video.youtubeUrl}`
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const totalDuration = video.durationSeconds || 600;
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?start=${targetTimestampSeconds}&autoplay=1`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono text-xs font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
              {video.verses.join(' · ')}
            </span>
            <span className="text-xs text-stone-500 font-sans truncate">
              {video.speaker} ({video.channelTitle})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenWhatsAppForVideo(video)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
              title="Open WhatsApp Fellowship Chat"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Room</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Video & In-Video Extension Overlay Player Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-stone-800 group">
            <iframe
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />

            {/* In-Video "Extension Overlay" HUD Popup */}
            {isExtensionOverlayActive && activeTimedComment && (
              <div className="absolute top-4 right-4 max-w-xs sm:max-w-sm z-20 bg-stone-900/90 backdrop-blur-md text-white p-3.5 rounded-xl border border-amber-500/40 shadow-xl transition-all animate-fadeIn">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-700/80 text-[10px] text-amber-300 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                    <span>TIMED EXEGESIS OVERLAY · @{activeTimedComment.timestampFormatted}</span>
                  </div>
                  <button
                    onClick={() => setSelectedTimedCommentId(null)}
                    className="text-stone-400 hover:text-white cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={activeTimedComment.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                    alt={activeTimedComment.author.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-stone-200">
                    {activeTimedComment.author.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {activeTimedComment.createdAt}
                  </span>
                </div>

                <p className="text-xs text-stone-100 font-serif-reading text-[13px] leading-relaxed mb-2">
                  "{activeTimedComment.content}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  <span>{activeTimedComment.likes} likes</span>
                  <button
                    onClick={() => handleSeekToTimestamp(activeTimedComment.timestampSeconds)}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Replay this timestamp</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Timeline Scrub Bar with Timed Comment Markers */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-800" />
                <span className="font-semibold text-stone-900">
                  Timestamped Discussions Scrub Rail
                </span>
                <span className="text-stone-400">({allTimedComments.length} marker{allTimedComments.length === 1 ? '' : 's'})</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsExtensionOverlayActive(!isExtensionOverlayActive)}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    isExtensionOverlayActive
                      ? 'bg-amber-100 text-amber-900 font-medium'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  Overlay {isExtensionOverlayActive ? 'ON' : 'OFF'}
                </button>
                <span className="font-mono text-xs tabular-nums text-stone-700">
                  {formatSecondsToTime(currentPlayheadTime)} / {formatSecondsToTime(totalDuration)}
                </span>
              </div>
            </div>

            {/* Visual Timeline Track with Clickable Markers */}
            <div className="relative w-full h-4 bg-stone-200 rounded-full cursor-pointer flex items-center">
              {/* Progress bar up to current playhead */}
              <div
                className="h-full bg-amber-800/40 rounded-full"
                style={{ width: `${Math.min(100, (currentPlayheadTime / totalDuration) * 100)}%` }}
              />

              {/* Timestamp Markers */}
              {allTimedComments.map((tc) => {
                const percent = Math.min(100, Math.max(0, (tc.timestampSeconds / totalDuration) * 100));
                const isSelected = selectedTimedCommentId === tc.id;
                return (
                  <button
                    key={tc.id}
                    onClick={() => handleSeekToTimestamp(tc.timestampSeconds, tc.id)}
                    style={{ left: `${percent}%` }}
                    className={`absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 transition-transform cursor-pointer hover:scale-125 z-10 ${
                      isSelected
                        ? 'bg-red-600 border-white scale-125 shadow-md'
                        : 'bg-amber-600 border-white shadow-2xs'
                    }`}
                    title={`Jump to ${tc.timestampFormatted}: "${tc.content.slice(0, 40)}..."`}
                  />
                );
              })}
            </div>

            {/* Quick jump pills to all comment timestamps */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-stone-500 mr-1">Jump to comment:</span>
              {allTimedComments.map((tc) => (
                <button
                  key={tc.id}
                  onClick={() => handleSeekToTimestamp(tc.timestampSeconds, tc.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-all ${
                    selectedTimedCommentId === tc.id
                      ? 'bg-amber-900 text-white font-bold'
                      : 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
                  }`}
                >
                  @{tc.timestampFormatted}
                </button>
              ))}
            </div>
          </div>

          {/* Video Metadata & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h2 className="text-xl sm:text-2xl font-serif-reading font-semibold text-stone-900 leading-tight">
                {video.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-sans">
                <span className="font-semibold text-stone-800">{video.speaker}</span>
                <span aria-hidden="true">·</span>
                <span>{video.channelTitle}</span>
                <span aria-hidden="true">·</span>
                <span>Posted by {video.postedBy.name}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => onLikeVideo(video.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-red-600 fill-red-600/30" />
                <span className="tabular-nums font-mono">{video.likesCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                title="Share video link"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  onJumpToBibleVerse(video.primaryBookId, video.primaryChapter);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read in KJV Bible</span>
              </button>
            </div>
          </div>

          {/* Tabs: Timed Comments vs Structured Summary */}
          <div className="border-b border-stone-200 flex items-center gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab('timed')}
              className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timed'
                  ? 'border-b-2 border-amber-900 text-amber-900 font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Timestamp Discussions ({allTimedComments.length})</span>
            </button>

            {video.structuredSummary && (
              <button
                onClick={() => setActiveTab('summary')}
                className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'summary'
                    ? 'border-b-2 border-amber-900 text-amber-900 font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Structured Summary &amp; Exegesis</span>
              </button>
            )}
          </div>

          {/* TAB CONTENT 1: Timestamp Comments & Discussion */}
          {activeTab === 'timed' && (
            <div className="space-y-4">
              {/* Comment Submission Form anchored to specific timestamp */}
              <form onSubmit={handlePostTimedComment} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">
                    Anchor Comment to Exact Video Moment:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTargetTimestampSeconds(currentPlayheadTime)}
                      className="flex items-center gap-1 text-[11px] text-amber-900 hover:underline cursor-pointer"
                    >
                      <Pin className="w-3 h-3" />
                      <span>Snap to current time (@{formatSecondsToTime(currentPlayheadTime)})</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`Share insight or theological discussion for timestamp @${formatSecondsToTime(targetTimestampSeconds)}...`}
                  rows={2}
                  className="w-full text-sm p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900 placeholder:text-stone-400"
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Timestamp:</span>
                    <input
                      type="text"
                      value={formatSecondsToTime(targetTimestampSeconds)}
                      onChange={(e) => setTargetTimestampSeconds(parseTimeToSeconds(e.target.value))}
                      className="w-20 text-xs font-mono px-2 py-1 bg-white border border-stone-200 rounded-md text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Timed Comment</span>
                  </button>
                </div>
              </form>

              {/* List of Timestamped Comments */}
              <div className="space-y-3">
                {allTimedComments.length === 0 ? (
                  <p className="text-xs text-stone-400 italic text-center py-4">
                    No timestamped comments yet. Add one above!
                  </p>
                ) : (
                  allTimedComments.map((tc) => {
                    const isSelected = selectedTimedCommentId === tc.id;
                    return (
                      <div
                        key={tc.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300'
                            : 'bg-white hover:bg-stone-50/80 border-stone-200'
                        }`}
                        onClick={() => handleSeekToTimestamp(tc.timestampSeconds, tc.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={tc.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                              alt={tc.author.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-semibold text-stone-800">
                              {tc.author.name}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              {tc.author.handle}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeekToTimestamp(tc.timestampSeconds, tc.id);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-mono bg-red-100 hover:bg-red-200 text-red-800 px-2 py-0.5 rounded font-bold transition-colors"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>@{tc.timestampFormatted}</span>
                            </button>
                          </div>

                          <span className="text-[11px] text-stone-400 font-sans">
                            {tc.createdAt}
                          </span>
                        </div>

                        <p className="text-xs text-stone-800 leading-relaxed pl-8 font-serif-reading text-[13px]">
                          {tc.content}
                        </p>

                        <div className="flex items-center justify-between pl-8 pt-2 text-[11px] text-stone-500">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLikeComment(video.id, tc.id);
                            }}
                            className="flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer tabular-nums"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{tc.likes}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetTimestampSeconds(tc.timestampSeconds);
                              setNewCommentText(`@${tc.author.handle} `);
                            }}
                            className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            <span>Reply to this moment</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: Structured Summary & Exegesis */}
          {activeTab === 'summary' && video.structuredSummary && (
            <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200 space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-900 font-bold block mb-1">
                  Core Exegetical Thesis
                </span>
                <p className="font-serif-reading text-lg italic text-stone-900 leading-relaxed">
                  "{video.structuredSummary.coreThesis}"
                </p>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-stone-600 font-bold block mb-2">
                  Key Expository Arguments
                </span>
                <div className="space-y-2">
                  {video.structuredSummary.keyTakeaways.map((takeaway, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-800 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-amber-900 text-white flex items-center justify-center text-[10px] shrink-0 font-mono">
                        {idx + 1}
                      </span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {video.structuredSummary.canonicalConnection && (
                <div className="pt-3 border-t border-stone-200 text-xs">
                  <strong className="text-amber-900 font-mono uppercase tracking-wider block mb-1">
                    Canonical Connection
                  </strong>
                  <p className="text-stone-700 leading-relaxed font-serif-reading text-[13px]">
                    {video.structuredSummary.canonicalConnection}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
