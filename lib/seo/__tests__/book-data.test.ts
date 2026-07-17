import { describe, expect, it } from 'vitest';

import { SEARCH_BOOKS } from '@/lib/seo/book-data';

describe('SEARCH_BOOKS', () => {
  it('defines the canonical identifier and approved names for every source book', () => {
    expect(SEARCH_BOOKS.map(({ id, fullName, shortName }) => ({ id, fullName, shortName }))).toEqual([
      {
        id: 'clarke-MM',
        fullName: 'A DICTIONARY OF PRACTICAL\nMATERIA MEDICA\nBy John Henry CLARKE, M.D.',
        shortName: 'clarke materia medica',
      },
      {
        id: 'boericke-MM',
        fullName: 'HOMEOPATHIC MATERIA MEDICA\nby William BOERICKE, M.D.',
        shortName: 'boericke materia medica',
      },
      {
        id: 'kent-lectures',
        fullName: 'LECTURES ON HOMEOPATHIC MATERIA MEDICAL\nby JAMES TYLER KENT, A.M., M.D.',
        shortName: 'kent lectures',
      },
      {
        id: 'allen-nosodes',
        fullName: 'The Materia Medica of the Nosodes.\nBy Henry Clay ALLEN, M. D.',
        shortName: 'allen nosodes',
      },
    ]);
  });
});
