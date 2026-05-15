
function loadTasks(projectId, page = 1, limit = 10) {
  const token = localStorage.getItem('taskflow_token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  axios.get(`/api/projects/${projectId}/tasks?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      const { data, total, page: currentPage, totalPages } = res.data;
      const tasksContainer = document.getElementById('tasksContainer');
      const pagination = document.getElementById('pagination');

      if (data.length === 0) {
        tasksContainer.innerHTML = '<p>Aucune tâche trouvée.</p>';
        pagination.innerHTML = '';
        return;
      }

      let html = data.map(t => `
        <div class="task-card">
          <h4>${t.title}</h4>
          <p><strong>Priorité :</strong> <span class="priority-${t.priority}">${t.priority}</span></p>
          <p><strong>Statut :</strong> <span class="status-${t.status}">${t.status}</span></p>
          <p><strong>Assigné à :</strong> ${t.assignedTo ? t.assignedTo.fullName : 'Non assigné'}</p>
          <p><strong>Créé le :</strong> ${new Date(t.createdAt).toLocaleDateString()}</p>
          <div class="actions">
            <select onchange="updateStatus('${t._id}', this.value)">
              <option value="à faire" ${t.status === 'à faire' ? 'selected' : ''}>À faire</option>
              <option value="en cours" ${t.status === 'en cours' ? 'selected' : ''}>En cours</option>
              <option value="terminé" ${t.status === 'terminé' ? 'selected' : ''}>Terminé</option>
            </select>
            <button onclick="editTask('${t._id}')">Modifier</button>
            <button onclick="deleteTask('${t._id}')">Supprimer</button>
          </div>
        </div>
      `).join('');

      tasksContainer.innerHTML = html;

      // Générer la pagination
      pagination.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => loadTasks(projectId, i, limit);
        pagination.appendChild(btn);
      }
    })
    .catch(err => {
      console.error('Error loading tasks:', err);
      alert('Failed to load tasks');
    });
}


function updateStatus(id, status) {
  const token = localStorage.getItem('taskflow_token');
  axios.patch(`/api/tasks/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      alert('Status updated!');
      loadTasks(document.getElementById('projectId').value);
    })
    .catch(err => {
      alert('Failed to update status');
    });
}


function createTask() {
  const projectId = document.getElementById('projectId').value;
  const title = document.getElementById('title').value;
  const priority = document.getElementById('priority').value;
  const status = document.getElementById('status').value;
  const assignedTo = document.getElementById('assignedTo').value;

  const token = localStorage.getItem('taskflow_token');
  axios.post('/api/tasks', {
    title,
    priority,
    status,
    project: projectId,
    assignedTo: assignedTo || null
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      alert('Task created!');
      document.getElementById('taskForm').reset();
      loadTasks(projectId);
    })
    .catch(err => {
      alert('Failed to create task: ' + (err.response?.data?.message || 'Unknown error'));
    });
}


function editTask(id) {
  const token = localStorage.getItem('taskflow_token');
  const task = document.getElementById('taskForm');
  const title = prompt('New title:', task.title);
  const priority = prompt('New priority (basse/moyenne/haute):', task.priority);
  const status = prompt('New status (à faire/en cours/terminé):', task.status);
  const assignedTo = prompt('Assign to (email or ID):', task.assignedTo);

  if (!title || !priority || !status) return;

  axios.put(`/api/tasks/${id}`, {
    title,
    priority,
    status,
    assignedTo: assignedTo || null
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      alert('Task updated!');
      loadTasks(document.getElementById('projectId').value);
    })
    .catch(err => {
      alert('Failed to update task');
    });
}


function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  const token = localStorage.getItem('taskflow_token');
  axios.delete(`/api/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      alert('Task deleted!');
      loadTasks(document.getElementById('projectId').value);
    })
    .catch(err => {
      alert('Failed to delete task');
    });
}


window.onload = function () {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }

  const projectId = new URLSearchParams(window.location.search).get('id');
  if (!projectId) {
    alert('Project ID is required');
    window.location.href = '/dashboard.html';
    return;
  }

  document.getElementById('projectId').value = projectId;
  loadTasks(projectId);
};