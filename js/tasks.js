// ============================================================
// tasks.js — Task list with add, check off, delete, and localStorage persistence
// ============================================================

let tasks = JSON.parse(localStorage.getItem('pomo_tasks') || '[]');

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
  ));
}

let dragFromIndex = null;

// Re-renders the entire task list and saves to localStorage
function renderTasks() {
  const el = document.getElementById('task-list');
  el.innerHTML = tasks.map((t, i) =>
    `<div class="task-item ${t.done ? 'done' : ''}" draggable="true"
          data-index="${i}"
          ondragstart="onDragStart(event)" ondragover="onDragOver(event)"
          ondrop="onDrop(event)" ondragend="onDragEnd(event)"
          ontouchstart="onTouchStart(event, ${i})" ontouchmove="onTouchMove(event)"
          ontouchend="onTouchEnd(event)">
      <span class="drag-handle">⠿</span>
      <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${i})">
      <span>${escapeHtml(t.text)}</span>
      <button class="del" onclick="deleteTask(${i})">✕</button>
    </div>`
  ).join('');
  localStorage.setItem('pomo_tasks', JSON.stringify(tasks));
}

// Drag-and-drop reordering
function onDragStart(e) {
  dragFromIndex = +e.currentTarget.dataset.index;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e) {
  e.preventDefault();
  const target = e.currentTarget;
  target.classList.add('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  const toIndex = +e.currentTarget.dataset.index;
  e.currentTarget.classList.remove('drag-over');
  if (dragFromIndex !== null && dragFromIndex !== toIndex) {
    const [moved] = tasks.splice(dragFromIndex, 1);
    tasks.splice(toIndex, 0, moved);
    renderTasks();
  }
}

function onDragEnd(e) {
  dragFromIndex = null;
  document.querySelectorAll('.task-item').forEach(el => {
    el.classList.remove('dragging', 'drag-over');
  });
}

// Touch-based reordering for mobile
let touchStartY = null;
let touchIndex = null;

function onTouchStart(e, index) {
  const handle = e.target.closest('.drag-handle');
  if (!handle) return;
  touchIndex = index;
  touchStartY = e.touches[0].clientY;
  e.currentTarget.classList.add('dragging');
}

function onTouchMove(e) {
  if (touchIndex === null) return;
  e.preventDefault();
}

function onTouchEnd(e) {
  if (touchIndex === null) return;
  const endY = e.changedTouches[0].clientY;
  const items = document.querySelectorAll('.task-item');
  let targetIndex = touchIndex;

  items.forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    if (endY >= rect.top && endY <= rect.bottom) targetIndex = i;
  });

  if (targetIndex !== touchIndex) {
    const [moved] = tasks.splice(touchIndex, 1);
    tasks.splice(targetIndex, 0, moved);
  }

  touchIndex = null;
  touchStartY = null;
  renderTasks();
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
