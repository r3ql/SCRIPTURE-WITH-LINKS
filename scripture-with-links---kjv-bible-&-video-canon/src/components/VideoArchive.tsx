import React, { useState, useMemo } from 'react';
import type { VideoLink } from '../types/index.ts';
import { buildLinkDirectoryTree } from '../utils/bibleUtils.ts';
import {
  Folder,
  FolderOpen,
  FileVideo,
  Play,
  Heart,
  MessageSquare,
  Search,
  Tag,
  BookOpen,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Clock,
  User,
  MessageCircle
} from 'lucide-react';

interface VideoArchiveProps {
  videoLinks: VideoLink[];
  onOpenVideo: (video: VideoLink) => void;
  onJumpToBibleVerse: (bookId: string, chapter: number) => void;
  onLikeVideo: (videoId: string) => void;
  onOpenWhatsAppForVideo: (video: VideoLink) => void;
  onOpenPostModal: () => void;
}

export const VideoArchive: React.FC<VideoArchiveProps> = ({
  videoLinks,
  onOpenVideo,
  onJumpToBibleVerse,
  onLikeVideo,
  onOpenWhatsAppForVideo,
  onOpenPostModal,
}) => {
  const [viewMode, setViewMode] = useState<'folder' | 'grid'>('folder');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedTestament, setSelectedTestament] = useState<'all' | 'OT' | 'NT'>('all');

  // Expanded folders state in folder tree mode
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'New Testament': true,
    'Old Testament': true,
    'New Testament/John': true,
    'New Testament/John/Chapter 3': true,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Extract all distinct speakers and tags for filtering
  const allSpeakers = useMemo(() => {
    const set = new Set<string>();
    videoLinks.forEach((v) => {
      if (v.speaker) set.add(v.speaker);
    });
    return Array.from(set).sort();
  }, [videoLinks]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    videoLinks.forEach((v) => {
      v.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [videoLinks]);

  // Filtered video links
  const filteredLinks = useMemo(() => {
    return videoLinks.filter((link) => {
      // Search text in title, notes, verses, speaker
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = link.title.toLowerCase().includes(query);
        const matchesSpeaker = link.speaker.toLowerCase().includes(query);
        const matchesNotes = link.notes.toLowerCase().includes(query);
        const matchesVerses = link.verses.some((v) => v.toLowerCase().includes(query));
        if (!matchesTitle && !matchesSpeaker && !matchesNotes && !matchesVerses) {
          return false;
        }
      }

      // Speaker filter
      if (selectedSpeaker !== 'all' && link.speaker !== selectedSpeaker) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'all' && !link.tags.includes(selectedTag)) {
        return false;
      }

      return true;
    });
  }, [videoLinks, searchQuery, selectedSpeaker, selectedTag]);

  // Build directory tree from filtered links
  const directoryTree = useMemo(() => {
    return buildLinkDirectoryTree(filteredLinks);
  }, [filteredLinks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-900 font-semibold">
            Living Canon Weave · Video Exposition Directory
          </span>
          <h1 className="text-3xl font-serif-reading font-semibold text-stone-900 mt-1">
            Scripture Video Archive &amp; Folder Index
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl font-sans">
            Every entry links directly into canonical KJV verses with exact speaker timestamps. Explore the directory like a theological folder archive or visual grid.
          </p>
        </div>

        {/* View Switcher: Folder View vs Grid View */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center p-1 bg-stone-200/70 rounded-lg text-xs font-medium text-stone-700">
            <button
              onClick={() => setViewMode('folder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'folder'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'hover:text-stone-900'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Folder Directory</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'hover:text-stone-900'
              }`}
            >
              <FileVideo className="w-3.5 h-3.5" />
              <span>Card Grid</span>
            </button>
          </div>

          <button
            onClick={onOpenPostModal}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-amber-900 hover:bg-amber-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            + Link Video
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search verse (e.g. John 3:16), speaker, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900 placeholder:text-stone-400"
            />
          </div>

          {/* Speaker Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-900 text-stone-800"
            >
              <option value="all">All Speakers / Exegetes</option>
              {allSpeakers.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Tag Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-900 text-stone-800"
            >
              <option value="all">All Topics</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="lg:col-span-2 text-right text-xs font-mono text-stone-500 tabular-nums">
            {filteredLinks.length} linked video{filteredLinks.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* VIEW 1: Folder Tree Directory Hierarchy */}
      {viewMode === 'folder' ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="text-xs font-mono text-stone-500 mb-4 pb-2 border-b border-stone-100 uppercase tracking-wider">
            Canonical Directory Root / Scripture Folders
          </div>

          <div className="space-y-4">
            {Object.entries(directoryTree).map(([testamentName, testamentNode]) => {
              const isTestamentOpen = !!expandedFolders[testamentName];
              const books = Object.entries(testamentNode.children || {});

              return (
                <div key={testamentName} className="border border-stone-200/90 rounded-xl overflow-hidden">
                  {/* Testament Folder Header */}
                  <div
                    onClick={() => toggleFolder(testamentName)}
                    className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {isTestamentOpen ? (
                        <ChevronDown className="w-4 h-4 text-stone-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-600" />
                      )}
                      {isTestamentOpen ? (
                        <FolderOpen className="w-5 h-5 text-amber-700" />
                      ) : (
                        <Folder className="w-5 h-5 text-amber-700" />
                      )}
                      <span className="font-serif-reading text-lg font-bold text-stone-900">
                        {testamentName}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-stone-500 tabular-nums bg-white border border-stone-200 px-2 py-0.5 rounded">
                      {testamentNode.count} video{testamentNode.count === 1 ? '' : 's'}
                    </span>
                  </div>

                  {/* Testament Children (Books) */}
                  {isTestamentOpen && (
                    <div className="p-3 pl-6 space-y-3 bg-[#FAF8F5]/60 border-t border-stone-200/80">
                      {books.length === 0 ? (
                        <p className="text-xs text-stone-400 italic">No linked videos matching current filter.</p>
                      ) : (
                        books.map(([bookName, bookNode]) => {
                          const bookPath = `${testamentName}/${bookName}`;
                          const isBookOpen = !!expandedFolders[bookPath];
                          const chapters = Object.entries(bookNode.children || {});

                          return (
                            <div key={bookPath} className="border border-stone-200/70 rounded-lg bg-white overflow-hidden">
                              {/* Book Folder Header */}
                              <div
                                onClick={() => toggleFolder(bookPath)}
                                className="flex items-center justify-between p-3 hover:bg-stone-50 transition-colors cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2">
                                  {isBookOpen ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                                  )}
                                  {isBookOpen ? (
                                    <FolderOpen className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <Folder className="w-4 h-4 text-amber-600" />
                                  )}
                                  <span className="font-serif-reading text-base font-semibold text-stone-900">
                                    The Book of {bookName}
                                  </span>
                                </div>
                                <span className="text-xs font-mono text-stone-500 tabular-nums">
                                  {bookNode.count} link{bookNode.count === 1 ? '' : 's'}
                                </span>
                              </div>

                              {/* Book Children (Chapters) */}
                              {isBookOpen && (
                                <div className="p-3 pl-6 space-y-2.5 bg-stone-50/50 border-t border-stone-100">
                                  {chapters.map(([chapterName, chapterNode]) => {
                                    const chapterPath = `${bookPath}/${chapterName}`;
                                    const isChapterOpen = !!expandedFolders[chapterPath];
                                    const links = chapterNode.links || [];

                                    return (
                                      <div key={chapterPath} className="border border-stone-200/60 rounded-md bg-white">
                                        {/* Chapter Folder Header */}
                                        <div
                                          onClick={() => toggleFolder(chapterPath)}
                                          className="flex items-center justify-between p-2.5 hover:bg-amber-50/40 transition-colors cursor-pointer select-none"
                                        >
                                          <div className="flex items-center gap-2">
                                            {isChapterOpen ? (
                                              <ChevronDown className="w-3 h-3 text-stone-400" />
                                            ) : (
                                              <ChevronRight className="w-3 h-3 text-stone-400" />
                                            )}
                                            {isChapterOpen ? (
                                              <FolderOpen className="w-3.5 h-3.5 text-amber-800" />
                                            ) : (
                                              <Folder className="w-3.5 h-3.5 text-amber-800" />
                                            )}
                                            <span className="text-sm font-medium text-stone-800">
                                              {chapterName}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const chNum = parseInt(chapterName.replace('Chapter ', ''), 10);
                                                onJumpToBibleVerse(bookName, chNum || 1);
                                              }}
                                              className="text-[11px] text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                              <BookOpen className="w-3 h-3" />
                                              <span>Read Chapter</span>
                                            </button>
                                            <span className="text-xs font-mono text-stone-400 tabular-nums">
                                              ({links.length})
                                            </span>
                                          </div>
                                        </div>

                                        {/* Linked Video Items Inside Chapter */}
                                        {isChapterOpen && (
                                          <div className="p-3 space-y-2 border-t border-stone-100 bg-[#FAF8F5]/30">
                                            {links.map((link) => (
                                              <div
                                                key={link.id}
                                                className="p-3 bg-white rounded-lg border border-stone-200/80 hover:border-amber-400/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                                              >
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                  <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                                      <span className="font-semibold text-sm text-stone-900 hover:text-amber-900 cursor-pointer" onClick={() => onOpenVideo(link)}>
                                                        {link.title}
                                                      </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-sans">
                                                      <span className="font-medium text-stone-700">{link.speaker}</span>
                                                      <span aria-hidden="true">·</span>
                                                      <span>{link.channelTitle}</span>
                                                      {link.timestampFormatted && (
                                                        <>
                                                          <span aria-hidden="true">·</span>
                                                          <span className="font-mono text-red-700 font-medium">
                                                            @{link.timestampFormatted}
                                                          </span>
                                                        </>
                                                      )}
                                                      <span aria-hidden="true">·</span>
                                                      <span className="text-amber-900 font-mono">
                                                        {link.verses.join(', ')}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                  <button
                                                    onClick={() => onOpenWhatsAppForVideo(link)}
                                                    className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                                                    title="Discuss in WhatsApp Room"
                                                  >
                                                    <MessageCircle className="w-4 h-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => onOpenVideo(link)}
                                                    className="px-3 py-1 bg-amber-900 hover:bg-amber-800 text-white rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                                                  >
                                                    <Play className="w-3 h-3 fill-current" />
                                                    <span>Play Exegesis</span>
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: Visual Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Card Header & Thumbnail */}
              <div
                onClick={() => onOpenVideo(link)}
                className="relative aspect-video bg-stone-900 overflow-hidden cursor-pointer"
              >
                <img
                  src={`https://img.youtube.com/vi/${link.youtubeId}/hqdefault.jpg`}
                  alt={link.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Exact Verse Reference Badge in video */}
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-amber-200 text-xs font-mono font-medium px-2.5 py-1 rounded">
                  {link.verses.join(' · ')}
                </div>

                {/* Timestamp Tag */}
                {link.timestampFormatted && (
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-400" />
                    <span>{link.timestampFormatted}</span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-sans">
                    <span className="font-semibold text-stone-800">{link.speaker}</span>
                    <span>{link.channelTitle}</span>
                  </div>

                  <h3
                    onClick={() => onOpenVideo(link)}
                    className="font-serif-reading text-lg font-semibold text-stone-900 hover:text-amber-900 cursor-pointer line-clamp-2 leading-snug mb-2"
                  >
                    {link.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 font-serif-reading text-[13px] leading-relaxed mb-4">
                    {link.notes}
                  </p>
                </div>

                {/* Footer and Interactive Affordances */}
                <div className="pt-3 border-t border-stone-100">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {link.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onLikeVideo(link.id)}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer tabular-nums"
                        title="Like this video exposition"
                      >
                        <Heart className="w-3.5 h-3.5 fill-red-500/20 text-red-500" />
                        <span>{link.likesCount}</span>
                      </button>

                      <button
                        onClick={() => onOpenVideo(link)}
                        className="flex items-center gap-1 hover:text-stone-900 transition-colors cursor-pointer tabular-nums"
                        title="View comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{link.commentsCount}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenWhatsAppForVideo(link)}
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        title="Discuss in WhatsApp Room"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onJumpToBibleVerse(link.primaryBookId, link.primaryChapter)}
                        className="flex items-center gap-1 text-amber-900 hover:text-amber-700 font-medium cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Verse</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
