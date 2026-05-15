function saveToken(token) {
  localStorage.setItem('taskflow_token', token);
}


function getToken() {
  return localStorage.getItem('taskflow_token');
}


function removeToken() {
  localStorage.removeItem('taskflow_token');
}


function isAuthenticated() {
  return !!getToken();
}


function restoreSession() {
  const token = getToken();
  if (token) {
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    axios.get('/api/auth/me')
      .then(res => {
        console.log('Session restored:', res.data.user);
        
        window.location.href = '/dashboard.html';
      })
      .catch(err => {
        console.error('Session invalid:', err);
        removeToken();
        window.location.href = '/login.html';
      });
  }
}


function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  axios.post('/api/auth/login', { email, password })
    .then(res => {
      const { token, user } = res.data;
      saveToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      alert('Login successful!');
      window.location.href = '/dashboard.html';
    })
    .catch(err => {
      alert('Login failed: ' + (err.response?.data?.message || 'Unknown error'));
    });
}


function register() {
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  axios.post('/api/auth/register', { fullName, email, password })
    .then(res => {
      alert('Registration successful! Please log in.');
      window.location.href = '/login.html';
    })
    .catch(err => {
      alert('Registration failed: ' + (err.response?.data?.message || 'Unknown error'));
    });
}


function logout() {
  removeToken();
  delete axios.defaults.headers.common['Authorization'];
  window.location.href = '/login.html';
}

