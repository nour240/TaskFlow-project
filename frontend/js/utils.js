//Show a toast notification 
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
}

//Format a date string 
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

//Relative time 
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

//Get initials from a full name 
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

//Get status badge class 
function getStatusClass(status) {
  const map = {
    'à faire': 'badge-afaire',
    'en cours': 'badge-encours',
    'terminé': 'badge-termine',
    'actif': 'badge-actif',
    'en pause': 'badge-pause',
    'archivé': 'badge-archive',
  };
  return map[status] || '';
}

//Parse URL query params
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

//Redirect if not authenticated 
function requireAuth() {
  const token = localStorage.getItem('taskflow_token');
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

//Redirect if already authenticated 
function redirectIfAuth() {
  const token = localStorage.getItem('taskflow_token');
  if (token) {
    window.location.href = '/dashboard.html';
    return true;
  }
  return false;
}
