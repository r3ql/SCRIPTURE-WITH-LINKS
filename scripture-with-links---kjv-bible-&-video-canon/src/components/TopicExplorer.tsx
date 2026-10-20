import React, { useState, useMemo } from 'react';
import type { TopicCategory, TopicSubcategory, VideoLink } from '../types/index.ts';
import {
  Layers,
  FolderTree,
  Plus,
  Play,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Sparkles,
  FileText,
  Search,
  MessageCircle,
  Tag
} from 'lucide-react';

interface TopicExplorerProps {
  categories: TopicCategory[];
  videoLinks: VideoLink[];
  onOpenVideo: (video: VideoLink) => void;
  onJumpToBibleVerse: (bookId: string, chapter: number) => void;
  onOpenWhatsAppForVideo: (video: VideoLink) => void;
  onCreateCategory: (name: string, description: string) => void;
  onCreateSubcategory: (parentCategoryId: string, name: string, description: string) => void;
  onOpenPostModal: () => void;
}

export const TopicExplorer: React.FC<TopicExplorerProps> = ({
  categories,
  videoLinks,
  onOpenVideo,
  onJumpToBibleVerse,
  onOpenWhatsAppForVideo,
  onCreateCategory,
  onCreateSubcategory,
  onOpenPostModal,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for creating new category / subcategory
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [isNewSubModalOpen, setIsNewSubModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  const activeCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Videos under the active category / subcategory
  const categoryVideos = useMemo(() => {
    return videoLinks.filter((v) => {
      // Direct category match or tag heuristic
      const matchesCat =
        v.categoryId === selectedCategoryId ||
        v.tags.some((t) =>
          activeCategory?.name.toLowerCase().includes(t.toLowerCase())
        );

      if (!matchesCat) return false;

      if (selectedSubcategoryId !== 'all' && v.subcategoryId) {
        if (v.subcategoryId !== selectedSubcategoryId) return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          v.title.toLowerCase().includes(q) ||
          v.speaker.toLowerCase().includes(q) ||
          v.notes.toLowerCase().includes(q) ||
          v.verses.some((ver) => ver.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [videoLinks, selectedCategoryId, selectedSubcategoryId, activeCategory, searchQuery]);

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onCreateCategory(newCatName.trim(), newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
    setIsNewCatModalOpen(false);
  };

  const handleCreateSubcategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !activeCategory) return;
    onCreateSubcategory(activeCategory.id, newSubName.trim(), newSubDesc.trim());
    setNewSubName('');
    setNewSubDesc('');
    setIsNewSubModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-900 font-semibold">
            Theological Taxonomy &amp; Expository Framework
          </span>
          <h1 className="text-3xl font-serif-reading font-semibold text-stone-900 mt-1">
            Theological Topic Categories &amp; Subsections
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl font-sans">
            Explore video expositions organized by biblical doctrine and topical subsections, complete with structured summaries and scriptural exegesis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsNewCatModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer border border-stone-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Category</span>
          </button>
          <button
            onClick={onOpenPostModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-amber-900 hover:bg-amber-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Video Under Topic</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Categories Navigation Column + Videos Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Categories and Subsections Rail (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
                Categories ({categories.length})
              </span>
              <button
                onClick={() => setIsNewCatModalOpen(true)}
                className="text-xs text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                const vidsCount = videoLinks.filter(
                  (v) =>
                    v.categoryId === cat.id ||
                    v.tags.some((t) => cat.name.toLowerCase().includes(t.toLowerCase()))
                ).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedSubcategoryId('all');
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-900 text-white shadow-xs font-medium'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-serif-reading text-base font-semibold block truncate leading-tight">
                        {cat.name}
                      </span>
                      <span className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                        {cat.subcategories.length} subsections
                      </span>
                    </div>

                    <span className={`text-xs font-mono tabular-nums px-2 py-0.5 rounded ${
                      isSelected ? 'bg-amber-800 text-white' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {vidsCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subsections of Active Category */}
          {activeCategory && (
            <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-semibold">
                  Subsections in {activeCategory.name.slice(0, 18)}...
                </span>
                <button
                  onClick={() => setIsNewSubModalOpen(true)}
                  className="text-xs text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Sub</span>
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setSelectedSubcategoryId('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                    selectedSubcategoryId === 'all'
                      ? 'bg-stone-800 text-white font-medium'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <span>All Subsections</span>
                  <span className="font-mono text-[10px] tabular-nums opacity-80">
                    {categoryVideos.length}
                  </span>
                </button>

                {activeCategory.subcategories.map((sub) => {
                  const isSelected = selectedSubcategoryId === sub.id;
                  const count = videoLinks.filter((v) => v.subcategoryId === sub.id).length;

                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategoryId(sub.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-900 text-white font-medium'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block truncate">{sub.name}</span>
                      </div>
                      <span className="font-mono text-[10px] tabular-nums opacity-80">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Videos under active category and structured summaries (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Category Banner and Search */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-900 font-bold">
                  Active Category
                </span>
                <h2 className="text-2xl font-serif-reading font-bold text-stone-900">
                  {activeCategory?.name}
                </h2>
                <p className="text-xs text-stone-500 mt-1 max-w-xl">
                  {activeCategory?.description}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter category videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>
            </div>

            {/* Subsection Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-100 text-xs">
              <span className="text-stone-400 mr-1 text-[11px]">Subsection:</span>
              <button
                onClick={() => setSelectedSubcategoryId('all')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                  selectedSubcategoryId === 'all'
                    ? 'bg-amber-900 text-white font-medium'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All
              </button>
              {activeCategory?.subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategoryId(sub.id)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer truncate max-w-[200px] ${
                    selectedSubcategoryId === sub.id
                      ? 'bg-amber-900 text-white font-medium'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Videos List with Structured Summaries */}
          <div className="space-y-5">
            {categoryVideos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
                <p className="text-sm font-medium mb-3">
                  No video expositions posted under this subsection yet.
                </p>
                <button
                  onClick={onOpenPostModal}
                  className="px-4 py-2 bg-amber-900 text-white text-xs font-medium rounded-lg hover:bg-amber-800 transition-colors cursor-pointer"
                >
                  + Link a YouTube Video Here
                </button>
              </div>
            ) : (
              categoryVideos.map((video) => {
                const subcategoryObj = activeCategory?.subcategories.find(
                  (s) => s.id === video.subcategoryId
                );

                return (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-sm transition-all overflow-hidden"
                  >
                    {/* Top Row: Thumbnail + Info */}
                    <div className="p-5 flex flex-col sm:flex-row gap-4">
                      {/* Video Thumbnail */}
                      <div
                        onClick={() => onOpenVideo(video)}
                        className="relative w-full sm:w-52 aspect-video bg-stone-900 rounded-xl overflow-hidden shrink-0 cursor-pointer group"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>

                        {video.timestampFormatted && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                            @{video.timestampFormatted}
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1 text-xs text-stone-500">
                            {subcategoryObj && (
                              <span className="font-mono text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                                {subcategoryObj.name}
                              </span>
                            )}
                            <span className="font-semibold text-stone-800">{video.speaker}</span>
                            <span aria-hidden="true">·</span>
                            <span>{video.channelTitle}</span>
                          </div>

                          <h3
                            onClick={() => onOpenVideo(video)}
                            className="font-serif-reading text-xl font-bold text-stone-900 hover:text-amber-900 cursor-pointer leading-snug mb-2"
                          >
                            {video.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {video.verses.map((v) => (
                              <button
                                key={v}
                                onClick={() => onJumpToBibleVerse(video.primaryBookId, video.primaryChapter)}
                                className="text-xs font-mono font-medium text-amber-950 bg-amber-100/70 hover:bg-amber-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                          <div className="flex items-center gap-3 text-stone-500 font-mono text-[11px] tabular-nums">
                            <span>{video.likesCount} likes</span>
                            <span>·</span>
                            <span>{video.timedComments?.length || video.commentsCount} comments</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onOpenWhatsAppForVideo(video)}
                              className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                              title="Open WhatsApp Room"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenVideo(video)}
                              className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Play &amp; Timestamps</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Structured Summary Drawer if present */}
                    {video.structuredSummary && (
                      <div className="bg-[#FAF8F5] p-4 border-t border-stone-200/80 text-xs text-stone-700 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-900 font-semibold font-mono uppercase tracking-wider text-[11px]">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Structured Theological Summary</span>
                        </div>

                        <p className="font-serif-reading text-sm italic text-stone-900">
                          "{video.structuredSummary.coreThesis}"
                        </p>

                        <div className="space-y-1 pt-1">
                          {video.structuredSummary.keyTakeaways.map((point, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-amber-800 font-bold">•</span>
                              <span className="text-stone-700 leading-relaxed">{point}</span>
                            </div>
                          ))}
                        </div>

                        {video.structuredSummary.canonicalConnection && (
                          <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/60 font-sans">
                            <strong className="text-stone-700">Canonical Echo:</strong> {video.structuredSummary.canonicalConnection}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal: Create New Category */}
      {isNewCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="font-serif-reading text-xl font-bold text-stone-900 mb-2">
              Create Theological Topic Category
            </h3>
            <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pneumatology & The Holy Spirit"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What biblical doctrine or aspect does this category cover?"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCatModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-md text-xs font-medium cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Subcategory */}
      {isNewSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="font-serif-reading text-xl font-bold text-stone-900 mb-1">
              Add Subsection to {activeCategory?.name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Create a specific subtopic to group related video expositions.
            </p>
            <form onSubmit={handleCreateSubcategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Subsection Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Comforter in John 14-16"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Focus of this subcategory..."
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-900 hover:bg-amber-800 text-white rounded-md text-xs font-medium cursor-pointer"
                >
                  Add Subsection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
