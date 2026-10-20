import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractYouTubeId,
  extractYouTubeTimestamp,
  formatSecondsToTime,
  parseTimeToSeconds,
  parseScriptureRef,
  isVerseCoveredByLink,
  buildLinkDirectoryTree,
} from './bibleUtils.ts';
import type { VideoLink } from '../types/index.ts';

test('extractYouTubeId extracts IDs from standard formats', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeId('https://example.com/invalid'), null);
});

test('extractYouTubeTimestamp parses seconds and composite times', () => {
  assert.equal(extractYouTubeTimestamp('https://youtu.be/dQw4w9WgXcQ?t=124'), 124);
  assert.equal(extractYouTubeTimestamp('https://youtube.com/watch?v=abc12345678&t=2m15s'), 135);
  assert.equal(extractYouTubeTimestamp('https://youtube.com/watch?v=abc12345678&start=60'), 60);
  assert.equal(extractYouTubeTimestamp('https://youtube.com/watch?v=abc12345678'), undefined);
});

test('formatSecondsToTime and parseTimeToSeconds convert accurately', () => {
  assert.equal(formatSecondsToTime(0), '0:00');
  assert.equal(formatSecondsToTime(65), '1:05');
  assert.equal(formatSecondsToTime(3665), '1:01:05');

  assert.equal(parseTimeToSeconds('1:05'), 65);
  assert.equal(parseTimeToSeconds('01:01:05'), 3665);
  assert.equal(parseTimeToSeconds('45'), 45);
});

test('parseScriptureRef parses single and ranged verse references', () => {
  const single = parseScriptureRef('John 3:16');
  assert.ok(single);
  assert.equal(single?.bookName, 'John');
  assert.equal(single?.chapter, 3);
  assert.equal(single?.verseStart, 16);
  assert.equal(single?.verseEnd, undefined);

  const range = parseScriptureRef('Romans 8:28-30');
  assert.ok(range);
  assert.equal(range?.bookName, 'Romans');
  assert.equal(range?.chapter, 8);
  assert.equal(range?.verseStart, 28);
  assert.equal(range?.verseEnd, 30);

  const epistle = parseScriptureRef('1 Corinthians 13:4');
  assert.ok(epistle);
  assert.equal(epistle?.bookName, '1 Corinthians');
  assert.equal(epistle?.chapter, 13);
  assert.equal(epistle?.verseStart, 4);

  assert.equal(parseScriptureRef('Not a reference'), null);
});

test('isVerseCoveredByLink identifies verse matches including ranges', () => {
  const mockLink: VideoLink = {
    id: 'link-1',
    title: 'Love Chapter Exegesis',
    youtubeUrl: 'https://youtube.com/watch?v=abc12345678',
    youtubeId: 'abc12345678',
    speaker: 'Pastor Paul',
    channelTitle: 'Biblical Studies',
    verses: ['1 Corinthians 13:4-7', 'John 3:16'],
    primaryBookId: '1 Corinthians',
    primaryChapter: 13,
    primaryVerseStart: 4,
    primaryVerseEnd: 7,
    notes: 'Exegesis on agape love',
    tags: ['love', 'charity'],
    postedBy: { name: 'Kevin M', avatar: '', handle: '@kevin' },
    createdAt: '2026-01-01',
    likesCount: 12,
    commentsCount: 3,
  };

  assert.equal(isVerseCoveredByLink('1 Corinthians', 13, 4, mockLink), true);
  assert.equal(isVerseCoveredByLink('1 Corinthians', 13, 6, mockLink), true);
  assert.equal(isVerseCoveredByLink('1 Corinthians', 13, 7, mockLink), true);
  assert.equal(isVerseCoveredByLink('1 Corinthians', 13, 8, mockLink), false);
  assert.equal(isVerseCoveredByLink('John', 3, 16, mockLink), true);
  assert.equal(isVerseCoveredByLink('John', 3, 17, mockLink), false);
});

test('buildLinkDirectoryTree organizes links into testament and book hierarchy', () => {
  const links: VideoLink[] = [
    {
      id: 'l1',
      title: 'Creation Theology',
      youtubeUrl: 'https://youtu.be/test1234567',
      youtubeId: 'test1234567',
      speaker: 'Scholar A',
      channelTitle: 'Genesis Channel',
      verses: ['Genesis 1:1-3'],
      primaryBookId: 'Genesis',
      primaryChapter: 1,
      primaryVerseStart: 1,
      notes: 'In the beginning',
      tags: ['creation'],
      postedBy: { name: 'User', avatar: '', handle: '@u' },
      createdAt: '2026-01-01',
      likesCount: 5,
      commentsCount: 1,
    },
    {
      id: 'l2',
      title: 'Grace and Faith',
      youtubeUrl: 'https://youtu.be/test9876543',
      youtubeId: 'test9876543',
      speaker: 'Scholar B',
      channelTitle: 'Romans Channel',
      verses: ['Romans 8:28'],
      primaryBookId: 'Romans',
      primaryChapter: 8,
      primaryVerseStart: 28,
      notes: 'All things work together',
      tags: ['grace'],
      postedBy: { name: 'User', avatar: '', handle: '@u' },
      createdAt: '2026-01-01',
      likesCount: 8,
      commentsCount: 2,
    },
  ];

  const tree = buildLinkDirectoryTree(links);
  assert.equal(tree['Old Testament'].count, 1);
  assert.equal(tree['New Testament'].count, 1);
  assert.ok(tree['Old Testament'].children?.['Genesis']);
  assert.ok(tree['New Testament'].children?.['Romans']);
});
