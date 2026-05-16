async function initDashboard() {
  if (!requireAuth()) return;
  setupSidebar();
  initNotifications();

  try {
    const res = await API.getDashboard();
    const d = res.data;

    document.getElementById('stat-projects').textContent = d.activeProjects;
    document.getElementById('stat-assigned').textContent = d.assignedTasks;
    document.getElementById('stat-completed').textContent = d.completedTasks;
    document.getElementById('stat-overdue').textContent = d.overdueTasks;

    // Ongoing tasks
    const taskList = document.getElementById('ongoing-tasks');
    if (d.ongoingTasks.length === 0) {
      taskList.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><h3>All caught up!</h3><p>No pending tasks</p></div>';
    } else {
      taskList.innerHTML = d.ongoingTasks.map(t => `
        <div class="task-item" onclick="window.location.href='/project.html?id=${t.projectInfo?._id || t.project}'">
          <span class="task-priority-dot ${t.priority}"></span>
          <span class="task-title">${t.title}</span>
          <span class="task-meta">
            <span class="badge ${getStatusClass(t.status)}">${t.status}</span>
            ${t.deadline ? `<span>📅 ${formatDate(t.deadline)}</span>` : ''}
          </span>
        </div>
      `).join('');
    }

    // Remove spinner
    document.getElementById('dashboard-spinner')?.remove();
  } catch (err) {
    showToast('Failed to load dashboard', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);