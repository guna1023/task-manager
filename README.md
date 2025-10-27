# task-manager[README.md](https://github.com/user-attachments/files/23169210/README.md)
# Task Manager (Local Version)

This is a local MERN-style Task Manager app that uses an Express backend with a JSON-file database (no MongoDB required) and a React frontend.

## How to run locally

1. Open two terminals.

Backend:
```
cd backend
npm install
npm start
```

Frontend:
```
cd frontend
npm install
npm start
```

2. Register a new user (Register page), then Login.
3. Add / complete / delete tasks. Tasks are saved in `backend/db/tasks.json`.

## Push to GitHub
- Initialize a git repo in the root folder:
```
git init
git add .
git commit -m "Initial commit - local task manager"
```
- Create a remote repo on GitHub and push.
