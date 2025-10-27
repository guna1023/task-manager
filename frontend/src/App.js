import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';

function Nav({ user, setUser }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };
  return (
    <nav>
      <div>
        <Link to="/" style={{color:'white', fontWeight:'bold'}}>Task Manager</Link>
      </div>
      <div>
        {user ? (
          <>
            <span>{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  return (
    <BrowserRouter>
      <Nav user={user} setUser={setUser} />
      <div className="container">
        <Routes>
          <Route path="/" element={<TaskList user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
