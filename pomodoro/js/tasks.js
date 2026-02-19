// ============================================================
// tasks.js — Task list with add, check off, delete, and localStorage persistence
// ============================================================

let tasks = JSON.parse(localStorage.getItem('pomo_tasks') || '[]');

// Re-renders the entire task list and saves to localStorage
function renderTasks() {
  const el = document.getElementById('task-list');
  el.innerHTML = tasks.map((t, i) =>
    `<div class="task-item ${t.done ? 'done' : ''}">
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${i})">
      <span>${t.text}</span>
      <button class="del" onclick="deleteTask(${i})">✕</button>
    </div>`
  ).join('');
  localStorage.setItem('pomo_tasks', JSON.stringify(tasks));
}

// Reads the input field, creates a new task, and re-renders
function addTask() {
  const input = document.getElementById('task');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ text, done: false });
  input.value = '';
  renderTasks();
}

// Toggles a task's done state (checked = crossed out)
function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  renderTasks();
}

// Removes a task from the list entirely
function deleteTask(i) {
  tasks.splice(i, 1);
  renderTasks();
}
