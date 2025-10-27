import React, { useState } from 'react';

export default function TaskForm({ setTasks, user }) {
  const [title, setTitle] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/tasks', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + user.token },
      body: JSON.stringify({ title })
    });
    const data = await res.json();
    setTasks(prev => [...prev, data]);
    setTitle('');
  };
  return (
    <form onSubmit={submit}>
      <input placeholder="New task..." value={title} onChange={e=>setTitle(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  );
}
