const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 4790;
const db = new Database(path.join(__dirname, 'links.db'));

// database-architect: single table, unique index on short_code covers the
// only hot query path (lookup-by-code on redirect).
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code TEXT UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertLink = db.prepare(
  'INSERT INTO links (short_code, original_url) VALUES (?, ?)'
);
const findByCode = db.prepare(
  'SELECT original_url FROM links WHERE short_code = ?'
);

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode(length = 7) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// api-architect: thin handler, validate at the boundary, retry on the one
// real race condition (short_code collision) instead of trusting a single try.
app.post('/api/links', (req, res) => {
  const { url } = req.body || {};

  if (typeof url !== 'string' || !isValidUrl(url)) {
    return res.status(400).json({ error: 'A valid http(s) URL is required.' });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const shortCode = generateCode();
    try {
      insertLink.run(shortCode, url);
      return res.status(201).json({
        shortCode,
        shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
      });
    } catch (err) {
      if (!String(err.message).includes('UNIQUE constraint failed')) {
        console.error(err);
        return res.status(500).json({ error: 'Internal error.' });
      }
      // collision on short_code - loop retries with a fresh code
    }
  }

  return res.status(500).json({ error: 'Could not generate a unique short code, try again.' });
});

app.get('/:code', (req, res, next) => {
  const row = findByCode.get(req.params.code);
  if (!row) return next();
  res.redirect(302, row.original_url);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
  console.log(`url-shortener-demo listening on http://localhost:${PORT}`);
});
