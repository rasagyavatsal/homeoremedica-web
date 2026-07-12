import { describe, expect, it } from 'vitest';

import { metadata as rootMetadata } from '../layout';
import { metadata as homeMetadata } from '../page';

const ROOT_DESCRIPTION =
  'Search plain symptom keywords to find homeopathic remedy matches from classical materia medica sources, including Boericke, Clarke, Kent, and Allen. Choose one source book, select exact symptom entries, and compare ranked remedy matches in the same workflow, with saved cases available for organized study, repertory research, and follow-up reference.';

const HOME_DESCRIPTION =
  ROOT_DESCRIPTION;

describe('metadata positioning copy', () => {
  it('uses remedy-finder copy in root metadata', () => {
    const title = rootMetadata.title;
    if (!title || typeof title !== 'object' || !('default' in title)) {
      throw new Error('Expected root metadata title to be an object with default value');
    }

    expect(title.default).toBe('HomeoRemedica - Homeopathic Remedy Finder');
    expect(rootMetadata.description).toBe(ROOT_DESCRIPTION);
    expect(rootMetadata.openGraph?.title).toBe('HomeoRemedica - Homeopathic Remedy Finder');
    expect(rootMetadata.openGraph?.description).toBe(ROOT_DESCRIPTION);
    expect(rootMetadata.twitter?.title).toBe('HomeoRemedica - Homeopathic Remedy Finder');
    expect(rootMetadata.twitter?.description).toBe(ROOT_DESCRIPTION);
  });

  it('uses remedy-finder copy in home page metadata', () => {
    expect(homeMetadata.title).toBe('Homeopathic Remedy Finder - HomeoRemedica');
    expect(homeMetadata.description).toBe(HOME_DESCRIPTION);
    expect(homeMetadata.openGraph?.title).toBe('Homeopathic Remedy Finder - HomeoRemedica');
    expect(homeMetadata.openGraph?.description).toBe(HOME_DESCRIPTION);
  });
});
