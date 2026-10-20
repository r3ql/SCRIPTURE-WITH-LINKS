import React, { useState } from 'react';
import type {
  VideoLink,
  WhatsAppRoom,
  WhatsAppMessage,
  ConversationUpload,
  TopicCategory,
} from '../types/index.ts';
import { BIBLE_BOOKS } from '../data/bibleBooks.ts';
import {
  parseWhatsAppChatText,
  downloadSanctuaryJSON,
} from '../utils/sanctuaryStorage.ts';
import {
  X,
  Upload,
  Link,
  MessageSquare,
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Youtube,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Search,
  Layers
} from 'lucide-react';

interface UploadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: TopicCategory[];
  videoLinks?: VideoLink[];
  onAddVideo: (video: Omit<VideoLink, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => void;
  onAddBulkVideos: (videos: Omit<VideoLink, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>[]) => void;
  onDeleteVideo?: (videoId: string) => void;
  onUploadConversation: (
    title: string,
    rawText: string,
    detectedVerses: string[],
    targetRoomId?: string
  ) => void;
  onDeleteConversation?: (convId: string) => void;
  onExportBackup: () => void;
  onImportBackup: (importedData: any) => boolean;
  onResetToBaseline: () => void;
  conversations: ConversationUpload[];
  onJumpToBibleVerse?: (bookId: string, chapter: number) => void;
  onOpenWhatsAppRoom?: (roomId: string) => void;
}

type UploadTab = 'links' | 'conversations' | 'manage' | 'backup';

