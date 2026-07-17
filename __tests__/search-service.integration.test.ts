import { describe, it, expect, beforeAll } from 'vitest';
import sqlite3 from 'sqlite3';
import path from 'path';
import { createRepertorySearchService } from '@/lib/server/repertory/search-service';

describe('Search Service with Web DB', () => {
  let service: ReturnType<typeof createRepertorySearchService>;

  beforeAll(async () => {
    const dbPath = path.join(__dirname, '../server-data/demo-remedies.db');
    const db: sqlite3.Database = await new Promise((resolve, reject) => {
      const database = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) reject(err);
        else resolve(database);
      });
    });
      
    const executor = {
      async all<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows: T[]) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
      async get<T>(sql: string, params: any[] = []): Promise<T | null> {
        return new Promise((resolve, reject) => {
          db.get(sql, params, (err, row: T) => {
            if (err) reject(err);
            else resolve(row || null);
          });
        });
      }
    };
    
    service = createRepertorySearchService(executor);
  });

  it('should find remedies without throwing no such column error', async () => {
    const symptoms = await service.listSymptoms('boericke-MM', undefined, 2);
    if (symptoms.length > 0) {
      const results = await service.findRemedies('boericke-MM', [symptoms[0]]);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(results[0].slug).toBeDefined();
      }
    }
  });

});
