import { BIBLE_BOOKS } from '../data/kjvBibleData.ts';
import type { TimedComment } from '../types/index.ts';

export const TOTAL_BIBLE_CHAPTERS = 1189; // 929 OT + 260 NT in canonical KJV

export interface DivisionMetric {
  division: string;
  read: number;
  total: number;
  percentage: number;
}

export interface BibleCanonicalProgress {
  totalChaptersRead: number;
  totalBibleChapters: number;
  overallPercentage: number;
  otChaptersRead: number;
  otTotalChapters: number;
  otPercentage: number;
  ntChaptersRead: number;
  ntTotalChapters: number;
  ntPercentage: number;
  divisionProgress: DivisionMetric[];
}

/**
 * Calculates user's progress through the whole King James Bible (1,189 chapters)
 */
export function calculateCanonicalBibleProgress(completedChapters: string[]): BibleCanonicalProgress {
  const completedSet = new Set(completedChapters.map((c) => c.toLowerCase()));

  let otTotal = 0;
  let otRead = 0;
  let ntTotal = 0;
  let ntRead = 0;

  const categoryMap: Record<string, { total: number; read: number }> = {};

  for (const book of BIBLE_BOOKS) {
    const isOT = book.testament === 'OT';
    if (!categoryMap[book.category]) {
      categoryMap[book.category] = { total: 0, read: 0 };
    }

    categoryMap[book.category].total += book.chaptersCount;
    if (isOT) otTotal += book.chaptersCount;
    else ntTotal += book.chaptersCount;

    for (let ch = 1; ch <= book.chaptersCount; ch++) {
      const key = `${book.id.toLowerCase()}:${ch}`;
      if (completedSet.has(key)) {
        categoryMap[book.category].read += 1;
        if (isOT) otRead += 1;
        else ntRead += 1;
      }
    }
  }

  const divisionProgress: DivisionMetric[] = Object.entries(categoryMap).map(([division, data]) => ({
    division,
    read: data.read,
    total: data.total,
    percentage: data.total > 0 ? Math.round((data.read / data.total) * 100) : 0,
  }));

  const totalRead = otRead + ntRead;
  const overallPercentage = Math.round((totalRead / TOTAL_BIBLE_CHAPTERS) * 100);
  const otPercentage = otTotal > 0 ? Math.round((otRead / otTotal) * 100) : 0;
  const ntPercentage = ntTotal > 0 ? Math.round((ntRead / ntTotal) * 100) : 0;

  return {
    totalChaptersRead: totalRead,
    totalBibleChapters: TOTAL_BIBLE_CHAPTERS,
    overallPercentage,
    otChaptersRead: otRead,
    otTotalChapters: otTotal,
    otPercentage,
    ntChaptersRead: ntRead,
    ntTotalChapters: ntTotal,
    ntPercentage,
    divisionProgress,
  };
}

/**
 * Finds the timed comment that is active at current player playback position (seconds)
 * Window: triggers 2 seconds before the timestamp and stays visible for up to 15 seconds
 */
export function findActiveTimedComment(
  comments: TimedComment[] | undefined,
  currentSeconds: number
): TimedComment | null {
  if (!comments || comments.length === 0) return null;

  // Find comment whose timestamp is within active playback window
  for (const comment of comments) {
    const start = Math.max(0, comment.timestampSeconds - 2);
    const end = comment.timestampSeconds + 15;
    if (currentSeconds >= start && currentSeconds <= end) {
      return comment;
    }
  }
  return null;
}

/**
 * Calculates anonymous trail similarity (0 - 100%) between two pilgrims
 */
export function calculateTrailSimilarity(
  userBooks: string[],
  peerBooks: string[],
  userTopics: string[],
  peerTopics: string[]
): number {
  if (userBooks.length === 0 && userTopics.length === 0) return 60; // baseline discovery

  const userBookSet = new Set(userBooks.map((b) => b.toLowerCase()));
  const commonBooks = peerBooks.filter((b) => userBookSet.has(b.toLowerCase())).length;
  const bookScore = peerBooks.length > 0 ? (commonBooks / Math.max(userBooks.length, peerBooks.length)) : 0;

  const userTopicSet = new Set(userTopics.map((t) => t.toLowerCase()));
  const commonTopics = peerTopics.filter((t) => userTopicSet.has(t.toLowerCase())).length;
  const topicScore = peerTopics.length > 0 ? (commonTopics / Math.max(userTopics.length, peerTopics.length)) : 0;

  const rawPercent = Math.round((bookScore * 0.6 + topicScore * 0.4) * 100);
  return Math.min(Math.max(rawPercent, 45), 98);
}

/**
 * Formats watch time minutes into readable string
 */
export function formatWatchTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hrs = Math.floor(minutes / 60);
  const remMins = minutes % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hours`;
}
