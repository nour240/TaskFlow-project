
# 📌 TaskFlow – Application de Gestion de Projets Collaboratifs  
### Projet de Fin de Module – Développement Fullstack (JavaScript · Express · MongoDB · Docker · GitHub)

> **Date de rendu : 20 mai 2026**  
> **Équipe : 3 membres**  
> **Technologies :** Node.js, Express, MongoDB (Docker), JWT, Axios, HTML/CSS/JS, Docker Compose

---

## 🧑‍💼 Répartition Équitable des Fonctionnalités



## 🛠️ Stack Technique

- **Frontend** : HTML, CSS, JavaScript (vanilla), Axios
- **Backend** : Node.js + Express
- **Base de données** : MongoDB (via Docker)
- **Authentification** : JWT (stocké dans `localStorage`)
- **Sécurité** : `bcryptjs` (10 rounds), middleware d’authentification, `.env` sécurisé
- **Infrastructure** : Docker, `docker-compose.yml`
- **Workflow Git** : `main` (stable), `develop`, branches feature par fonctionnalité
- **Conventions** : Commit Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

---


## 🔐 Fonctionnalités Implémentées
### ✅ setup:(Nour Hammadi)
### ✅ F1 – Authentification(Nour Hammadi)
- Inscription & connexion avec validation des champs
- Mot de passe haché avec `bcryptjs` (10 rounds)
- JWT généré côté serveur, stocké dans `localStorage`
- Middleware d’authentification protégeant les routes
- Restauration automatique de session au rechargement
- Déconnexion : suppression du token

> **Branches Git** : `feature/authentification` → PR vers `develop`

---

### ✅ F2 – Gestion des projets(Sara El Rebbate)
- Création, modification, suppression de projets
- Champs : titre, description, date limite (optionnelle), statut (`actif`, `en pause`, `archivé`)
- Relation `owner` vers `users`
- Suppression en cascade des tâches via `pre('deleteOne')`
- Pagination (`page`, `limit`) sur `/api/projects`

> **Branches Git** : `feature/projets` → PR vers `develop`

---

### ✅ F3 – Gestion des tâches(Douae Beghiel)
- Tâches avec : titre, priorité (`basse`, `moyenne`, `haute`), statut (`à faire`, `en cours`, `terminé`)
- Validation des champs via `enum` dans Mongoose et Express
- Routes CRUD : `GET`, `POST`, `PUT`, `DELETE` sur `/api/tasks/:id`
- Route `PATCH /api/tasks/:id/status` pour mise à jour du statut
- Récupération des tâches d’un projet : `GET /api/projects/:id/tasks`

> **Branches Git** : `feature/taches` → PR vers `develop`

---

### ✅ F4 – Assignation des tâches aux membres(Nour Hammadi)
- Champ `assignedTo` dans le modèle `Task` (référence à `User`)
- `.populate()` avec projection (`nom`, `email`) → pas de mot de passe
- Menu déroulant dynamique dans l’interface (appel Axios)
- Dashboard personnel : affiche uniquement les tâches assignées
- Filtrage Mongoose : `project` + `assignedTo`

> **Branches Git** : `feature/assignation` → PR vers `develop`

---

### ✅ F5 – Tableau de bord personnel(Sara El Rebbate)
- Affichage des métriques :
  - Nombre de projets actifs
  - Tâches assignées
  - Tâches terminées
  - Tâches en retard (date limite dépassée, statut ≠ terminé)
- Calcul côté serveur via pipeline d’agrégation MongoDB (`$match`, `$group`, `$count`)
- Tâches en cours triées par priorité décroissante, puis date limite croissante
- Un seul appel Axios au chargement de la page

> **Branches Git** : `feature/dashboard` → PR vers `develop`

---

### ✅ F6 – Filtrage, recherche et pagination(Douae Beghiel)
- Contrôles : filtre par statut, priorité, membre assigné
- Barre de recherche (mot-clé dans titre/description) avec `$regex` (option `i`)
- Paramètres query : `status`, `priority`, `member`, `q`, `page`, `limit`
- Filtrage conditionnel côté serveur
- Réponse API : `{ data, total, page, totalPages }`
- Navigation entre pages côté client

> **Branches Git** : `feature/filtrage` → PR vers `develop`

---

### ✅ F7 – Sauvegarde automatique des brouillons(Nour Hammadi)
- Sauvegarde en `localStorage` à chaque `input` dans le formulaire de tâche
- Clé : `draft:projectId`
- Restauration automatique au chargement du formulaire
- Suppression du brouillon après soumission réussie
- Option : "Restaurer le brouillon" ou "Commencer à zéro"

> **Branches Git** : `feature/brouillons` → PR vers `develop`

