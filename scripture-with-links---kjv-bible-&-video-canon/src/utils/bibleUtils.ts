import type { VideoLink } from '../types/index.ts';

/**
 * Extracts YouTube Video ID from any standard YouTube URL
 * Handles:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-char ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  const match = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/**
 * Parses timestamp parameter from a URL (e.g. ?t=124s, ?t=2m15s, ?t=130)
 * Returns seconds as a number, or undefined
 */
export function extractYouTubeTimestamp(url: string): number | undefined {
  if (!url) return undefined;
  const match = url.match(/[?&](?:t|start)=([0-9a-zA-Z]+)/);
  if (!match) return undefined;

  const raw = match[1];
  if (/^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }

  // Handle format like 1h2m3s or 2m15s
  let totalSeconds = 0;
  const hMatch = raw.match(/(\d+)h/);
  const mMatch = raw.match(/(\d+)m/);
  const sMatch = raw.match(/(\d+)s/);

  if (hMatch) totalSeconds += parseInt(hMatch[1], 10) * 3600;
  if (mMatch) totalSeconds += parseInt(mMatch[1], 10) * 60;
  if (sMatch) totalSeconds += parseInt(sMatch[1], 10);

  return totalSeconds > 0 ? totalSeconds : undefined;
}

/**
 * Formats seconds into mm:ss or hh:mm:ss
 */
export function formatSecondsToTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses a string timestamp like "03:45" or "1:02:15" into seconds
 */
export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':').map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p))) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

export interface ParsedVerseRef {
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  raw: string;
}

/**
 * Parses standard biblical reference strings like:
 * "John 3:16", "Genesis 1:1-3", "1 Corinthians 13:4", "Romans 8:28"
 */
export function parseScriptureRef(ref: string): ParsedVerseRef | null {
  if (!ref) return null;
  const trimmed = ref.trim();
  // Regex to match "Book [Chapter]:[VerseStart](-[VerseEnd])"
  const regex = /^((?:[1-3]\s+)?[a-zA-Z\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
  const match = trimmed.match(regex);
  if (!match) return null;

  return {
    bookName: match[1].trim(),
    chapter: parseInt(match[2], 10),
    verseStart: parseInt(match[3], 10),
    verseEnd: match[4] ? parseInt(match[4], 10) : undefined,
    raw: trimmed,
  };
}

/**
 * Normalizes verse comparison: checks if a specific verse (e.g. John 3:16)
 * is matched by a link's verse tag (which could be "John 3:16" or "John 3:16-18")
 */
export function isVerseCoveredByLink(
  bookName: string,
  chapter: number,
  verseNum: number,
  link: VideoLink
): boolean {
  for (const vRef of link.verses) {
    const parsed = parseScriptureRef(vRef);
    if (!parsed) {
      if (vRef.toLowerCase().includes(`${bookName.toLowerCase()} ${chapter}:${verseNum}`)) {
        return true;
      }
      continue;
    }
    const bookMatches =
      parsed.bookName.toLowerCase() === bookName.toLowerCase() ||
      link.primaryBookId.toLowerCase() === bookName.toLowerCase();

    if (bookMatches && parsed.chapter === chapter) {
      if (parsed.verseEnd) {
        if (verseNum >= parsed.verseStart && verseNum <= parsed.verseEnd) {
          return true;
        }
      } else if (parsed.verseStart === verseNum) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Calculates link density (total video count) for each chapter or verse
 */
export function calculateBookDensity(bookId: string, links: VideoLink[]): number {
  return links.filter(
    (l) => l.primaryBookId.toLowerCase() === bookId.toLowerCase() ||
      l.verses.some((v) => v.toLowerCase().startsWith(bookId.toLowerCase()))
  ).length;
}

/**
 * Calculates link density for a specific chapter
 */
export function calculateChapterDensity(
  bookId: string,
  chapter: number,
  links: VideoLink[]
): number {
  return links.filter((l) => {
    if (l.primaryBookId.toLowerCase() === bookId.toLowerCase() && l.primaryChapter === chapter) {
      return true;
    }
    return l.verses.some((v) => {
      const parsed = parseScriptureRef(v);
      return (
        parsed &&
        parsed.bookName.toLowerCase().includes(bookId.toLowerCase()) &&
        parsed.chapter === chapter
      );
    });
  }).length;
}

/**
 * Groups video links into a structured directory tree:
 * Testament -> Book -> Chapter -> Links
 */
export interface FolderTreeNode {
  name: string;
  count: number;
  type: 'testament' | 'book' | 'chapter' | 'verse';
  children?: Record<string, FolderTreeNode>;
  links?: VideoLink[];
}

export function buildLinkDirectoryTree(links: VideoLink[]): Record<string, FolderTreeNode> {
  const root: Record<string, FolderTreeNode> = {
    'New Testament': { name: 'New Testament', count: 0, type: 'testament', children: {} },
    'Old Testament': { name: 'Old Testament', count: 0, type: 'testament', children: {} },
  };

  const otBooks = new Set([
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'joshua',
    'judges', 'ruth', '1 samuel', '2 samuel', '1 kings', '2 kings',
    '1 chronicles', '2 chronicles', 'ezra', 'nehemiah', 'esther', 'job',
    'psalms', 'proverbs', 'ecclesiastes', 'song of solomon', 'isaiah',
    'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel',
    'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah',
    'haggai', 'zechariah', 'malachi'
  ]);

  for (const link of links) {
    const isOT = otBooks.has(link.primaryBookId.toLowerCase());
    const testamentKey = isOT ? 'Old Testament' : 'New Testament';
    const testamentNode = root[testamentKey];
    testamentNode.count++;

    const bookKey = link.primaryBookId;
    if (!testamentNode.children![bookKey]) {
      testamentNode.children![bookKey] = {
        name: bookKey,
        count: 0,
        type: 'book',
        children: {},
      };
    }
    const bookNode = testamentNode.children![bookKey];
    bookNode.count++;

    const chapterKey = `Chapter ${link.primaryChapter}`;
    if (!bookNode.children![chapterKey]) {
      bookNode.children![chapterKey] = {
        name: chapterKey,
        count: 0,
        type: 'chapter',
        links: [],
      };
    }
    const chapterNode = bookNode.children![chapterKey];
    chapterNode.count++;
    chapterNode.links!.push(link);
  }

  return root;
}
