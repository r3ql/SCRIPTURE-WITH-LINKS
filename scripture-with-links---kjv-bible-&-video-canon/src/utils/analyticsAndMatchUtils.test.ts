import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCanonicalBibleProgress,
  findActiveTimedComment,
  calculateTrailSimilarity,
  formatWatchTime,
  TOTAL_BIBLE_CHAPTERS,
} from './analyticsAndMatchUtils.ts';
import type { TimedComment } from '../types/index.ts';

test('calculateCanonicalBibleProgress accurately calculates whole bible metrics', () => {
  const completed = ['john:1', 'john:2', 'john:3', 'romans:8', 'genesis:1'];
  const progress = calculateCanonicalBibleProgress(completed);

  assert.equal(progress.totalBibleChapters, 1189);
  assert.equal(progress.totalChaptersRead, 5);
  assert.equal(progress.otChaptersRead, 1); // Genesis 1
  assert.equal(progress.ntChaptersRead, 4); // John 1, 2, 3, Romans 8
  assert.ok(progress.divisionProgress.length > 0);
});

test('findActiveTimedComment identifies comment within active playback window', () => {
  const mockComments: TimedComment[] = [
    {
      id: 'tc-1',
      videoId: 'v-1',
      timestampSeconds: 120, // 02:00
      timestampFormatted: '02:00',
      author: { name: 'Berean', avatar: '', handle: '@berean' },
      content: 'Important Greek grammatical nuance here',
      createdAt: '1d ago',
      likes: 5,
    },
    {
      id: 'tc-2',
      videoId: 'v-1',
      timestampSeconds: 300, // 05:00
      timestampFormatted: '05:00',
      author: { name: 'Scholar', avatar: '', handle: '@scholar' },
      content: 'Canonical synthesis',
      createdAt: '2d ago',
      likes: 2,
    },
  ];

  // At 119 seconds (1 second before 120s), tc-1 should be active
  const active1 = findActiveTimedComment(mockComments, 119);
  assert.equal(active1?.id, 'tc-1');

  // At 125 seconds (5 seconds after 120s), tc-1 should still be active
  const active2 = findActiveTimedComment(mockComments, 125);
  assert.equal(active2?.id, 'tc-1');

  // At 200 seconds, neither should be active
  const inactive = findActiveTimedComment(mockComments, 200);
  assert.equal(inactive, null);

  // At 305 seconds, tc-2 should be active
  const active3 = findActiveTimedComment(mockComments, 305);
  assert.equal(active3?.id, 'tc-2');
});

test('calculateTrailSimilarity scores overlap between pilgrims', () => {
  const simHigh = calculateTrailSimilarity(
    ['John', 'Romans', 'Genesis'],
    ['John', 'Romans', 'Genesis'],
    ['Soteriology', 'Christology'],
    ['Soteriology', 'Christology']
  );
  assert.ok(simHigh >= 90);

  const simLow = calculateTrailSimilarity(
    ['Revelation'],
    ['Leviticus'],
    ['Eschatology'],
    ['Sacrificial Law']
  );
  assert.ok(simLow <= 60);
});

test('formatWatchTime outputs formatted strings', () => {
  assert.equal(formatWatchTime(45), '45 min');
  assert.equal(formatWatchTime(60), '1 hours');
  assert.equal(formatWatchTime(125), '2h 5m');
});
