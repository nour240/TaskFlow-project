 //Handles login/signup forms, session restore, logout

function initAuth() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (loginForm) {
    redirectIfAuth();
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in...';
      try {
        const res = await API.login({
          email: document.getElementById('login-email').value.trim(),
          password: document.getElementById('login-password').value,
        });
        localStorage.setItem('taskflow_token', res.data.token);
        localStorage.setItem('taskflow_user', JSON.stringify({
          _id: res.data._id, fullName: res.data.fullName, email: res.data.email,
        }));
        window.location.href = '/dashboard.html';
      } catch (err) {
        showToast(err.response?.data?.message || 'Login failed', 'error');
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }

  if (signupForm) {
    redirectIfAuth();
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = signupForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Creating account...';
      try {
        const res = await API.signup({
          fullName: document.getElementById('signup-name').value.trim(),
          email: document.getElementById('signup-email').value.trim(),
          password: document.getElementById('signup-password').value,
        });
        localStorage.setItem('taskflow_token', res.data.token);
        localStorage.setItem('taskflow_user', JSON.stringify({
          _id: res.data._id, fullName: res.data.fullName, email: res.data.email,
        }));
        window.location.href = '/dashboard.html';
      } catch (err) {
        showToast(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Signup failed', 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }
}

function setupSidebar() {
  const user = JSON.parse(localStorage.getItem('taskflow_user') || '{}');
  const nameEl = document.getElementById('sidebar-user-name');
  const emailEl = document.getElementById('sidebar-user-email');
  const avatarEl = document.getElementById('sidebar-user-avatar');
  if (nameEl) nameEl.textContent = user.fullName || 'User';
  if (emailEl) emailEl.textContent = user.email || '';
  if (avatarEl) avatarEl.textContent = getInitials(user.fullName);

  // Highlight active nav
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.location.href = '/login.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', initAuth);