---

### ✅ F8 – Gestion des membres d’un projet(Sara El Rebbate)
- Invitation par email (vérification de l’existence du compte)
- Membre invité : accès en lecture seule au projet
- Ne peut modifier que les tâches assignées
- Créateur du projet : seul autorisé à modifier le projet ou retirer des membres
- Route `DELETE /api/projects/:id/members/:userId` pour retrait

> **Branches Git** : `feature/membres` → PR vers `develop`

---

### ✅ F9 – Historique des activités(Douae Beghiel)
- Collection `activities` : type d’action, projet, utilisateur, horodatage
- Événements tracés :
  - Création/suppression de tâche
  - Changement de statut
  - Ajout/retrait de membre
  - Modification du projet
- Route `GET /api/projects/:id/activities` → trié par date décroissante
- Affichage lisible : « Sara a changé le statut de Maquette à Terminé - il y a 2 heures »

> **Branches Git** : `feature/activites` → PR vers `develop`

---

### ✅ F10 – Notifications en temps réel(Nour Hammadi)
- Notifications déclenchées par :
  - Assignation de tâche
  - Changement de statut
  - Ajout à un projet
- Récupération via `GET /api/notifications`
- Stockage en mémoire côté client + archivage dans `localStorage`
- Badge de notification non lue dans la barre de navigation
- Marquage comme lue via `PATCH /api/notifications/:id/read`
- Polling every 30 seconds avec `setInterval`

> **Branches Git** : `feature/notifications` → PR vers `develop`

---

## 🔄 Workflow Git

```bash
main (stable) ← develop ← feature/authentification(Nour Hammadi)
                             ← feature/projets(Sara El Rebbate)
                             ← feature/taches(Douae Beghiel)
                             ← feature/assignation(Nour Hammadi)
                             ← feature/dashboard(Sara El Rebbate)
                             ← feature/filtrage(Douae Beghiel)
                             ← feature/brouillons(Nour Hammadi)
                             ← feature/membres(Sara El Rebbate)
                             ← feature/activites(Douae Beghiel)
                             ← feature/notifications(Nour Hammadi)
```

- **Pull Requests** : obligatoires, lues par au moins un autre membre
- **Commits** : respectent la convention Conventional Commits
- **.env** : jamais versionné
- **.gitignore** : bien configuré (exclut `.env`, `node_modules`, `logs`, etc.)

---

## 🐳 Lancement du Projet

```bash
# 1. Cloner le dépôt
git clone https://github.com/nour240/TaskFlow-project.git

# 2. Lancer l'application
docker-compose up --build

# 3. Accéder à l'application
http://localhost:3000
```

> ✅ **Tout le système démarre avec une seule commande** : `docker-compose up --build`

---

## 📄 Fichiers Importants

- `.env` : clé JWT, URI MongoDB, etc.
- `docker-compose.yml` : conteneur MongoDB + app Node.js
- `backend/models/User.js`, `Project.js`, `Task.js`, `Activity.js`, `Notification.js`
- `backend/routes/auth.js`, `projects.js`, `tasks.js`, `members.js`, `activities.js`, `notifications.js`
- `frontend/js/auth.js`, `dashboard.js`, `tasks.js`, `notifications.js`, `draft.js`

---

## 🎥 Livrables Attendus (20 mai 2026)

1. 🔗 **Lien vers le dépôt GitHub** avec :
   - Historique de commits complet
   - Pull Requests visibles
   - Branches feature bien nommées
2. 🎞️ **Vidéo de 2 minutes maximum** : démonstration des fonctionnalités principales
3. 📝 **Formulaire de rendu** : [https://forms.gle/5jAUEv1fu2ea2Hgd6](https://forms.gle/5jAUEv1fu2ea2Hgd6)

---

## > 🙌 *Remerciements*  
> Ce projet a été une expérience riche et enrichissante pour chacun d’entre nous. En travaillant ensemble sur TaskFlow, nous avons renforcé nos compétences en développement fullstack, notamment dans :  
> - La conception et la mise en œuvre d’une API REST sécurisée avec Express et JWT  
> - La gestion des données avec MongoDB via Docker  
> - L’architecture client-serveur avec Axios et gestion du state côté front  
> - La collaboration en équipe grâce à Git, les branches feature, les Pull Requests et les conventions de commit  
> - La résolution de problèmes techniques complexes (authentification, suppression en cascade, notifications en temps réel, etc.)  
> - La gestion du cycle de développement complet : conception, développement, tests, documentation et livraison  
>  
> Ce projet nous a permis de passer d’une compréhension théorique à une pratique concrète, en nous préparant au monde professionnel du développement web.