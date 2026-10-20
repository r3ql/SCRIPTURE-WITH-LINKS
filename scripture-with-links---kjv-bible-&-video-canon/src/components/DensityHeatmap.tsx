import React, { useMemo } from 'react';
import { BIBLE_BOOKS } from '../data/kjvBibleData.ts';
import type { VideoLink } from '../types/index.ts';
import { calculateBookDensity } from '../utils/bibleUtils.ts';
import { Network, Sparkles, BookOpen, Layers, Flame, ArrowUpRight } from 'lucide-react';

interface DensityHeatmapProps {
  videoLinks: VideoLink[];
  onSelectBook: (bookId: string, chapter: number) => void;
  onOpenPostModal: () => void;
}

export const DensityHeatmap: React.FC<DensityHeatmapProps> = ({
  videoLinks,
  onSelectBook,
  onOpenPostModal,
}) => {
  // Compute densities for all 66 books
  const bookDensities = useMemo(() => {
    return BIBLE_BOOKS.map((book) => {
      const count = calculateBookDensity(book.id, videoLinks);
      return {
        ...book,
        density: count,
      };
    });
  }, [videoLinks]);

  const totalLinks = videoLinks.length;
  const linkedBooksCount = bookDensities.filter((b) => b.density > 0).length;
  const maxDensity = Math.max(...bookDensities.map((b) => b.density), 1);

  // Group books by category
  const categories = useMemo(() => {
    const map: Record<string, typeof bookDensities> = {};
    for (const b of bookDensities) {
      if (!map[b.category]) map[b.category] = [];
      map[b.category].push(b);
    }
    return map;
  }, [bookDensities]);

  const getHeatmapColor = (density: number) => {
    if (density === 0) return 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300';
    const ratio = density / maxDensity;
    if (ratio > 0.6) {
      return 'bg-amber-900 text-white border-amber-950 shadow-xs hover:bg-amber-800';
    } else if (ratio > 0.3) {
      return 'bg-amber-700 text-white border-amber-800 hover:bg-amber-600';
    } else {
      return 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Macro Metrics */}
      <div className="pb-6 mb-8 border-b border-stone-200">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-900 font-semibold">
          Canon Connectivity Matrix
        </span>
        <h1 className="text-3xl font-serif-reading font-semibold text-stone-900 mt-1">
          Scriptural Link Density Heatmap
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl font-sans">
          Observing the web of YouTube video expositions grow denser across the 66 books of the King James Bible. High-density nodes glow in deep amber bronze.
        </p>

        {/* 4 Quantitative Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Total Video Links</span>
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">{totalLinks}</span>
            <span className="text-[11px] text-amber-900 block mt-0.5">Anchored in KJV</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Illuminated Books</span>
            <span className="text-2xl font-bold font-mono text-amber-900 tabular-nums">{linkedBooksCount} / 66</span>
            <span className="text-[11px] text-stone-500 block mt-0.5">Growing denser daily</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Peak Density Node</span>
            <span className="text-2xl font-bold font-mono text-stone-900 truncate block">Romans</span>
            <span className="text-[11px] text-stone-500 block mt-0.5">Golden Chain of Redemption</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Next Frontier</span>
            <button
              onClick={onOpenPostModal}
              className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1 mt-2 cursor-pointer"
            >
              <span>+ Link New Scripture</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-stone-500 block mt-0.5">Old &amp; New Testaments</span>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-stone-200 mb-6 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-800" />
          <span className="font-semibold text-stone-800">Density Scale:</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-stone-100 border border-stone-200" />
            <span>0 links (Awaiting study)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" />
            <span>1-2 links (Emerging)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-700 border border-amber-800" />
            <span>3-4 links (Active)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-amber-900 border border-amber-950" />
            <span>5+ links (Dense Core)</span>
          </div>
        </div>
      </div>

      {/* Grid of Canonical Categories and Books */}
      <div className="space-y-6">
        {Object.entries(categories).map(([categoryName, books]) => (
          <div key={categoryName} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
              <h3 className="font-serif-reading text-base font-bold text-stone-900 flex items-center gap-2">
                <span>{categoryName}</span>
                <span className="text-xs font-sans font-normal text-stone-500">
                  ({books[0].testament === 'OT' ? 'Old Testament' : 'New Testament'})
                </span>
              </h3>
              <span className="text-xs font-mono text-stone-500 tabular-nums">
                {books.reduce((acc, b) => acc + b.density, 0)} total links
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {books.map((book) => {
                const colorClass = getHeatmapColor(book.density);
                return (
                  <button
                    key={book.id}
                    onClick={() => onSelectBook(book.id, 1)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${colorClass}`}
                    title={`${book.name}: ${book.density} linked YouTube videos across ${book.chaptersCount} chapters`}
                  >
                    <div>
                      <span className="font-mono text-[11px] font-bold block">{book.abbreviation}</span>
                      <span className="font-serif-reading text-xs font-semibold block truncate leading-tight">
                        {book.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono opacity-90 pt-1 border-t border-current/20">
                      <span>{book.chaptersCount} ch</span>
                      <span className="font-bold tabular-nums">
                        {book.density > 0 ? `${book.density} vid` : '—'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
