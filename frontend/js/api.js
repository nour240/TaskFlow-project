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

  // Projects
  getProjects: (params) => axios.get('/api/projects', { params }),
  getProject: (id) => axios.get(`/api/projects/${id}`),
  createProject: (data) => axios.post('/api/projects', data),
  updateProject: (id, data) => axios.put(`/api/projects/${id}`, data),
  deleteProject: (id) => axios.delete(`/api/projects/${id}`),

  // Tasks
  getTasks: (params) => axios.get('/api/tasks', { params }),
  getTask: (id) => axios.get(`/api/tasks/${id}`),
  createTask: (data) => axios.post('/api/tasks', data),
  updateTask: (id, data) => axios.put(`/api/tasks/${id}`, data),
  updateTaskStatus: (id, status) => axios.patch(`/api/tasks/${id}/status`, { status }),
  deleteTask: (id) => axios.delete(`/api/tasks/${id}`),

  // Members
  getMembers: (projectId) => axios.get(`/api/projects/${projectId}/members`),
  addMember: (projectId, email) => axios.post(`/api/projects/${projectId}/members`, { email }),
  removeMember: (projectId, memberId) => axios.delete(`/api/projects/${projectId}/members/${memberId}`),

  // Dashboard
  getDashboard: () => axios.get('/api/dashboard'),

  // Activities
  getActivities: (projectId, params) => axios.get(`/api/projects/${projectId}/activities`, { params }),

  // Notifications
  getNotifications: () => axios.get('/api/notifications'),
  markNotifRead: (id) => axios.patch(`/api/notifications/${id}/read`),
};