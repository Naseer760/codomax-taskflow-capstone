const list = document.querySelector('#tasks');
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-title');
const message = document.querySelector('#message');
const count = document.querySelector('#count');
const health = document.querySelector('#health');

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

function render(tasks) {
  list.replaceChildren();
  count.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;
  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = `task ${task.completed ? 'done' : ''}`;
    const title = document.createElement('span');
    title.textContent = task.title;
    const toggle = document.createElement('button');
    toggle.textContent = task.completed ? 'Undo' : 'Complete';
    toggle.addEventListener('click', async () => {
      try {
        await api(`/tasks/${task.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ completed: !Boolean(task.completed) })
        });
        await loadTasks();
      } catch (error) { message.textContent = error.message; }
    });
    const remove = document.createElement('button');
    remove.className = 'delete';
    remove.textContent = 'Delete';
    remove.addEventListener('click', async () => {
      try {
        await api(`/tasks/${task.id}`, { method: 'DELETE' });
        await loadTasks();
      } catch (error) { message.textContent = error.message; }
    });
    item.append(title, toggle, remove);
    list.append(item);
  }
}

async function loadTasks() {
  const tasks = await api('/tasks');
  render(tasks);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  message.textContent = '';
  try {
    await api('/tasks', { method: 'POST', body: JSON.stringify({ title: input.value }) });
    input.value = '';
    await loadTasks();
  } catch (error) { message.textContent = error.message; }
});

(async () => {
  try {
    const result = await api('/health');
    health.textContent = `API ${result.status} · database ${result.database}`;
    health.classList.add('ok');
    await loadTasks();
  } catch (error) {
    health.textContent = 'API unavailable';
    message.textContent = error.message;
  }
})();
