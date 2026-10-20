import { BIBLE_BOOKS } from './kjvBibleData.ts';
import type { BibleBook } from '../types/index.ts';

export { BIBLE_BOOKS };

export const TESTAMENT_BOOKS = {
  OT: BIBLE_BOOKS.filter((b) => b.testament === 'OT'),
  NT: BIBLE_BOOKS.filter((b) => b.testament === 'NT'),
};

export function getBookById(id: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.id.toLowerCase() === id.toLowerCase() || b.name.toLowerCase() === id.toLowerCase());
}
