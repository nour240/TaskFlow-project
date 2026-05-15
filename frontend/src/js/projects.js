function loadProjects(page = 1, limit = 10) {
  const token = localStorage.getItem('taskflow_token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  axios.get(`/api/projects?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      const { data, total, page: currentPage, totalPages } = res.data;
      const projectsContainer = document.getElementById('projectsContainer');
      const pagination = document.getElementById('pagination');

      if (data.length === 0) {
        projectsContainer.innerHTML = '<p>Aucun projet trouvé.</p>';
        pagination.innerHTML = '';
        return;
      }

      let html = data.map(p => `
        <div class="project-card">
          <h3>${p.title}</h3>
          <p>${p.description}</p>
          <p><strong>Statut :</strong> ${p.status}</p>
          <p><strong>Échéance :</strong> ${p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'Aucune'}</p>
          <p><strong>Créé le :</strong> ${new Date(p.createdAt).toLocaleDateString()}</p>
          <div class="actions">
            <button onclick="editProject('${p._id}')">Modifier</button>
            <button onclick="deleteProject('${p._id}')">Supprimer</button>
          </div>
        </div>
      `).join('');

      projectsContainer.innerHTML = html;

      pagination.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => loadProjects(i, limit);
        pagination.appendChild(btn);
      }
    })
    .catch(err => {
      console.error('Error loading projects:', err);
      alert('Failed to load projects');
    });
}

// Fonction pour créer un projet
function createProject() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const dueDate = document.getElementById('dueDate').value;

  const token = localStorage.getItem('taskflow_token');
  if (!token) {
    alert('Please log in first');
    return;
  }

  axios.post('/api/projects', {
    title,
    description,
    dueDate
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      alert('Project created successfully!');
      document.getElementById('projectForm').reset();
      loadProjects(); // Recharger la liste
    })
    .catch(err => {
      alert('Failed to create project: ' + (err.response?.data?.message || 'Unknown error'));
    });
}

function editProject(id) {
  const token = localStorage.getItem('taskflow_token');
  const project = document.getElementById('projectForm');
  const title = prompt('New title:', project.title);
  const description = prompt('New description:', project.description);
  const dueDate = prompt('New due date (YYYY-MM-DD):', project.dueDate);

  if (!title || !description) return;

  axios.put(`/api/projects/${id}`, {
    title,
    description,
    dueDate: dueDate || null
  }, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      alert('Project updated!');
      loadProjects();
    })
    .catch(err => {
      alert('Failed to update project');
    });
}

function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;

  const token = localStorage.getItem('taskflow_token');
  axios.delete(`/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      alert('Project deleted!');
      loadProjects();
    })
    .catch(err => {
      alert('Failed to delete project');
    });
}

window.onload = function () {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }

  loadProjects();
};