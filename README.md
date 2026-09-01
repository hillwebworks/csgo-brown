# CSC GO — Brown University (demo)

Static demo site with a shared submission log backed by **Vercel Blob** (no SQL database).

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/submissions` | List all submissions |
| `POST` | `/api/submissions` | Append `{ username, password }` |
| `DELETE` | `/api/submissions` | Clear the log |

## Vercel setup

1. Deploy the project on Vercel
2. In the Vercel dashboard: **Storage → Create Blob store → Connect to project**
3. Redeploy — Vercel injects `BLOB_READ_WRITE_TOKEN` automatically

## Local dev

```bash
npm install
vercel dev
```

Or static only (API falls back to browser localStorage):

```bash
python3 server.py
```