export const UploadManagerModal: React.FC<UploadManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  videoLinks = [],
  onAddVideo,
  onAddBulkVideos,
  onDeleteVideo,
  onUploadConversation,
  onDeleteConversation,
  onExportBackup,
  onImportBackup,
  onResetToBaseline,
  conversations,
  onJumpToBibleVerse,
  onOpenWhatsAppRoom,
}) => {
  const [activeTab, setActiveTab] = useState<UploadTab>('links');
  const [manageSearch, setManageSearch] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [viewingConv, setViewingConv] = useState<ConversationUpload | null>(null);

  // Video Link Form State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [bookId, setBookId] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [verseStart, setVerseStart] = useState(16);
  const [verseEnd, setVerseEnd] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || 'cat-theology');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Conversation Upload State
  const [convTitle, setConvTitle] = useState('');
  const [convRawText, setConvRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    messagesCount: number;
    detectedVerses: string[];
  } | null>(null);

  // Status feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const handleSingleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const ytId = extractYoutubeId(youtubeUrl);
    if (!ytId) {
      setErrorMessage('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)');
      return;
    }
    if (!title.trim() || !speaker.trim()) {
      setErrorMessage('Please provide both an exposition title and teacher/speaker name.');
      return;
    }

    const verseRef = `${bookId} ${chapter}:${verseStart}${verseEnd ? `-${verseEnd}` : ''}`;

    onAddVideo({
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      youtubeId: ytId,
      speaker: speaker.trim(),
      channelTitle: `${speaker.trim()} Expositions`,
      primaryBookId: bookId,
      primaryChapter: chapter,
      primaryVerseStart: verseStart,
      primaryVerseEnd: verseEnd || undefined,
      verses: [verseRef],
      notes: notes.trim() || `Theological exposition on ${verseRef}.`,
      tags: [bookId, `${bookId} ${chapter}`, 'Exposition'],
      categoryId: selectedCatId,
      structuredSummary: {
        coreThesis: notes.trim() || `Exposition on ${verseRef}`,
        keyTakeaways: [
          `Detailed examination of ${verseRef}`,
          'Historical & grammatical context in the original text',
          'Pastoral application for Christian discipleship',
        ],
        canonicalConnection: `Connected with the broader canonical covenant in ${bookId}.`,
      },
      postedBy: {
        name: 'You (Sanctuary Sovereign)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
        handle: '@sanctuary_admin',
      },
    });

    setSuccessMessage(`Successfully uploaded and linked video for ${verseRef}!`);
    setYoutubeUrl('');
    setTitle('');
    setNotes('');
  };

  const handleBulkLinksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Allow JSON array or newline-separated lines
      if (bulkText.trim().startsWith('[')) {
        const parsed = JSON.parse(bulkText);
        if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array');
        const formatted = parsed.map((item: any) => ({
          title: item.title || 'Exposition Lecture',
          youtubeUrl: item.youtubeUrl || item.url,
          youtubeId: extractYoutubeId(item.youtubeUrl || item.url) || 'dQw4w9WgXcQ',
          speaker: item.speaker || 'Bible Teacher',
          channelTitle: item.channelTitle || 'Theological Archive',
          primaryBookId: item.primaryBookId || 'Romans',
          primaryChapter: Number(item.primaryChapter) || 1,
          primaryVerseStart: Number(item.primaryVerseStart) || 1,
          verses: item.verses || [`${item.primaryBookId || 'Romans'} 1:1`],
          notes: item.notes || 'Batch imported study exposition.',
          tags: item.tags || ['Batch Import'],
          categoryId: item.categoryId || categories[0]?.id,
          postedBy: {
            name: 'You (Sanctuary Sovereign)',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
            handle: '@sanctuary_admin',
          },
        }));
        onAddBulkVideos(formatted);
        setSuccessMessage(`Successfully batch imported ${formatted.length} video links!`);
        setBulkText('');
      } else {
        // Line by line: URL | Title | Speaker | Reference
        const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
        const imported: any[] = [];
        for (const line of lines) {
          const parts = line.split('|').map((p) => p.trim());
          const url = parts[0];
          const ytId = extractYoutubeId(url);
          if (ytId) {
            imported.push({
              title: parts[1] || `Exposition on Scripture`,
              youtubeUrl: url,
              youtubeId: ytId,
              speaker: parts[2] || 'Expository Preacher',
              channelTitle: 'Sanctuary Archive',
              primaryBookId: 'John',
              primaryChapter: 1,
              primaryVerseStart: 1,
              verses: [parts[3] || 'John 1:1'],
              notes: 'Imported via Quick Bulk Importer.',
              tags: ['Bulk Import'],
              categoryId: categories[0]?.id,
              postedBy: {
                name: 'You (Sanctuary Sovereign)',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
                handle: '@sanctuary_admin',
              },
            });
          }
        }
        if (imported.length > 0) {
          onAddBulkVideos(imported);
          setSuccessMessage(`Successfully parsed and batch imported ${imported.length} video links!`);
          setBulkText('');
        } else {
          setErrorMessage('Could not find valid YouTube URLs in the provided text.');
        }
      }
    } catch (err: any) {
      setErrorMessage(`Import error: ${err.message}`);
    }
  };

  const handleParseConversation = () => {
    if (!convRawText.trim()) return;
    const parsed = parseWhatsAppChatText(convRawText);
    setParsedPreview({
      messagesCount: parsed.messages.length,
      detectedVerses: parsed.detectedVerses,
    });
  };

  const handleUploadConversationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convRawText.trim()) {
      setErrorMessage('Please paste or load conversation text to upload.');
      return;
    }
    const parsed = parseWhatsAppChatText(convRawText);
    const titleToUse = convTitle.trim() || `Fellowship Study (${parsed.detectedVerses[0] || 'Theology'})`;

    onUploadConversation(titleToUse, convRawText, parsed.detectedVerses);
    setSuccessMessage(`Successfully uploaded conversation "${titleToUse}" and created fellowship study room!`);
    setConvTitle('');
    setConvRawText('');
    setParsedPreview(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setConvRawText(text);
        if (!convTitle) {
          setConvTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
        const parsed = parseWhatsAppChatText(text);
        setParsedPreview({
          messagesCount: parsed.messages.length,
          detectedVerses: parsed.detectedVerses,
        });
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const success = onImportBackup(parsed);
        if (success) {
          setSuccessMessage('Sanctuary restored successfully from backup file!');
        } else {
          setErrorMessage('Invalid Sanctuary backup JSON structure.');
        }
      } catch (err: any) {
        setErrorMessage('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display-sacred text-lg font-bold tracking-wide">
                Sanctuary Upload &amp; Repository Manager
              </h2>
              <p className="text-xs text-stone-300 font-sans">
                Manage video links, upload conversation transcripts, and backup your local phone sanctuary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-stone-200 bg-stone-50 px-6 shrink-0">
          <button
            onClick={() => {
              setActiveTab('links');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'links'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Link className="w-4 h-4 text-amber-800" />
            <span>Upload Video Links</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('conversations');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'conversations'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>Upload Conversations &amp; WhatsApp Chats</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manage');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'manage'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-700" />
            <span>Manage Uploads ({videoLinks.length + conversations.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('backup');
              setSuccessMessage(null);
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'backup'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Download className="w-4 h-4 text-blue-700" />
            <span>Sanctuary Backup &amp; Transfer</span>
          </button>
        </div>

        {/* Alert feedback banners */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: VIDEO LINKS UPLOAD */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Connect Expository Videos to Sacred Scripture
                  </h3>
                  <p className="text-xs text-stone-500">
                    Add YouTube sermons, theological lectures, or Greek/Hebrew exegesis directly to any chapter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setBulkMode(!bulkMode)}
                  className="text-xs font-semibold text-amber-900 hover:underline cursor-pointer"
                >
                  {bulkMode ? '← Switch to Single Video Form' : 'Switch to Bulk Import Mode →'}
                </button>
              </div>

              {!bulkMode ? (
                <form onSubmit={handleSingleLinkSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      YouTube Video URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Youtube className="w-4 h-4 absolute left-3 top-3 text-red-600" />
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        required
                        className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Exposition Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. The Sovereign Love of God"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Teacher / Speaker Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Martyn Lloyd-Jones, R.C. Sproul"
                        value={speaker}
                        onChange={(e) => setSpeaker(e.target.value)}
                        required
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>
                  </div>

                  {/* Scripture Coordinates */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-700 font-mono uppercase tracking-wider">
                      Scripture Anchor Coordinate
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">Book</label>
                        <select
                          value={bookId}
                          onChange={(e) => setBookId(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg"
                        >
                          {BIBLE_BOOKS.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.testament})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">Chapter</label>
                        <input
                          type="number"
                          min={1}
                          value={chapter}
                          onChange={(e) => setChapter(Number(e.target.value))}
                          className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">Start Verse</label>
                        <input
                          type="number"
                          min={1}
                          value={verseStart}
                          onChange={(e) => setVerseStart(Number(e.target.value))}
                          className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">End Verse (Optional)</label>
                        <input
                          type="number"
                          min={verseStart}
                          placeholder="Optional"
                          value={verseEnd || ''}
                          onChange={(e) => setVerseEnd(e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full text-xs p-2 bg-white border border-stone-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Doctrinal Category
                    </label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Summary &amp; Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Outline key theological insights, Greek roots, or exposition summary..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload &amp; Link Expository Video</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBulkLinksSubmit} className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p className="font-bold">Bulk Video Importer Formats Supported:</p>
                    <p className="text-[11px] font-mono">
                      1. Pipeline delimited lines:<br />
                      <code>https://youtube.com/watch?v=... | Title | Teacher | John 3:16</code>
                    </p>
                    <p className="text-[11px] font-mono">
                      2. JSON array of video link objects with url, title, speaker, and primaryBookId.
                    </p>
                  </div>

                  <textarea
                    rows={8}
                    placeholder={`https://www.youtube.com/watch?v=M7lc1UVf-VE | Paul's Theology of Grace | Martyn Lloyd-Jones | Romans 8:28\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ | Monergistic Regeneration | R.C. Sproul | John 3:3`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    Process &amp; Batch Import Video Links
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: CONVERSATION & WHATSAPP TRANSCRIPT UPLOAD */}
          {activeTab === 'conversations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Upload WhatsApp &amp; Fellowship Study Conversations
                </h3>
                <p className="text-xs text-stone-500">
                  Import WhatsApp chat export logs (.txt) or paste study group discussions. The parser automatically extracts scripture references and turns them into persistent study rooms.
                </p>
              </div>

              <form onSubmit={handleUploadConversationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Discussion Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wednesday Night Berean Study on Romans 8"
                    value={convTitle}
                    onChange={(e) => setConvTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Paste Chat Transcript OR Upload WhatsApp .txt Export
                    </label>
                    <label className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Choose .txt File</span>
                      <input
                        type="file"
                        accept=".txt,.json,.log"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <textarea
                    rows={7}
                    placeholder={`[14/03/2026, 19:30:12] Brother Mark: Look at Romans 8:28 today.\n[14/03/2026, 19:31:05] Sister Sarah: Notice how Paul links it to verse 29.\n[14/03/2026, 19:33:14] Brother Mark: Yes! Foreknowledge connects with Amos 3:2.`}
                    value={convRawText}
                    onChange={(e) => setConvRawText(e.target.value)}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleParseConversation}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Scan &amp; Detect Scripture References
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload &amp; Create Fellowship Room</span>
                  </button>
                </div>
              </form>

              {/* Live parser preview */}
              {parsedPreview && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950 font-mono">
                      Parsed Chat Summary
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      {parsedPreview.messagesCount} Messages Formatted
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-900 block mb-1">
                      Detected Scripture References:
                    </span>
                    {parsedPreview.detectedVerses.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {parsedPreview.detectedVerses.map((v, i) => (
                          <span
                            key={i}
                            className="bg-emerald-200/80 text-emerald-950 text-[11px] font-mono px-2 py-0.5 rounded font-semibold"
                          >
                            📖 {v}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-500 italic">
                        No explicit Bible citations detected in sample text.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Already uploaded conversations list */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide font-mono mb-3">
                  Uploaded Fellowship Transcripts ({conversations.length})
                </h4>
                <div className="space-y-2">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-stone-900">{c.title}</p>
                        <p className="text-[11px] text-stone-500">
                          {c.messageCount} messages · Verses: {c.detectedVerses.join(', ') || 'Theology'} · {c.createdAt}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono bg-stone-200 text-stone-700 px-2 py-0.5 rounded uppercase">
                        {c.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE UPLOADED CANON & CONVERSATION TRANSCRIPTS */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Repository Upload &amp; Content Management
                  </h3>
                  <p className="text-xs text-stone-500 font-sans">
                    Review, audit, jump into, or remove custom video links and uploaded study transcripts stored on this phone.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search links & transcripts..."
                    value={manageSearch}
                    onChange={(e) => setManageSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              {/* SECTION A: Video Exegesis Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide font-mono flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-rose-600" />
                    <span>Uploaded Exegesis Links ({videoLinks.length})</span>
                  </h4>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {videoLinks
                    .filter((v) =>
                      !manageSearch ||
                      v.title.toLowerCase().includes(manageSearch.toLowerCase()) ||
                      v.speaker.toLowerCase().includes(manageSearch.toLowerCase()) ||
                      v.verses.some((ref) => ref.toLowerCase().includes(manageSearch.toLowerCase()))
                    )
                    .map((v) => (
                      <div
                        key={v.id}
                        className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-stone-100/60 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 truncate">{v.title}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-mono px-1.5 py-0.5 rounded font-bold shrink-0">
                              {v.verses.join(', ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            Speaker: {v.speaker} · {v.channelTitle} · Added {v.createdAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onJumpToBibleVerse && (
                            <button
                              type="button"
                              onClick={() => {
                                onJumpToBibleVerse(v.primaryBookId, v.primaryChapter);
                                onClose();
                              }}
                              className="p-1.5 text-stone-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition"
                              title="Jump to Bible Reader"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteVideo && (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteVideo(v.id);
                                setSuccessMessage(`Removed link: "${v.title}"`);
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Delete Video Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* SECTION B: Conversation Transcripts */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide font-mono flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span>Uploaded Fellowship Transcripts ({conversations.length})</span>
                  </h4>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {conversations
                    .filter((c) =>
                      !manageSearch ||
                      c.title.toLowerCase().includes(manageSearch.toLowerCase()) ||
                      c.detectedVerses.some((v) => v.toLowerCase().includes(manageSearch.toLowerCase()))
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-stone-900 truncate">{c.title}</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {c.messageCount} messages · Verses: {c.detectedVerses.join(', ') || 'Theology'} · {c.createdAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setViewingConv(c)}
                            className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md text-[11px] font-medium flex items-center gap-1 transition"
                            title="View Transcript"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>

                          {onOpenWhatsAppRoom && c.roomId && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenWhatsAppRoom(c.roomId!);
                                onClose();
                              }}
                              className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md text-[11px] font-medium flex items-center gap-1 transition"
                              title="Open Fellowship Chat"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat</span>
                            </button>
                          )}

                          {onDeleteConversation && (
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteConversation(c.id);
                                setSuccessMessage(`Removed transcript: "${c.title}"`);
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Delete Transcript"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SANCTUARY BACKUP, RESTORE & TRANSFER */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-stone-900 text-stone-100 p-5 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Complete Block Product Data Architecture</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    Full Phone Sandbox Sovereignty
                  </h4>
                  <p className="text-xs text-stone-300 max-w-lg leading-relaxed font-sans">
                    You own all your data locally on your device. Export a complete snapshot of your links, progress, map milestones, and WhatsApp transcripts as a single JSON file, or restore onto another device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onExportBackup}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup (.json)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Import / Restore Box */}
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide font-mono flex items-center gap-2">
                    <Upload className="w-4 h-4 text-amber-800" />
                    <span>Restore Sanctuary From File</span>
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Transfer your entire study history, custom links, and conversations to this phone from an exported backup file.
                  </p>
                  <label className="inline-block px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition">
                    <span>Select Backup JSON File</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreFile}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Reset to Canonical Baseline */}
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide font-mono flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-stone-600" />
                    <span>Reset to Canonical Baseline</span>
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Revert your local repository to the default verified theological video canon and initial Berean study rooms.
                  </p>

                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="px-4 py-2 bg-stone-200 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer transition"
                    >
                      Reset Sanctuary State
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onResetToBaseline();
                          setConfirmReset(false);
                          setSuccessMessage('Sanctuary restored to canonical baseline.');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                      >
                        Confirm Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="px-3 py-1.5 bg-stone-200 text-stone-700 rounded-lg text-xs hover:bg-stone-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transcript Viewer Overlay */}
          {viewingConv && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[80vh] flex flex-col border border-stone-200">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-sm text-stone-900">{viewingConv.title}</h4>
                  <button
                    onClick={() => setViewingConv(null)}
                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <pre className="text-xs font-mono whitespace-pre-wrap text-stone-800 leading-relaxed">
                    {viewingConv.rawText}
                  </pre>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setViewingConv(null)}
                    className="px-4 py-1.5 bg-stone-800 text-white text-xs font-semibold rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
