import React, { useState } from 'react';
import type { VideoLink, UserBibleProgress } from '../types/index.ts';
import { BIBLE_BOOKS, TESTAMENT_BOOKS } from '../data/bibleBooks.ts';
import {
  Compass,
  Eye,
  Film,
  PlusCircle,
  BookOpen,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  MapPin,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

interface PilgrimMapProps {
  progress: UserBibleProgress;
  videoLinks: VideoLink[];
  onSelectBookChapter: (bookId: string, chapter: number) => void;
  onOpenVideoById: (videoId: string) => void;
}

type MapLayerFilter = 'all' | 'watched' | 'linked' | 'read' | 'explored';

export const PilgrimMap: React.FC<PilgrimMapProps> = ({
  progress,
  videoLinks,
  onSelectBookChapter,
  onOpenVideoById,
}) => {
  const [activeFilter, setActiveFilter] = useState<MapLayerFilter>('all');
  const [selectedBookId, setSelectedBookId] = useState<string>('John');
  const [searchBook, setSearchBook] = useState<string>('');

  const completedSet = new Set(progress.completedChapters);
  const exploredSet = new Set(progress.exploredChapters || ['John:1', 'John:2', 'John:3', 'Romans:8']);
  const watchedVideoIdsSet = new Set(progress.watchedVideoIds);

  // Group books by canonical sections
  const canonDivisions = [
    { title: 'The Pentateuch / Law', range: [0, 5], test: 'OT' },
    { title: 'Historical Books', range: [5, 17], test: 'OT' },
    { title: 'Poetry & Wisdom Literature', range: [17, 22], test: 'OT' },
    { title: 'Major Prophets', range: [22, 27], test: 'OT' },
    { title: 'Minor Prophets', range: [27, 39], test: 'OT' },
    { title: 'The Four Holy Gospels', range: [39, 43], test: 'NT' },
    { title: 'Apostolic History (Acts)', range: [43, 44], test: 'NT' },
    { title: 'Pauline Epistles', range: [44, 58], test: 'NT' },
    { title: 'General & Pastoral Epistles', range: [58, 65], test: 'NT' },
    { title: 'Apocalypse / Prophecy', range: [65, 66], test: 'NT' },
  ];

  // Calculate book stats
  const getBookStats = (bookId: string, chaptersCount: number) => {
    let readChapters = 0;
    let exploredChapters = 0;
    let linkedVideos = 0;
    let watchedVideos = 0;

    const bookVideos = videoLinks.filter((v) => v.primaryBookId === bookId);
    linkedVideos = bookVideos.length;
    watchedVideos = bookVideos.filter((v) => watchedVideoIdsSet.has(v.id)).length;

    for (let c = 1; c <= chaptersCount; c++) {
      const key = `${bookId}:${c}`;
      if (completedSet.has(key)) readChapters++;
      if (exploredSet.has(key)) exploredChapters++;
    }

    const hasActivity = readChapters > 0 || exploredChapters > 0 || linkedVideos > 0 || watchedVideos > 0;

    return {
      readChapters,
      exploredChapters,
      linkedVideos,
      watchedVideos,
      hasActivity,
      percentage: Math.round((readChapters / chaptersCount) * 100),
    };
  };

  const selectedBook = BIBLE_BOOKS.find((b) => b.id === selectedBookId) || BIBLE_BOOKS[39];
  const selectedStats = getBookStats(selectedBook.id, selectedBook.chaptersCount);
  const selectedBookVideos = videoLinks.filter((v) => v.primaryBookId === selectedBook.id);

  // Filter books if search term is provided
  const filteredBooks = BIBLE_BOOKS.filter((b) =>
    b.name.toLowerCase().includes(searchBook.toLowerCase()) ||
    b.abbreviation.toLowerCase().includes(searchBook.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Scribe's Atlas Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        {/* Sacred background geometry */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-3 py-1 rounded-full font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>THE PILGRIM&apos;S SANCTUARY ATLAS</span>
            </div>
            <h1 className="font-display-sacred text-2xl sm:text-3xl text-white tracking-wide">
              The Personal Journey Map
            </h1>
            <p className="text-stone-300 text-sm leading-relaxed font-sans">
              A private cartography of your scripture walk across all 66 books and 1,189 chapters of the Holy Bible. Track where you have explored, watched expositions, linked video resources, and read the sacred text.
            </p>
          </div>

          {/* Privacy Sandbox Assurance Badge */}
          <div className="shrink-0 bg-stone-800/90 border border-stone-700/80 rounded-xl p-4 flex flex-col gap-2 max-w-xs">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% On-Device Sandbox</span>
            </div>
            <p className="text-[12px] text-stone-400 font-sans leading-normal">
              Every coordinate, watched video, and link resides strictly inside your phone or browser storage. Zero remote tracking, zero telemetries.
            </p>
          </div>
        </div>

        {/* 4 Summary Cartography Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800 text-center">
          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <div className="text-[11px] text-stone-400 font-mono flex items-center justify-center gap-1">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>Explored Chapters</span>
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {exploredSet.size} <span className="text-xs text-stone-500 font-normal">/ 1,189</span>
            </div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <div className="text-[11px] text-stone-400 font-mono flex items-center justify-center gap-1">
              <Film className="w-3 h-3 text-rose-400" />
              <span>Expositions Watched</span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-300 mt-1">
              {progress.watchedVideoIds.length} <span className="text-xs text-stone-500 font-normal">videos</span>
            </div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <div className="text-[11px] text-stone-400 font-mono flex items-center justify-center gap-1">
              <PlusCircle className="w-3 h-3 text-amber-400" />
              <span>Links Authored</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              {videoLinks.length} <span className="text-xs text-stone-500 font-normal">links</span>
            </div>
          </div>

          <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700/50">
            <div className="text-[11px] text-stone-400 font-mono flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Chapters Completed</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              {completedSet.size} <span className="text-xs text-stone-500 font-normal">/ 1,189</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Filter Buttons & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-stone-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Map:
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Milestones
          </button>
          <button
            onClick={() => setActiveFilter('watched')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'watched'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <Film className="w-3 h-3" /> Watched ({progress.watchedVideoIds.length})
          </button>
          <button
            onClick={() => setActiveFilter('linked')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'linked'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <PlusCircle className="w-3 h-3" /> Links Added ({videoLinks.length})
          </button>
          <button
            onClick={() => setActiveFilter('read')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'read'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Read ({completedSet.size})
          </button>
          <button
            onClick={() => setActiveFilter('explored')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'explored'
                ? 'bg-cyan-700 text-white'
                : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
            }`}
          >
            <Eye className="w-3 h-3" /> Explored ({exploredSet.size})
          </button>
        </div>

        {/* Quick search book */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search books in map..."
            value={searchBook}
            onChange={(e) => setSearchBook(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
          />
        </div>
      </div>

      {/* Main Map Layout: Canon Selector + Book Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 66 Books Atlas Grid */}
        <div className="lg:col-span-7 space-y-6">
          {canonDivisions.map((division, idx) => {
            const booksInDiv = BIBLE_BOOKS.slice(division.range[0], division.range[1]).filter(
              (b) =>
                (!searchBook ||
                  b.name.toLowerCase().includes(searchBook.toLowerCase()) ||
                  b.abbreviation.toLowerCase().includes(searchBook.toLowerCase()))
            );

            if (booksInDiv.length === 0) return null;

            return (
              <div key={idx} className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
                    {division.title} ({division.test})
                  </h2>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {booksInDiv.length} Books
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {booksInDiv.map((book) => {
                    const stats = getBookStats(book.id, book.chaptersCount);
                    const isSelected = selectedBookId === book.id;

                    // Filter criteria
                    if (activeFilter === 'watched' && stats.watchedVideos === 0) return null;
                    if (activeFilter === 'linked' && stats.linkedVideos === 0) return null;
                    if (activeFilter === 'read' && stats.readChapters === 0) return null;
                    if (activeFilter === 'explored' && stats.exploredChapters === 0) return null;

                    return (
                      <button
                        key={book.id}
                        onClick={() => setSelectedBookId(book.id)}
                        className={`text-left p-3 rounded-lg border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-amber-800 bg-amber-50/80 shadow-xs ring-1 ring-amber-800'
                            : 'border-stone-200 hover:border-amber-700/60 bg-stone-50/60 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-xs text-stone-900 truncate">
                            {book.name}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500">
                            {book.chaptersCount}ch
                          </span>
                        </div>

                        {/* Milestone badges row */}
                        <div className="flex items-center gap-1.5 mt-2">
                          {stats.readChapters > 0 && (
                            <span
                              title={`${stats.readChapters} chapters read`}
                              className="w-2 h-2 rounded-full bg-emerald-500"
                            />
                          )}
                          {stats.watchedVideos > 0 && (
                            <span
                              title={`${stats.watchedVideos} videos watched`}
                              className="w-2 h-2 rounded-full bg-rose-500"
                            />
                          )}
                          {stats.linkedVideos > 0 && (
                            <span
                              title={`${stats.linkedVideos} video links available`}
                              className="w-2 h-2 rounded-full bg-amber-500"
                            />
                          )}
                          {stats.exploredChapters > 0 && (
                            <span
                              title={`${stats.exploredChapters} chapters explored`}
                              className="w-2 h-2 rounded-full bg-cyan-500"
                            />
                          )}
                          {!stats.hasActivity && (
                            <span className="text-[10px] text-stone-400 font-mono italic">
                              Uncharted
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-stone-200 h-1 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-amber-800 h-full rounded-full transition-all"
                            style={{ width: `${stats.percentage}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Book Deep Cartography Inspection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-20">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-amber-900 font-semibold uppercase tracking-wider">
                  Book Focus · {selectedBook.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                </span>
                <h3 className="font-display-sacred text-2xl font-bold text-stone-900 mt-0.5">
                  {selectedBook.name}
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-1">
                  Canonical Division: {selectedBook.category} · {selectedBook.chaptersCount} Chapters Total
                </p>
              </div>

              <button
                onClick={() => onSelectBookChapter(selectedBook.id, 1)}
                className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <span>Read Book</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Status Gauges */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-stone-200">
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
                <span className="text-[10px] font-mono text-stone-500 uppercase">Read Completed</span>
                <p className="text-sm font-bold font-mono text-emerald-800 mt-0.5">
                  {selectedStats.readChapters} / {selectedBook.chaptersCount} ({selectedStats.percentage}%)
                </p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
                <span className="text-[10px] font-mono text-stone-500 uppercase">Linked Expositions</span>
                <p className="text-sm font-bold font-mono text-amber-900 mt-0.5">
                  {selectedStats.linkedVideos} Videos ({selectedStats.watchedVideos} watched)
                </p>
              </div>
            </div>

            {/* Chapter Tiles Map */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide font-mono">
                  Chapter Cartography Grid
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Read
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Video
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" /> Explored
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-56 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
                {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => {
                  const key = `${selectedBook.id}:${ch}`;
                  const isRead = completedSet.has(key);
                  const isExplored = exploredSet.has(key);
                  const hasVideos = videoLinks.some(
                    (v) => v.primaryBookId === selectedBook.id && v.primaryChapter === ch
                  );

                  return (
                    <button
                      key={ch}
                      onClick={() => onSelectBookChapter(selectedBook.id, ch)}
                      title={`Chapter ${ch}: ${isRead ? 'Read' : ''} ${hasVideos ? 'Has Videos' : ''} ${isExplored ? 'Explored' : ''}`}
                      className={`h-9 rounded-lg flex flex-col items-center justify-center text-xs font-mono font-medium transition cursor-pointer relative border ${
                        isRead
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold'
                          : hasVideos
                          ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                          : isExplored
                          ? 'bg-cyan-50 text-cyan-900 border-cyan-200'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <span>{ch}</span>
                      <div className="flex items-center gap-0.5 absolute bottom-1">
                        {isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                        {hasVideos && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                        {isExplored && !isRead && !hasVideos && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Linked Expositions in this book */}
            <div className="mt-6 pt-5 border-t border-stone-200">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide font-mono mb-3">
                Linked Expositions for {selectedBook.name} ({selectedBookVideos.length})
              </h4>

              {selectedBookVideos.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded-xl text-center border border-dashed border-stone-300">
                  <p className="text-xs text-stone-500">
                    No video links added to {selectedBook.name} yet.
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Use the &quot;Link Video to Verse&quot; button to connect your first lecture or sermon.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedBookVideos.map((video) => {
                    const isWatched = watchedVideoIdsSet.has(video.id);
                    return (
                      <div
                        key={video.id}
                        onClick={() => onOpenVideoById(video.id)}
                        className="p-3 bg-stone-50 hover:bg-amber-50/70 border border-stone-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono bg-amber-200/60 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                              {video.verses.join(', ')}
                            </span>
                            {isWatched && (
                              <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-1 rounded">
                                Watched
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-stone-900 truncate mt-1 group-hover:text-amber-900">
                            {video.title}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {video.speaker} · {video.channelTitle}
                          </p>
                        </div>

                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-800 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
