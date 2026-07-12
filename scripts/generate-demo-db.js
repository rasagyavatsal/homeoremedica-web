const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const input = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'demo-remedies.json'), 'utf8'));
const outputDirectory = path.join(__dirname, '..', 'server-data');
const output = path.join(outputDirectory, 'demo-remedies.db');

fs.mkdirSync(outputDirectory, { recursive: true });
fs.rmSync(output, { force: true });

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const db = new sqlite3.Database(output);

db.serialize(() => {
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE remedies (id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL, book TEXT NOT NULL, UNIQUE(name, book));
    CREATE TABLE symptoms (id INTEGER PRIMARY KEY, text TEXT NOT NULL, book TEXT NOT NULL, UNIQUE(text, book));
    CREATE TABLE remedy_symptoms (remedy_id INTEGER NOT NULL, symptom_id INTEGER NOT NULL, PRIMARY KEY (remedy_id, symptom_id));
    CREATE INDEX idx_remedies_book ON remedies(book);
    CREATE INDEX idx_remedies_slug ON remedies(slug);
    CREATE INDEX idx_symptoms_book ON symptoms(book);
    CREATE INDEX idx_symptoms_text ON symptoms(text);
    CREATE INDEX idx_remedy_symptoms_remedy ON remedy_symptoms(remedy_id);
    CREATE INDEX idx_remedy_symptoms_symptom ON remedy_symptoms(symptom_id);
  `);

  for (const [book, remedies] of Object.entries(input)) {
    for (const [name, symptoms] of Object.entries(remedies)) {
      db.run('INSERT INTO remedies (name, slug, book) VALUES (?, ?, ?)', name, slugify(name), book);
      for (const symptom of symptoms) {
        db.run('INSERT OR IGNORE INTO symptoms (text, book) VALUES (?, ?)', symptom, book);
        db.run(`INSERT INTO remedy_symptoms (remedy_id, symptom_id)
          SELECT r.id, s.id FROM remedies r, symptoms s
          WHERE r.name = ? AND r.book = ? AND s.text = ? AND s.book = ?`, name, book, symptom, book);
      }
    }
  }
});

db.close((error) => {
  if (error) throw error;
  console.log(`Generated demo database at ${output}`);
});
