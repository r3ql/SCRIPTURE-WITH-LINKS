import React, { useState, useMemo } from 'react';
import { BIBLE_BOOKS, getChapterVerses } from '../data/kjvBibleData.ts';
import type { VideoLink, BibleVerse } from '../types/index.ts';
import { isVerseCoveredByLink } from '../utils/bibleUtils.ts';
import { ChevronLeft, ChevronRight, Search, Play, Plus, MessageCircle, Share2, Sparkles, Youtube, Check } from 'lucide-react';

interface BibleReaderProps {
  currentBookId: string;
  currentChapter: number;
  onSelectBookAndChapter: (bookId: string, chapter: number) => void;
  videoLinks: VideoLink[];
  onOpenVideo: (video: VideoLink) => void;
  onLinkVerse: (reference: string) => void;
  onOpenWhatsAppForVerse: (verse: BibleVerse) => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  currentBookId,
  currentChapter,
  onSelectBookAndChapter,
  videoLinks,
  onOpenVideo,
  onLinkVerse,
  onOpenWhatsAppForVerse,
}) => {
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);

  const currentBook = useMemo(() => {
    return BIBLE_BOOKS.find((b) => b.id.toLowerCase() === currentBookId.toLowerCase()) || BIBLE_BOOKS[0];
  }, [currentBookId]);

  const verses = useMemo(() => {
    return getChapterVerses(currentBook.id, currentChapter);
  }, [currentBook.id, currentChapter]);

  // Find videos linked to the current chapter
  const chapterVideos = useMemo(() => {
    return videoLinks.filter(
      (link) => link.primaryBookId.toLowerCase() === currentBook.id.toLowerCase() && link.primaryChapter === currentChapter
    );
  }, [videoLinks, currentBook.id, currentChapter]);

  // Map of verse number -> linked video items
  const verseToVideosMap = useMemo(() => {
    const map: Record<number, VideoLink[]> = {};
    for (const verse of verses) {
      const matched = videoLinks.filter((link) =>
        isVerseCoveredByLink(currentBook.name, currentChapter, verse.verse, link)
      );
      if (matched.length > 0) {
        map[verse.verse] = matched;
      }
    }
    return map;
  }, [verses, videoLinks, currentBook.name, currentChapter]);

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      onSelectBookAndChapter(currentBook.id, currentChapter - 1);
      setSelectedVerseNum(null);
    } else {
      const bookIndex = BIBLE_BOOKS.findIndex((b) => b.id === currentBook.id);
      if (bookIndex > 0) {
        const prevBook = BIBLE_BOOKS[bookIndex - 1];
        onSelectBookAndChapter(prevBook.id, prevBook.chaptersCount);
        setSelectedVerseNum(null);
      }
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.chaptersCount) {
      onSelectBookAndChapter(currentBook.id, currentChapter + 1);
      setSelectedVerseNum(null);
    } else {
      const bookIndex = BIBLE_BOOKS.findIndex((b) => b.id === currentBook.id);
      if (bookIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[bookIndex + 1];
        onSelectBookAndChapter(nextBook.id, 1);
        setSelectedVerseNum(null);
      }
    }
  };

  const handleCopy = (verse: BibleVerse) => {
    navigator.clipboard.writeText(`"${verse.text}" — ${verse.reference} (KJV)`);
    setCopiedRef(verse.reference);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const filteredBooks = useMemo(() => {
    if (!searchTerm) return BIBLE_BOOKS;
    const term = searchTerm.toLowerCase();
    return BIBLE_BOOKS.filter(
      (b) => b.name.toLowerCase().includes(term) || b.abbreviation.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const selectedVerseObj = selectedVerseNum ? verses.find((v) => v.verse === selectedVerseNum) : null;
  const selectedVerseVideos = selectedVerseNum ? verseToVideosMap[selectedVerseNum] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Editorial Chapter Navigation Bar */}
      <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Book and Chapter Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookPickerOpen(!isBookPickerOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 rounded-lg text-stone-900 font-serif-reading text-lg font-bold transition-colors cursor-pointer"
            >
              <span>{currentBook.name}</span>
              <span className="text-xs font-sans font-normal text-stone-500 uppercase tracking-wider">
                ({currentBook.testament})
              </span>
            </button>

            {/* Chapter Selector Dropdown */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevChapter}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                title="Previous chapter"
                aria-label="Previous Chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={currentChapter}
                onChange={(e) => {
                  onSelectBookAndChapter(currentBook.id, parseInt(e.target.value, 10));
                  setSelectedVerseNum(null);
                }}
                className="bg-stone-100 border border-stone-200 text-stone-900 text-sm font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-900 cursor-pointer tabular-nums"
              >
                {Array.from({ length: currentBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                  <option key={ch} value={ch}>
                    Chapter {ch}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextChapter}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                title="Next chapter"
                aria-label="Next Chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Stats on Links */}
          <div className="flex items-center gap-3 text-xs text-stone-500 font-sans">
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200/70 px-2.5 py-1 rounded-md">
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span className="font-semibold tabular-nums">{chapterVideos.length}</span>
              <span>linked video{chapterVideos.length === 1 ? '' : 's'} in this chapter</span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">KJV 1611 Pure Cambridge Text</span>
          </div>
        </div>

        {/* Expandable Book Picker Matrix */}
        {isBookPickerOpen && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Select Scripture Book
              </span>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter book..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 max-h-64 overflow-y-auto p-1">
              {filteredBooks.map((book) => {
                const isSelected = book.id === currentBook.id;
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      onSelectBookAndChapter(book.id, 1);
                      setIsBookPickerOpen(false);
                      setSelectedVerseNum(null);
                    }}
                    className={`text-left px-2 py-1.5 rounded text-xs transition-colors cursor-pointer truncate ${
                      isSelected
                        ? 'bg-amber-900 text-white font-medium'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <div className="font-serif-reading font-semibold truncate">{book.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                      {book.testament} · {book.chaptersCount} ch
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Bible Text Column & Linked Videos Margin Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Center: The Sacred KJV Reading Canvas (70% on desktop) */}
        <div className="lg:col-span-8 bg-[#FDFBF7] rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-10">
          {/* Chapter Editorial Header */}
          <div className="text-center pb-8 mb-8 border-b border-stone-200">
            <span className="text-xs uppercase tracking-widest font-sans text-stone-500">
              The Holy Bible · King James Version · {currentBook.testament === 'OT' ? 'Old Testament' : 'New Testament'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif-reading font-semibold text-stone-900 mt-2">
              The Book of {currentBook.name}
            </h1>
            <p className="text-sm font-display-sacred tracking-wider text-amber-900/80 mt-1">
              CHAPTER {currentChapter}
            </p>
          </div>

          {/* Verses Flow with Interactive Video Link Badges */}
          <div className="space-y-4">
            {verses.map((v) => {
              const linkedVids = verseToVideosMap[v.verse] || [];
              const hasLinks = linkedVids.length > 0;
              const isSelected = selectedVerseNum === v.verse;

              return (
                <div
                  key={v.verse}
                  onClick={() => setSelectedVerseNum(isSelected ? null : v.verse)}
                  className={`group relative p-3 sm:p-4 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100/60 ring-1 ring-amber-300'
                      : hasLinks
                      ? 'bg-amber-50/50 hover:bg-amber-100/40 border border-amber-200/40'
                      : 'hover:bg-stone-100/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Verse Number */}
                    <span className="font-mono text-xs font-semibold text-amber-900 pt-0.5 tabular-nums select-none shrink-0 w-6 text-right">
                      {v.verse}
                    </span>

                    {/* Verse Text with Bookish Cadence */}
                    <div className="flex-1">
                      <p className="font-serif-reading text-lg sm:text-xl leading-relaxed text-stone-900">
                        {v.text}
                      </p>

                      {/* Video Link Density Indicator inline */}
                      {hasLinks && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {linkedVids.map((vid) => (
                            <button
                              key={vid.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenVideo(vid);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-amber-50 text-stone-800 border border-amber-300/80 rounded-md text-xs font-medium shadow-2xs transition-all cursor-pointer group/btn"
                            >
                              <Youtube className="w-3.5 h-3.5 text-red-600 group-hover/btn:scale-110 transition-transform" />
                              <span className="truncate max-w-[200px]">{vid.speaker}</span>
                              {vid.timestampFormatted && (
                                <span className="text-[10px] font-mono text-stone-500 tabular-nums">
                                  @{vid.timestampFormatted}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Context Action Bar when verse is highlighted */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-stone-600 font-sans">
                        <span className="font-semibold text-stone-900">{v.reference}</span>
                        {hasLinks && (
                          <span className="ml-2 text-amber-900">
                            · {linkedVids.length} linked exposition{linkedVids.length === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLinkVerse(v.reference);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-amber-900 text-white rounded hover:bg-amber-800 transition-colors cursor-pointer font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Link YouTube Video</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWhatsAppForVerse(v);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded hover:bg-emerald-600 transition-colors cursor-pointer font-medium"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp Room</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(v);
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-white border border-stone-300 text-stone-700 rounded hover:bg-stone-50 transition-colors cursor-pointer"
                          title="Copy verse"
                        >
                          {copiedRef === v.reference ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chapter Bottom Navigation */}
          <div className="mt-12 pt-6 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={handlePrevChapter}
              className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors cursor-pointer font-serif-reading text-lg"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Chapter</span>
            </button>

            <span className="text-xs font-mono text-stone-500 tabular-nums">
              {currentBook.name} {currentChapter} of {currentBook.chaptersCount}
            </span>

            <button
              onClick={handleNextChapter}
              className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors cursor-pointer font-serif-reading text-lg"
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Exegesis & Video Link Margin Rail (30% on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Verse Context Panel */}
          {selectedVerseObj && (
            <div className="bg-white rounded-2xl border border-amber-300/80 shadow-sm p-5 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-semibold">
                  Selected Focus
                </span>
                <span className="text-xs text-stone-500 font-sans">
                  {selectedVerseObj.reference}
                </span>
              </div>
              <p className="font-serif-reading text-base italic text-stone-800 line-clamp-3 mb-4">
                "{selectedVerseObj.text}"
              </p>

              {selectedVerseVideos.length > 0 ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                    Linked Video Exegeses ({selectedVerseVideos.length})
                  </span>
                  {selectedVerseVideos.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => onOpenVideo(vid)}
                      className="p-3 bg-stone-50 hover:bg-amber-50/70 border border-stone-200 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-900">
                            {vid.title}
                          </h4>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            <span>{vid.speaker}</span>
                            {vid.timestampFormatted && (
                              <span className="font-mono ml-1 text-red-700 font-medium">
                                @{vid.timestampFormatted}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-stone-50 rounded-xl p-4 text-center border border-dashed border-stone-200">
                  <p className="text-xs text-stone-600 mb-2">
                    No YouTube video is linked to this verse yet.
                  </p>
                  <button
                    onClick={() => onLinkVerse(selectedVerseObj.reference)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 text-white rounded-lg text-xs font-medium hover:bg-amber-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Be the First to Link a Video</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chapter-Wide Video Exegeses Index */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Chapter Video Archive
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500 tabular-nums">
                {chapterVideos.length} link{chapterVideos.length === 1 ? '' : 's'}
              </span>
            </div>

            {chapterVideos.length > 0 ? (
              <div className="space-y-3.5">
                {chapterVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => onOpenVideo(vid)}
                    className="p-3 bg-[#FAF8F5] hover:bg-amber-50/60 border border-stone-200 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-stone-900 group-hover:text-amber-900 line-clamp-2 leading-snug">
                        {vid.title}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 mb-2 font-serif-reading text-[13px]">
                      {vid.notes}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60 font-sans">
                      <span>{vid.speaker}</span>
                      <div className="flex items-center gap-2">
                        {vid.timestampFormatted && (
                          <span className="font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded text-[10px]">
                            {vid.timestampFormatted}
                          </span>
                        )}
                        <span className="text-stone-400">·</span>
                        <span className="tabular-nums font-mono">{vid.commentsCount} comments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-stone-500 text-xs">
                <p className="mb-3">No videos linked yet to {currentBook.name} {currentChapter}.</p>
                <button
                  onClick={() => onLinkVerse(`${currentBook.name} ${currentChapter}:1`)}
                  className="px-3 py-1.5 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors cursor-pointer text-xs font-medium"
                >
                  Link YouTube Video to this Chapter
                </button>
              </div>
            )}
          </div>

          {/* Theological Quote / Historical Marginalia Note */}
          <div className="bg-[#F7F4EE] rounded-2xl border border-stone-200 p-5 text-stone-700">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-950 font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Canonical Intertextuality</span>
            </div>
            <p className="font-serif-reading text-sm italic leading-relaxed text-stone-800">
              "Scripture is its own best interpreter. As more believers link video expositions across the 66 books, the organic web of Christological prophecy, history, and fulfillment grows visibly denser."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
