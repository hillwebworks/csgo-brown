Shared submission log stored in **Vercel Blob** (not in this Git repo).

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/submissions` | List all submissions |
| `POST` | `/api/submissions` | Append `{ username, password }` |
| `DELETE` | `/api/submissions` | Clear the log |

## Vercel setup

1. Vercel → Project → **Storage** → create a **Blob** store and link it to the project (sets `BLOB_READ_WRITE_TOKEN` automatically).
2. Remove legacy `GITHUB_TOKEN` from environment variables if it was only used for `data/submissions.json`.
3. Redeploy: `vercel deploy --prod`

## Local dev

```bash
vercel dev
```

Static-only fallback (localStorage, no shared log):

```bash
python3 server.py
```
