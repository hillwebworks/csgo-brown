Shared submission log backed by a JSON file in this GitHub repo (no SQL database).

## API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/submissions` | List all submissions |
| `POST` | `/api/submissions` | Append `{ username, password }` |
| `DELETE` | `/api/submissions` | Clear the log |

Data is stored in `data/submissions.json` and updated via the GitHub Contents API.

## Vercel setup

Add a GitHub token to the Vercel project:

1. Create a fine-grained PAT with **Contents: Read and write** on `csgo-brown`
2. Vercel → Project **csgo** → Settings → Environment Variables
3. Add `GITHUB_TOKEN` for Production, Preview, and Development
4. Redeploy

Or from CLI:

```bash
gh auth token | vercel env add GITHUB_TOKEN production
vercel env add GITHUB_TOKEN preview
vercel env add GITHUB_TOKEN development
vercel deploy --prod
```

## Local dev

```bash
export GITHUB_TOKEN=$(gh auth token)
vercel dev
```

Static-only fallback (localStorage, no shared log):

```bash
python3 server.py
```
