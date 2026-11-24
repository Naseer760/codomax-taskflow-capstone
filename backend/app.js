const express = require('express');

function createApp(db) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', async (_req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ status: 'ok', database: 'connected' });
    } catch (_error) {
      res.status(503).json({ status: 'error', database: 'unavailable' });
    }
  });

  app.get('/api/tasks', async (_req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT id, title, completed, created_at FROM tasks ORDER BY id DESC'
      );
      res.json(rows);
    } catch (_error) {
      res.status(500).json({ error: 'Could not retrieve tasks' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title || title.length > 120) {
      return res.status(400).json({ error: 'Title must contain 1–120 characters' });
    }
    try {
      const [result] = await db.query('INSERT INTO tasks (title) VALUES (?)', [title]);
      const [rows] = await db.query(
        'SELECT id, title, completed, created_at FROM tasks WHERE id = ?',
        [result.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (_error) {
      res.status(500).json({ error: 'Could not create task' });
    }
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1 || typeof req.body.completed !== 'boolean') {
      return res.status(400).json({ error: 'A valid task ID and boolean completed value are required' });
    }
    try {
      const [result] = await db.query(
        'UPDATE tasks SET completed = ? WHERE id = ?',
        [req.body.completed, id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Task not found' });
      const [rows] = await db.query(
        'SELECT id, title, completed, created_at FROM tasks WHERE id = ?',
        [id]
      );
      res.json(rows[0]);
    } catch (_error) {
      res.status(500).json({ error: 'Could not update task' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    try {
      const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
      if (!result.affectedRows) return res.status(404).json({ error: 'Task not found' });
      res.status(204).end();
    } catch (_error) {
      res.status(500).json({ error: 'Could not delete task' });
    }
  });

  return app;
}

module.exports = { createApp };
