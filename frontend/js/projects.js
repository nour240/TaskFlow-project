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