import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';

export default function TaskList({ user }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:5000/api/tasks', {
      headers: { 'Authorization': 'Bearer ' + user.token }
    }).then(r=>r.json()).then(data=>setTasks(data));
  }, [user]);

  const toggle = async (t) => {
    await fetch('http://localhost:5000/api/tasks/' + t.id, {
      method:'PUT',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + user.token },
      body: JSON.stringify({ completed: !t.completed })
    });
    setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x));
  };

  const remove = async (id) => {
    await fetch('http://localhost:5000/api/tasks/' + id, {
      method:'DELETE',
      headers:{ 'Authorization':'Bearer ' + user.token }
    });
    setTasks(tasks.filter(t=>t.id !== id));
  };

  if (!user) return <div>Please login to see your tasks.</div>;

  return (
    <div>
      <h2>Your Tasks</h2>
      <TaskForm setTasks={setTasks} user={user} />
      <div>
        {tasks.map(t=>(
          <div className="task" key={t.id}>
            <div className="left">
              <input type="checkbox" checked={t.completed} onChange={()=>toggle(t)} />
              <div style={{textDecoration: t.completed ? 'line-through' : 'none'}}>{t.title}</div>
            </div>
            <div>
              <button onClick={()=>remove(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
