import { describe, it, expect, beforeAll } from 'vitest';
import sqlite3 from 'sqlite3';
import path from 'path';

describe('Web remedies DB', () => {
  let db: sqlite3.Database;

  beforeAll(async () => {
    const dbPath = path.join(__dirname, '../server-data/demo-remedies.db');
    db = await new Promise((resolve, reject) => {
      const database = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) reject(err);
        else resolve(database);
      });
    });
  });

  it('should have a slug column in remedies table', () => {
    return new Promise<void>((resolve, reject) => {
      db.all("PRAGMA table_info(remedies)", (err, tableInfo: any[]) => {
        if (err) return reject(err);
        const hasSlug = tableInfo.some(col => col.name === 'slug');
        expect(hasSlug).toBe(true);
        
        db.all("PRAGMA index_list(remedies)", (err, indexInfo: any[]) => {
          if (err) return reject(err);
          const hasSlugIndex = indexInfo.some(idx => idx.name === 'idx_remedies_slug');
          expect(hasSlugIndex).toBe(true);
          resolve();
        });
      });
    });
  });
});
