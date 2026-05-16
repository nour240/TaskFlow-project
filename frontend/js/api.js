//Axios-based HTTP client with auto-attached JWT
//Auto-attach JWT to every request 
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Handle 401 globally 
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/login.html';
      }
    }
    return Promise.reject(err);
  }
);

const API = {
  // Auth 
  signup: (data) => axios.post('/api/auth/signup', data),
  login: (data) => axios.post('/api/auth/login', data),
  getMe: () => axios.get('/api/auth/me'),
};
