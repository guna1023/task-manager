const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(express.json());

const DB_DIR = path.join(__dirname, 'db');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const TASKS_FILE = path.join(DB_DIR, 'tasks.json');
const JWT_SECRET = process.env.JWT_SECRET || 'localsecretkey';

// helper to read/write JSON files
function readJson(file) {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file);
  if (!raw || raw.length === 0) return [];
  return JSON.parse(raw);
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ensure files exist
if (!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, []);
if (!fs.existsSync(TASKS_FILE)) writeJson(TASKS_FILE, []);

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Name, email, password required' });
  const users = readJson(USERS_FILE);
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: nanoid(), name, email, password: hashed };
  users.push(user);
  writeJson(USERS_FILE, users);
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ id: user.id, name: user.name, email: user.email, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJson(USERS_FILE);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ id: user.id, name: user.name, email: user.email, token });
});

// Tasks routes
app.get('/api/tasks', authMiddleware, (req, res) => {
  const tasks = readJson(TASKS_FILE);
  const userTasks = tasks.filter(t => t.userId === req.user.id);
  res.json(userTasks);
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });
  const tasks = readJson(TASKS_FILE);
  const task = { id: nanoid(), userId: req.user.id, title, completed: false, createdAt: new Date().toISOString() };
  tasks.push(task);
  writeJson(TASKS_FILE, tasks);
  res.json(task);
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const tasks = readJson(TASKS_FILE);
  const idx = tasks.findIndex(t => t.id === id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  if (title !== undefined) tasks[idx].title = title;
  if (completed !== undefined) tasks[idx].completed = completed;
  tasks[idx].updatedAt = new Date().toISOString();
  writeJson(TASKS_FILE, tasks);
  res.json(tasks[idx]);
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  let tasks = readJson(TASKS_FILE);
  const idx = tasks.findIndex(t => t.id === id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  const removed = tasks.splice(idx, 1)[0];
  writeJson(TASKS_FILE, tasks);
  res.json({ message: 'Task removed', task: removed });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
