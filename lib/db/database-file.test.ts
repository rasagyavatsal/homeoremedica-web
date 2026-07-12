import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { createDatabaseFileProvider } from './database-file';

describe('database file provider', () => {
  it('uses an existing configured local database without downloading', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'remedies-'));
    const databasePath = path.join(directory, 'remedies.db');
    await writeFile(databasePath, 'sqlite');
    const download = vi.fn();

    const provider = createDatabaseFileProvider({ databasePath, download });

    await expect(provider.getPath()).resolves.toBe(databasePath);
    expect(download).not.toHaveBeenCalled();
  });

  it('downloads a missing database once and activates it atomically', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'remedies-'));
    const databasePath = path.join(directory, 'remedies.db');
    const download = vi.fn(async (destination: string) => writeFile(destination, 'sqlite'));
    const provider = createDatabaseFileProvider({ databasePath, download });

    const [first, second] = await Promise.all([provider.getPath(), provider.getPath()]);

    expect(first).toBe(databasePath);
    expect(second).toBe(databasePath);
    expect(download).toHaveBeenCalledOnce();
    await expect(readFile(databasePath, 'utf8')).resolves.toBe('sqlite');
  });
});
