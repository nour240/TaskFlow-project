let projectsPage = 1;

async function initProjects() {
  if (!requireAuth()) return;
  setupSidebar();
  initNotifications();
  loadProjects();

  document.getElementById('create-project-btn')?.addEventListener('click', openProjectModal);
  document.getElementById('project-modal-close')?.addEventListener('click', closeProjectModal);
  document.getElementById('project-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProjectModal();
  });

  document.getElementById('project-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      await API.createProject({
        title: document.getElementById('proj-title').value.trim(),
        description: document.getElementById('proj-desc').value.trim(),
        deadline: document.getElementById('proj-deadline').value || null,
        status: document.getElementById('proj-status').value,
      });
      showToast('Project created!', 'success');
      closeProjectModal();
      loadProjects();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create project', 'error');
    }
    btn.disabled = false;
  });
}

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const res = await API.getProjects({ page: projectsPage, limit: 12 });
    const { data, total, page, totalPages } = res.data;

    if (data.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📁</div><h3>No projects yet</h3><p>Create your first project to get started.</p></div>';
    } else {
      grid.innerHTML = data.map(p => `
        <div class="project-card" onclick="window.location.href='/project.html?id=${p._id}'">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
            <span class="badge ${getStatusClass(p.status)}">${p.status}</span>
            ${p.deadline ? `<span style="font-size:.72rem;color:var(--text-muted)">📅 ${formatDate(p.deadline)}</span>` : ''}
          </div>
          <div class="project-title">${p.title}</div>
          <div class="project-desc">${p.description || 'No description'}</div>
          <div class="project-footer">
            <div class="members-avatars">
              <div class="mini-avatar">${getInitials(p.creator?.fullName)}</div>
              ${(p.members || []).slice(0, 3).map(m => `<div class="mini-avatar">${getInitials(m.fullName)}</div>`).join('')}
              ${(p.members || []).length > 3 ? `<div class="mini-avatar">+${p.members.length - 3}</div>` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }

    renderPagination(page, totalPages);
  } catch (err) {
    grid.innerHTML = '<div class="empty-state"><h3>Error loading projects</h3></div>';
  }
}