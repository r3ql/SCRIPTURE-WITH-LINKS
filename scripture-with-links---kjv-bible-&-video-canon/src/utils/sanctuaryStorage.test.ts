import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseWhatsAppChatText,
  BIBLE_VERSE_REGEX,
  exportSanctuaryData,
  DEFAULT_USER_PROFILE,
  DEFAULT_SANCTUARY_SPACE,
  generateSpaceInviteToken,
  parseSpaceInviteToken,
} from './sanctuaryStorage.ts';

test('parseWhatsAppChatText parses WhatsApp style timestamps, names, and text', () => {
  const sample = `[14/03/2026, 19:30:12] Priscilla: Check out Romans 8:28 and John 3:16!
[14/03/2026, 19:32:00] Apollos: Look also at Genesis 1:1.`;

  const parsed = parseWhatsAppChatText(sample);
  assert.equal(parsed.messages.length, 2);
  assert.equal(parsed.messages[0].sender, 'Priscilla');
  assert.equal(parsed.messages[1].sender, 'Apollos');
  assert.ok(parsed.detectedVerses.some((v) => v.includes('Romans 8:28')));
  assert.ok(parsed.detectedVerses.some((v) => v.includes('John 3:16')));
  assert.ok(parsed.detectedVerses.some((v) => v.includes('Genesis 1:1')));
});

test('exportSanctuaryData produces valid JSON with correct metadata', () => {
  const jsonStr = exportSanctuaryData(
    DEFAULT_USER_PROFILE,
    DEFAULT_SANCTUARY_SPACE,
    {
      watchedVideoIds: ['video-1'],
      watchedSeconds: {},
      completedChapters: ['John:3'],
      readVersesCount: 36,
      totalWatchTimeMinutes: 24,
      lastActiveDate: '2026-03-20',
    },
    [],
    {},
    [],
    [],
    {},
    []
  );

  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.appName, 'SCRIPTURE WITH LINKS');
  assert.equal(parsed.exportVersion, '2.0.0');
  assert.equal(parsed.userProfile.name, 'Sanctuary Sovereign');
  assert.equal(parsed.sanctuarySpace.code, 'BEREAN-7749');
});

test('generateSpaceInviteToken and parseSpaceInviteToken encode and decode peer space payloads', () => {
  const token = generateSpaceInviteToken(
    DEFAULT_SANCTUARY_SPACE,
    DEFAULT_USER_PROFILE,
    [
      {
        id: 'link-1',
        title: 'Exegesis on John 3',
        youtubeUrl: 'https://youtube.com/watch?v=abc',
        youtubeId: 'abc12345678',
        speaker: 'Dr. Martyn Lloyd-Jones',
        channelTitle: 'Archive',
        primaryBookId: 'John',
        primaryChapter: 3,
        primaryVerseStart: 16,
        verses: ['John 3:16'],
        notes: 'God so loved the world.',
        tags: ['Theology'],
        postedBy: { name: 'Sovereign', avatar: '', handle: '@sov' },
        createdAt: '2026-01-01',
        likesCount: 1,
        commentsCount: 0,
      },
    ]
  );

  assert.ok(token.length > 10);
  const decoded = parseSpaceInviteToken(token);
  assert.ok(decoded !== null);
  assert.equal(decoded?.code, DEFAULT_SANCTUARY_SPACE.code);
  assert.equal(decoded?.name, DEFAULT_SANCTUARY_SPACE.name);
  assert.equal(decoded?.hostName, DEFAULT_USER_PROFILE.name);
  assert.equal(decoded?.curatedLinksCount, 1);
  assert.deepEqual(decoded?.featuredVerses, ['John 3:16']);
});

