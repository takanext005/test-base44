import express from 'express';
import { pool, initSchema } from './db.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'ok' });
  } catch {
    res.status(503).json({ ok: false, db: 'unavailable' });
  }
});

app.get('/api/notes', async (_req, res) => {
  const { rows } = await pool.query('SELECT id, title, created_at FROM notes ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/notes', async (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const { rows } = await pool.query(
    'INSERT INTO notes (title) VALUES ($1) RETURNING id, title, created_at',
    [title]
  );
  res.status(201).json(rows[0]);
});

app.delete('/api/notes/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'invalid id' });
  }
  const { rowCount } = await pool.query('DELETE FROM notes WHERE id = $1', [id]);
  if (rowCount === 0) {
    return res.status(404).json({ error: 'not found' });
  }
  res.status(204).end();
});

// Wait for Postgres, then create the table before accepting traffic.
async function start() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await initSchema();
      break;
    } catch (error) {
      if (attempt === 30) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  app.listen(port, '0.0.0.0', () => {
    console.log(`API listening on ${port}`);
  });
}

start().catch((error) => {
  console.error('API failed to start', error);
  process.exit(1);
});
