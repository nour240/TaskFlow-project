/* Project Detail Module
 * Tasks CRUD, members, activities, auto-save drafts.*/
let currentProject = null;
let currentUser = null;
let isCreator = false;
let tasksPage = 1;

async function initProjectPage() {
  if (!requireAuth()) return;
  setupSidebar();
  initNotifications();
  currentUser = JSON.parse(localStorage.getItem('taskflow_user') || '{}');
  const projectId = getQueryParam('id');
  if (!projectId) { window.location.href = '/projects.html'; return; }
  await loadProject(projectId);
  setupTabs();
  setupTaskForm(projectId);
  setupMemberForm(projectId);
}

async function loadProject(id) {
  try {
    const res = await API.getProject(id);
    currentProject = res.data;
    isCreator = currentProject.creator._id === currentUser._id;
    renderProjectHeader();
    loadTasks();
    loadMembers();
    loadActivities();
  } catch (err) {
    showToast('Failed to load project', 'error');
  }
}

function renderProjectHeader() {
  const p = currentProject;
  document.getElementById('project-title').textContent = p.title;
  document.getElementById('project-desc').textContent = p.description || 'No description';
  document.getElementById('project-status-badge').className = `badge ${getStatusClass(p.status)}`;
  document.getElementById('project-status-badge').textContent = p.status;
  if (p.deadline) document.getElementById('project-deadline').textContent = `Due: ${formatDate(p.deadline)}`;

  const actions = document.getElementById('project-actions');
  if (isCreator && actions) {
    actions.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="editProject()">✏️ Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteCurrentProject()">🗑️ Delete</button>
    `;
  }
}

/* ── Tabs ─────────────────────────────────────────────── */
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).style.display = 'block';
    });
  });
}

/* ── Tasks ────────────────────────────────────────────── */
async function loadTasks() {
  const container = document.getElementById('tasks-list');
  if (!container) return;
  const statusFilter = document.getElementById('filter-status')?.value || '';
  const priorityFilter = document.getElementById('filter-priority')?.value || '';
  const searchVal = document.getElementById('filter-search')?.value || '';

  const params = { project: currentProject._id, page: tasksPage, limit: 20 };
  if (statusFilter) params.status = statusFilter;
  if (priorityFilter) params.priority = priorityFilter;
  if (searchVal) params.search = searchVal;

  try {
    const res = await API.getTasks(params);
    const { data, total, page, totalPages } = res.data;
    if (data.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><h3>No tasks</h3></div>';
    } else {
      container.innerHTML = data.map(t => `
        <div class="task-item" id="task-${t._id}">
          <span class="task-priority-dot ${t.priority}"></span>
          <span class="task-title">${t.title}</span>
          <span class="task-meta">
            ${t.assignedTo ? `<span>👤 ${t.assignedTo.fullName}</span>` : ''}
            <select class="form-control" style="width:auto;padding:4px 8px;font-size:.75rem" onchange="changeTaskStatus('${t._id}', this.value)">
              <option value="à faire" ${t.status==='à faire'?'selected':''}>à faire</option>
              <option value="en cours" ${t.status==='en cours'?'selected':''}>en cours</option>
              <option value="terminé" ${t.status==='terminé'?'selected':''}>terminé</option>
            </select>
            <span class="badge badge-${t.priority}">${t.priority}</span>
            ${t.deadline ? `<span>📅 ${formatDate(t.deadline)}</span>` : ''}
            ${isCreator ? `<button class="btn-icon btn-sm" onclick="deleteTask('${t._id}')" title="Delete">🗑️</button>` : ''}
          </span>
        </div>
      `).join('');
    }
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><h3>Error loading tasks</h3></div>';
  }
}

async function changeTaskStatus(taskId, status) {
  try {
    await API.updateTaskStatus(taskId, status);
    showToast('Status updated', 'success');
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to update status', 'error');
    loadTasks();
  }
}

async function deleteTask(taskId) {
  if (!confirm('Delete this task?')) return;
  try {
    await API.deleteTask(taskId);
    showToast('Task deleted', 'success');
    loadTasks();
    loadActivities();
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to delete', 'error');
  }
}

/* Task Form with Auto-Save Drafts (Feature 7) ─────── */
let _draftSaveTimer = null;

/**
 * getDraftKey – Returns a project-specific LocalStorage key.
 * Format: draft_task_project_<id>
 */
function getDraftKey(projectId) {
  return `draft_task_project_${projectId}`;
}

/**
 * serializeTaskForm – Reads all task form fields into a plain object.
 */
function serializeTaskForm() {
  return {
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-desc').value,
    priority: document.getElementById('task-priority').value,
    deadline: document.getElementById('task-deadline').value,
    assignedTo: document.getElementById('task-assignee').value,
  };
}

/**
 * saveDraftToStorage – Debounced writer (300 ms) to avoid thrashing
 * LocalStorage on every keystroke.
 */
function saveDraftToStorage(draftKey) {
  clearTimeout(_draftSaveTimer);
  _draftSaveTimer = setTimeout(() => {
    const data = serializeTaskForm();
    localStorage.setItem(draftKey, JSON.stringify(data));
    showDraftBadge(true);
  }, 300);
}

/*showDraftBadge – Toggle the "📝 Draft saved" indicator with animation.
 */
function showDraftBadge(visible) {
  const badge = document.getElementById('draft-badge');
  if (!badge) return;
  if (visible) {
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

/**
 * populateFormFromDraft – Fills the form fields with saved draft data.
 */
function populateFormFromDraft(draft) {
  if (!draft) return;
  document.getElementById('task-title').value = draft.title || '';
  document.getElementById('task-desc').value = draft.description || '';
  document.getElementById('task-priority').value = draft.priority || 'moyenne';
  document.getElementById('task-deadline').value = draft.deadline || '';
  // Assignee might not exist in the dropdown yet (members load async),
  // so we defer it and store the value for later.
  const assigneeSelect = document.getElementById('task-assignee');
  if (assigneeSelect) {
    // Try setting now; will also be retried after members load.
    assigneeSelect.value = draft.assignedTo || '';
    assigneeSelect.dataset.pendingDraftValue = draft.assignedTo || '';
  }
}

/**
 * showDraftRestoreModal – Presents a styled modal asking the user
 * whether to restore the saved draft or discard it.
 * Returns a Promise<boolean>.
 */
function showDraftRestoreModal() {
  return new Promise((resolve) => {
    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'draft-restore-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-labelledby="draft-modal-title">
        <div class="modal-header">
          <h3 id="draft-modal-title">📝 Unsaved Draft Found</h3>
          <button class="modal-close" id="draft-modal-close" aria-label="Close">&times;</button>
        </div>
        <p style="color:var(--text-secondary);font-size:.9rem;line-height:1.6;margin-bottom:8px">
          You have an unsaved draft for this project's task form.
          Would you like to <strong>restore</strong> it and continue where you left off,
          or <strong>discard</strong> it and start fresh?
        </p>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" id="draft-discard-btn">Discard Draft</button>
          <button class="btn btn-primary btn-sm" id="draft-restore-btn">Restore Draft</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('active'));

    function cleanup(result) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 250);
      resolve(result);
    }

    document.getElementById('draft-restore-btn').addEventListener('click', () => cleanup(true));
    document.getElementById('draft-discard-btn').addEventListener('click', () => cleanup(false));
    document.getElementById('draft-modal-close').addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}

/**
 * setupTaskForm – Main entry point for the task creation form.
 * Handles draft restoration, auto-save on input, and cleanup on submit.
 */
async function setupTaskForm(projectId) {
  const form = document.getElementById('task-form');
  if (!form) return;
  if (!isCreator) {
    document.getElementById('task-form-card').style.display = 'none';
    return;
  }

  const draftKey = getDraftKey(projectId);

  // ── 1. Draft Restoration ────────────────────────────────
  const savedDraft = JSON.parse(localStorage.getItem(draftKey) || 'null');
  if (savedDraft) {
    const shouldRestore = await showDraftRestoreModal();
    if (shouldRestore) {
      populateFormFromDraft(savedDraft);
      showDraftBadge(true);
      showToast('Draft restored successfully', 'info');
    } else {
      localStorage.removeItem(draftKey);
      showDraftBadge(false);
    }
  }

  // ── 2. Auto-Save on Input / Change ──────────────────────
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', () => saveDraftToStorage(draftKey));
    el.addEventListener('change', () => saveDraftToStorage(draftKey));
  });

  // ── 3. Submission & Cleanup ─────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await API.createTask({
        title: document.getElementById('task-title').value.trim(),
        description: document.getElementById('task-desc').value.trim(),
        priority: document.getElementById('task-priority').value,
        deadline: document.getElementById('task-deadline').value || null,
        assignedTo: document.getElementById('task-assignee').value || null,
        project: projectId,
      });
      showToast('Task created!', 'success');
      form.reset();
      // Cleanup: remove draft from LocalStorage after successful submission
      localStorage.removeItem(draftKey);
      showDraftBadge(false);
      loadTasks();
      loadActivities();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create task', 'error');
    }
    btn.disabled = false;
  });

  // ── 4. Populate assignee dropdown ───────────────────────
  await loadAssigneeOptions(projectId);

  // After members are loaded, re-apply pending draft assignee value
  const assigneeSelect = document.getElementById('task-assignee');
  if (assigneeSelect?.dataset.pendingDraftValue) {
    assigneeSelect.value = assigneeSelect.dataset.pendingDraftValue;
    delete assigneeSelect.dataset.pendingDraftValue;
  }
}

async function loadAssigneeOptions(projectId) {
  try {
    const res = await API.getMembers(projectId);
    const sel = document.getElementById('task-assignee');
    if (!sel) return;
    sel.innerHTML = '<option value="">Unassigned</option>';
    // Add creator
    sel.innerHTML += `<option value="${res.data.creator._id}">${res.data.creator.fullName}</option>`;
    (res.data.members || []).forEach(m => {
      sel.innerHTML += `<option value="${m._id}">${m.fullName}</option>`;
    });
  } catch (err) { /* ignore */ }
}

/* ── Members ──────────────────────────────────────────── */
async function loadMembers() {
  const container = document.getElementById('members-list');
  if (!container) return;
  try {
    const res = await API.getMembers(currentProject._id);
    const { creator, members } = res.data;
    let html = `
      <div class="member-item">
        <div class="avatar">${getInitials(creator.fullName)}</div>
        <div class="member-info">
          <div class="member-name">${creator.fullName} <span class="badge badge-actif" style="margin-left:6px">Creator</span></div>
          <div class="member-email">${creator.email}</div>
        </div>
      </div>
    `;
    members.forEach(m => {
      html += `
        <div class="member-item">
          <div class="avatar">${getInitials(m.fullName)}</div>
          <div class="member-info">
            <div class="member-name">${m.fullName}</div>
            <div class="member-email">${m.email}</div>
          </div>
          ${isCreator ? `<button class="btn-icon btn-sm" onclick="removeMember('${m._id}')" title="Remove">✕</button>` : ''}
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) { /* ignore */ }
}

