import sqlite3 from 'sqlite3';
import { getDatabaseFilePath } from './database-file';

let db: sqlite3.Database | null = null;

export async function getDb(): Promise<sqlite3.Database> {
  if (db) return db;
  const dbPath = await getDatabaseFilePath();

  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    const database = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error(`Failed to open database at ${dbPath}:`, err);
        return reject(err);
      }
      resolve(database);
    });
    db = database;
  });
}

/**
 * Utility to run a query and return all results as a Promise
 */
export function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return getDb().then(database => {
    return new Promise((resolve, reject) => {
      database.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database query error (all):', err);
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  });
}

/**
 * Utility to run a query and return a single result as a Promise
 */
export function dbGet<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return getDb().then(database => {
    return new Promise((resolve, reject) => {
      database.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database query error (get):', err);
          reject(err);
        } else {
          resolve(row as T | undefined);
        }
      });
    });
  });
}
