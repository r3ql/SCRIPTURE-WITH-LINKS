import React, { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from '../data/kjvBibleData.ts';
import { INITIAL_TOPIC_CATEGORIES } from '../data/topicCategories.ts';
import type { VideoLink, TopicCategory } from '../types/index.ts';
import {
  extractYouTubeId,
  extractYouTubeTimestamp,
  formatSecondsToTime,
  parseTimeToSeconds,
  parseScriptureRef,
} from '../utils/bibleUtils.ts';
import { X, Youtube, Plus, Trash2, Link as LinkIcon, Clock, Check, Layers, FileText } from 'lucide-react';

interface PostVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: TopicCategory[];
  onSaveVideo: (newVideo: Omit<VideoLink, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => void;
  prefillVerseRef?: string;
}

export const PostVideoModal: React.FC<PostVideoModalProps> = ({
  isOpen,
  onClose,
  categories = INITIAL_TOPIC_CATEGORIES,
  onSaveVideo,
  prefillVerseRef,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [channelTitle, setChannelTitle] = useState('');
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [verseStart, setVerseStart] = useState(16);
  const [verseEnd, setVerseEnd] = useState<number | ''>('');
  const [timestampStr, setTimestampStr] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(categories[0]?.subcategories[0]?.id || '');

  // Structured summary fields
  const [coreThesis, setCoreThesis] = useState('');
  const [takeaway1, setTakeaway1] = useState('');
  const [takeaway2, setTakeaway2] = useState('');

  const [additionalVerses, setAdditionalVerses] = useState<string[]>([]);
  const [newExtraVerse, setNewExtraVerse] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Exegesis', 'Theology']);
  const [newTagInput, setNewTagInput] = useState('');
  const [urlError, setUrlError] = useState('');

  // Handle prefill verse reference if user clicked "+ Link Video" from a specific verse in BibleReader
  useEffect(() => {
    if (prefillVerseRef) {
      const parsed = parseScriptureRef(prefillVerseRef);
      if (parsed) {
        setSelectedBook(parsed.bookName);
        setSelectedChapter(parsed.chapter);
        setVerseStart(parsed.verseStart);
        if (parsed.verseEnd) setVerseEnd(parsed.verseEnd);
      }
    }
  }, [prefillVerseRef, isOpen]);

  // Sync subcategories when category changes
  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategoryId(cat.subcategories[0].id);
    }
  }, [selectedCategoryId, categories]);

  // Automatically extract timestamp and validate YouTube ID when URL changes
  useEffect(() => {
    if (!youtubeUrl) {
      setUrlError('');
      return;
    }
    const extractedId = extractYouTubeId(youtubeUrl);
    if (!extractedId) {
      setUrlError('Please enter a valid YouTube video URL or ID.');
    } else {
      setUrlError('');
      const ts = extractYouTubeTimestamp(youtubeUrl);
      if (ts !== undefined && !timestampStr) {
        setTimestampStr(formatSecondsToTime(ts));
      }
    }
  }, [youtubeUrl]);

  if (!isOpen) return null;

  const currentBookObj = BIBLE_BOOKS.find((b) => b.id.toLowerCase() === selectedBook.toLowerCase()) || BIBLE_BOOKS[0];
  const activeCatObj = categories.find((c) => c.id === selectedCategoryId);

  const handleAddExtraVerse = () => {
    if (newExtraVerse.trim() && !additionalVerses.includes(newExtraVerse.trim())) {
      setAdditionalVerses([...additionalVerses, newExtraVerse.trim()]);
      setNewExtraVerse('');
    }
  };

  const handleRemoveExtraVerse = (v: string) => {
    setAdditionalVerses(additionalVerses.filter((item) => item !== v));
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !selectedTags.includes(newTagInput.trim())) {
      setSelectedTags([...selectedTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYouTubeId(youtubeUrl);
    if (!ytId) {
      setUrlError('A valid YouTube URL is required to link scripture.');
      return;
    }
    if (!title.trim() || !speaker.trim()) {
      return;
    }

    const primaryFormatted = verseEnd
      ? `${currentBookObj.name} ${selectedChapter}:${verseStart}-${verseEnd}`
      : `${currentBookObj.name} ${selectedChapter}:${verseStart}`;

    const allVerses = [primaryFormatted, ...additionalVerses];
    const tsSeconds = timestampStr ? parseTimeToSeconds(timestampStr) : undefined;

    const takeaways = [takeaway1, takeaway2].filter((t) => t.trim().length > 0);

    onSaveVideo({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      youtubeId: ytId,
      speaker: speaker.trim(),
      channelTitle: channelTitle.trim() || `${speaker.trim()} Exegesis`,
      timestampSeconds: tsSeconds,
      timestampFormatted: timestampStr.trim() || undefined,
      verses: allVerses,
      primaryBookId: currentBookObj.name,
      primaryChapter: selectedChapter,
      primaryVerseStart: verseStart,
      primaryVerseEnd: typeof verseEnd === 'number' ? verseEnd : undefined,
      categoryId: selectedCategoryId,
      subcategoryId: selectedSubcategoryId,
      structuredSummary: coreThesis.trim() ? {
        coreThesis: coreThesis.trim(),
        keyTakeaways: takeaways.length > 0 ? takeaways : ['Exposition of scripture text and historical context.'],
        canonicalConnection: `Anchored in ${primaryFormatted}.`,
      } : undefined,
      notes: notes.trim() || `Scripture exposition anchored in ${primaryFormatted}.`,
      tags: selectedTags,
      postedBy: {
        name: 'You (Fellow Berean)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        handle: '@berean_disciple',
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-serif-reading font-bold text-stone-900">
              Link YouTube Video to Holy Scripture &amp; Topic
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-500 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {/* YouTube URL input */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
              YouTube Video URL or ID *
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                required
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className={`w-full text-sm pl-9 pr-3 py-2 bg-stone-50 border rounded-lg focus:outline-none focus:ring-1 ${
                  urlError
                    ? 'border-red-400 focus:ring-red-500'
                    : 'border-stone-200 focus:ring-amber-900'
                }`}
              />
            </div>
            {urlError && <p className="text-xs text-red-600 mt-1">{urlError}</p>}
          </div>

          {/* Topic Category & Subsection */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-900 font-bold">
              <Layers className="w-4 h-4" />
              <span>Topical Taxonomy Assignment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Topic Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Topical Subsection</label>
                <select
                  value={selectedSubcategoryId}
                  onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-900"
                >
                  {activeCatObj?.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Video Title and Speaker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                Video Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Exegesis of John 3:16"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                Speaker / Exegete *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. John Piper, Tim Mackie, R.C. Sproul"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
            </div>
          </div>

          {/* Channel Name & Timestamp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                Channel Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Desiring God, BibleProject"
                value={channelTitle}
                onChange={(e) => setChannelTitle(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
                Scripture Mention Timestamp (mm:ss)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="e.g. 03:45 or 1:02:15"
                  value={timestampStr}
                  onChange={(e) => setTimestampStr(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Primary Scripture Linking Section */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-stone-200 space-y-3">
            <span className="block text-xs font-mono uppercase tracking-wider text-amber-900 font-bold">
              Scripture Passage Anchor
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Book */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-stone-500 mb-0.5">Bible Book</label>
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value);
                    setSelectedChapter(1);
                  }}
                  className="w-full text-sm bg-white border border-stone-200 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-900"
                >
                  {BIBLE_BOOKS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.testament})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="block text-[11px] text-stone-500 mb-0.5">Chapter</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(parseInt(e.target.value, 10))}
                  className="w-full text-sm bg-white border border-stone-200 rounded-md p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-900 tabular-nums"
                >
                  {Array.from({ length: currentBookObj.chaptersCount }, (_, i) => i + 1).map((ch) => (
                    <option key={ch} value={ch}>
                      Ch. {ch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verse range */}
              <div>
                <label className="block text-[11px] text-stone-500 mb-0.5">Verse (Start - End)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={176}
                    value={verseStart}
                    onChange={(e) => setVerseStart(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs bg-white border border-stone-200 rounded-md p-1.5 text-center font-mono tabular-nums"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min={1}
                    max={176}
                    placeholder="End"
                    value={verseEnd}
                    onChange={(e) => setVerseEnd(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full text-xs bg-white border border-stone-200 rounded-md p-1.5 text-center font-mono tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Additional Cross-Referenced Verses */}
            <div className="pt-2 border-t border-stone-200">
              <label className="block text-[11px] text-stone-500 mb-1">
                Additional Cross-Referenced Verses (Multi-verse combination)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Romans 8:28, Genesis 1:1"
                  value={newExtraVerse}
                  onChange={(e) => setNewExtraVerse(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddExtraVerse}
                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-md text-xs font-medium cursor-pointer"
                >
                  + Add Verse
                </button>
              </div>

              {additionalVerses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {additionalVerses.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-mono"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraVerse(v)}
                        className="hover:text-red-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Structured Summary Section */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-800 font-bold">
              <FileText className="w-4 h-4 text-amber-800" />
              <span>Structured Video Summary (Optional)</span>
            </div>

            <div>
              <label className="block text-[11px] text-stone-600 mb-1">Core Exegetical Thesis</label>
              <input
                type="text"
                placeholder="Central theological argument made in this exposition..."
                value={coreThesis}
                onChange={(e) => setCoreThesis(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Key Takeaway 1</label>
                <input
                  type="text"
                  placeholder="Primary Greek/Hebrew or contextual point..."
                  value={takeaway1}
                  onChange={(e) => setTakeaway1(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Key Takeaway 2</label>
                <input
                  type="text"
                  placeholder="Theological application..."
                  value={takeaway2}
                  onChange={(e) => setTakeaway2(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Exegetical Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
              General Expository Notes
            </label>
            <textarea
              rows={2}
              placeholder="What theological insight or Hebrew/Greek nuance does this video highlight for this verse?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm p-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-900 placeholder:text-stone-400 font-serif-reading text-base"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 uppercase tracking-wider mb-1">
              Theological Topic Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Christology, Covenant, Grace, Eschatology"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-md text-xs font-medium cursor-pointer"
              >
                + Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-xs"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-amber-900 hover:bg-amber-800 active:bg-amber-950 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Link Video into Canon Web
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
