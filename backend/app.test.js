const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('./app');
const http = require('node:http');

function fakeDb() {
  let nextId = 1;
  const tasks = [];
  return {
    async query(sql, params = []) {
      if (sql === 'SELECT 1') return [[{ 1: 1 }]];
      if (sql.startsWith('SELECT id, title')) {
        if (sql.includes('WHERE id = ?')) return [tasks.filter(t => t.id === Number(params[0]))];
        return [[...tasks]];
      }
      if (sql.startsWith('INSERT')) {
        const task = { id: nextId++, title: params[0], completed: 0, created_at: new Date().toISOString() };
        tasks.push(task);
        return [{ insertId: task.id }];
      }
      if (sql.startsWith('UPDATE')) {
        const task = tasks.find(t => t.id === Number(params[1]));
        if (!task) return [{ affectedRows: 0 }];
        task.completed = params[0] ? 1 : 0;
        return [{ affectedRows: 1 }];
      }
      if (sql.startsWith('DELETE')) {
        const index = tasks.findIndex(t => t.id === Number(params[0]));
        if (index < 0) return [{ affectedRows: 0 }];
        tasks.splice(index, 1);
        return [{ affectedRows: 1 }];
      }
      throw new Error('Unexpected SQL in test: ' + sql);
    }
  };
}

async function withServer(run) {
  const server = createApp(fakeDb()).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const address = server.address();
  try { await run(`http://127.0.0.1:${address.port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('health endpoint reports database connected', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).database, 'connected');
  });
});

test('creates and lists a task', async () => {
  await withServer(async base => {
    const created = await fetch(`${base}/api/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Prepare capstone report' })
    });
    assert.equal(created.status, 201);
    const task = await created.json();
    assert.equal(task.title, 'Prepare capstone report');

    const listed = await fetch(`${base}/api/tasks`);
    const rows = await listed.json();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, task.id);
  });
});

test('rejects an empty task title', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/api/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: '   ' })
    });
    assert.equal(response.status, 400);
  });
});
