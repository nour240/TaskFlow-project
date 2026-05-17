
 //Polls /api/notifications every 30 seconds.
 //Updates the bell badge. Archives read items to LocalStorage.
let notifDropdownOpen = false;

function initNotifications() {
  const bell = document.getElementById('notif-bell');
  const dropdown = document.getElementById('notif-dropdown');
  if (!bell || !dropdown) return;

  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdownOpen = !notifDropdownOpen;
    dropdown.classList.toggle('active', notifDropdownOpen);
    if (notifDropdownOpen) fetchAndRenderNotifs();
  });

  document.addEventListener('click', () => {
    notifDropdownOpen = false;
    if (dropdown) dropdown.classList.remove('active');
  });
  dropdown.addEventListener('click', (e) => e.stopPropagation());

  // Initial fetch + polling
  fetchAndRenderNotifs();
  setInterval(fetchAndRenderNotifs, 30000);
}

async function fetchAndRenderNotifs() {
  try {
    const res = await API.getNotifications();
    const { notifications, unreadCount } = res.data;

    // Update badge
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // Render dropdown list
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (notifications.length === 0) {
      list.innerHTML = '<div class="empty-state" style="padding:24px"><p>No notifications</p></div>';
      return;
    }

    list.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n._id}" onclick="markNotifRead('${n._id}', this)">
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${timeAgo(n.createdAt)}</div>
      </div>
    `).join('');
  } catch (err) {
    // Silent fail for polling
  }
}

async function markNotifRead(id, el) {
  try {
    await API.markNotifRead(id);
    if (el) el.classList.remove('unread');
    // Archive to localStorage
    const archived = JSON.parse(localStorage.getItem('taskflow_archived_notifs') || '[]');
    if (!archived.includes(id)) {
      archived.push(id);
      localStorage.setItem('taskflow_archived_notifs', JSON.stringify(archived));
    }
    // Re-fetch to update count
    fetchAndRenderNotifs();
  } catch (err) {
    // ignore
  }
}
