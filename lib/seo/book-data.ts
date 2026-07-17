export const SEARCH_BOOK_IDS = [
  'clarke-MM',
  'boericke-MM',
  'kent-lectures',
  'allen-nosodes',
] as const;

export type SearchBookId = (typeof SEARCH_BOOK_IDS)[number];

export interface BookInfo {
  id: SearchBookId;
  fullName: string;
  shortName: string;
  cover: {
    src: string;
    width: number;
    height: number;
  };
}

export const SEARCH_BOOKS: BookInfo[] = [
  {
    id: 'clarke-MM',
    fullName: 'A DICTIONARY OF PRACTICAL\nMATERIA MEDICA\nBy John Henry CLARKE, M.D.',
    shortName: 'clarke materia medica',
    cover: { src: '/source-covers/clarke-MM.jpg', width: 298, height: 411 },
  },
  {
    id: 'boericke-MM',
    fullName: 'HOMEOPATHIC MATERIA MEDICA\nby William BOERICKE, M.D.',
    shortName: 'boericke materia medica',
    cover: { src: '/source-covers/boericke-MM.jpg', width: 301, height: 371 },
  },
  {
    id: 'kent-lectures',
    fullName: 'LECTURES ON HOMEOPATHIC MATERIA MEDICAL\nby JAMES TYLER KENT, A.M., M.D.',
    shortName: 'kent lectures',
    cover: { src: '/source-covers/kent-lectures.jpg', width: 366, height: 543 },
  },
  {
    id: 'allen-nosodes',
    fullName: 'The Materia Medica of the Nosodes.\nBy Henry Clay ALLEN, M. D.',
    shortName: 'allen nosodes',
    cover: { src: '/source-covers/allen-nosodes.jpg', width: 223, height: 275 },
  },
];

export function getBookInfo(bookId: string) {
  return SEARCH_BOOKS.find((book) => book.id === bookId);
}

export function isSearchBookId(bookId: unknown): bookId is SearchBookId {
  return typeof bookId === 'string' && SEARCH_BOOK_IDS.some((candidate) => candidate === bookId);
}

export function getBookName(bookId: string, variant: 'full' | 'short' = 'short') {
  const book = getBookInfo(bookId);
  if (!book) return bookId;
  return variant === 'full' ? book.fullName : book.shortName;
}
