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