function setupMemberForm(projectId) {
  const form = document.getElementById('member-form');
  if (!form) return;
  if (!isCreator) { form.style.display = 'none'; return; }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('member-email').value.trim();
    try {
      await API.addMember(projectId, email);
      showToast('Member added!', 'success');
      document.getElementById('member-email').value = '';
      loadMembers();
      loadAssigneeOptions(projectId);
      loadActivities();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add member', 'error');
    }
  });
}

async function removeMember(memberId) {
  if (!confirm('Remove this member?')) return;
  try {
    await API.removeMember(currentProject._id, memberId);
    showToast('Member removed', 'success');
    loadMembers();
    loadAssigneeOptions(currentProject._id);
    loadActivities();
  } catch (err) {
    showToast(err.response?.data?.message || 'Failed to remove', 'error');
  }
}

/* ── Activities ───────────────────────────────────────── */
async function loadActivities() {
  const container = document.getElementById('activity-feed');
  if (!container) return;
  try {
    const res = await API.getActivities(currentProject._id, { limit: 30 });
    if (res.data.data.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No activity yet</p></div>';
    } else {
      container.innerHTML = res.data.data.map(a => `
        <div class="activity-item">
          <div class="activity-dot"></div>
          <div>
            <div class="activity-text"><strong>${a.user?.fullName || 'System'}:</strong> ${a.action}</div>
            <div class="activity-time">${timeAgo(a.createdAt)}</div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) { /* ignore */ }
}

/* ── Edit/Delete project ──────────────────────────────── */
async function editProject() {
  const title = prompt('Project title:', currentProject.title);
  if (title === null) return;
  const desc = prompt('Description:', currentProject.description);
  try {
    await API.updateProject(currentProject._id, { title, description: desc });
    showToast('Project updated', 'success');
    loadProject(currentProject._id);
  } catch (err) {
    showToast(err.response?.data?.message || 'Update failed', 'error');
  }
}

async function deleteCurrentProject() {
  if (!confirm('Delete this project and ALL its tasks?')) return;
  try {
    await API.deleteProject(currentProject._id);
    showToast('Project deleted', 'success');
    window.location.href = '/projects.html';
  } catch (err) {
    showToast(err.response?.data?.message || 'Delete failed', 'error');
  }
}

// Filters
function applyFilters() { tasksPage = 1; loadTasks(); }

document.addEventListener('DOMContentLoaded', initProjectPage);