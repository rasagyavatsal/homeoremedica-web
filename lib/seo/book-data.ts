export type SearchBookId = 'boericke' | 'clarke' | 'kent' | 'allen';

export interface BookInfo {
  id: SearchBookId;
  name: string;
  shortDescription: string;
  description: string;
}

export const SEARCH_BOOKS: BookInfo[] = [
  {
    id: 'boericke',
    name: "Boericke's Materia Medica",
    shortDescription: 'Practical bedside reference',
    description: 'Concise clinical materia medica with practical bedside indications.',
  },
  {
    id: 'clarke',
    name: "Clarke's Dictionary of Practical Materia Medica",
    shortDescription: 'Expanded clinical reference',
    description: 'Expanded repertory-style reference with practical remedy detail.',
  },
  {
    id: 'kent',
    name: "Kent's Lectures on Homoeopathic Materia Medica",
    shortDescription: 'Classical lecture-based source',
    description: 'Classical lecture-based remedy source with broader clinical framing.',
  },
  {
    id: 'allen',
    name: "Allen's Keynotes",
    shortDescription: 'Fast keynote reference',
    description: 'Concise keynote-style reference for fast clinical scanning.',
  },
];

export const BOOKS = SEARCH_BOOKS;

export function getBookInfo(bookId: string) {
  return SEARCH_BOOKS.find((book) => book.id === bookId);
}

export function getBookOptions() {
  return SEARCH_BOOKS;
}
