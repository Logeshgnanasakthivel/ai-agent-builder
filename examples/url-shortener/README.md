# url-shortener (example)

A small, working URL shortener — proof that this plugin's agent prompts produce real, running
software, not just plans. Built by manually walking through the swarm's agent roles in order
(`database-architect` -> `api-architect` -> `integration-guardian` -> `ui-designer`), then verified
like `error-watcher`/`qa-tester` would: API smoke-tested with `curl`, UI exercised in a real browser,
short link confirmed to actually redirect.

## What it does

Paste a long URL, get back a short code/link. Visiting the short link 302-redirects to the original.

## Design notes (from each agent's role)

- **`database-architect`**: one table, `links(id, short_code UNIQUE, original_url, created_at)`.
  The unique index on `short_code` covers the only hot query — lookup-by-code on redirect.
- **`api-architect`**: `POST /api/links {url}` validates the URL is absolute http(s) (rejects
  `javascript:`/`data:` schemes), generates a random base62 code, retries on collision.
  `GET /:code` redirects or falls through to 404. No auth/rate-limiting — out of scope for a
  public single-user demo at this stage; would be added by `api-architect` if the requirements
  called for real-world scale.
- **`integration-guardian`**: `public/app.js`'s `shortenUrl()` is the only place that knows the
  wire format — if the backend contract changes, that function is what absorbs it.
- **`ui-designer`**: one screen, matches system light/dark mode, accessible form with an inline
  error state and a copy-to-clipboard affordance on the result.

## Run it

```bash
npm install
npm start
```

Then open `http://localhost:4790`.

## Known simplifications (intentionally out of scope for a demo)

- No rate limiting or auth — fine for a local demo, not for a public deployment.
- Submitting the same URL twice creates two different short codes rather than reusing one.
- SQLite file storage, not a production-grade datastore.
