import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const socket = io('http://localhost:5000');

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();

    // WebSockets Real-time Listeners
    socket.on('taskCreated', () => fetchTasks());
    socket.on('taskUpdated', () => fetchTasks());
    socket.on('taskDeleted', () => fetchTasks());

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', { title, description, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Error creating task');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      alert('Error updating task status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      alert('Error deleting task');
    }
  };

  return (
    <div>
      <div className="navbar">
        <h2>Task Manager</h2>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>

      <div className="container">
        {/* Create Task Form */}
        <div className="card">
          <h3>Create New Task</h3>
          <form onSubmit={handleCreate}>
            <input type="text" placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button className="btn btn-success" type="submit">Add Task</button>
          </form>
        </div>

        {/* Task List */}
        <h3>Your Tasks</h3>
        {tasks.map((task) => (
          <div className="card task-item" key={task._id}>
            <div>
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <small>Status: <strong>{task.status}</strong></small>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button className="btn btn-danger" onClick={() => handleDelete(task._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;