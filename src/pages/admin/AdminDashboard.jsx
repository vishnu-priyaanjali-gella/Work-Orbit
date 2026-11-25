import { useState } from 'react';
import TaskModal from '../../components/TaskModal.jsx';
import UserModal from '../../components/UserModal.jsx';
import { uid } from '../../lib/store.js';
import '../../styles/admin.css';
import '../../styles/app.css';

export default function Admin({ user, store, dispatch, onLogout }) {
  const [section, setSection] = useState('dashboard');
  const [editUser, setEditUser] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const newTask = () => setEditTask({
    id: uid(), projectId: store.projects[0].id, title: '', description: '',
    status: 'todo', priority: 'medium', due: '', assigneeId: '', comments: [],
  });
  const users = store.users.filter((u) => u.role !== 'admin');
  const done = store.tasks.filter((t) => t.status === 'done').length;
  const nameOf = (id) => store.users.find((u) => u.id === id)?.name ?? 'Unassigned';
  const stats = [
    ['Total Users', users.length],
    ['Total Tasks', store.tasks.length],
    ['Completed Tasks', done],
    ['Pending Tasks', store.tasks.length - done],
  ];

  return (
    <>
    <div className="page-admin">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <a href="#/" className="admin-brand">✓ WorkOrbit</a>
          <h2>Admin Panel</h2>
          {['dashboard', 'users', 'tasks'].map((s) => (
            <button key={s} className={section === s ? 'active' : ''} onClick={() => setSection(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button onClick={onLogout}>Logout</button>
        </aside>

        <main className="dashboard-main">
          <div className="topbar">
            <h1>Admin Dashboard</h1>
            <span className="badge badge-admin">Administrator</span>
          </div>

          {section === 'dashboard' && (
            <section>
              <h2>System Overview</h2>
              <div className="grid grid-4">
                {stats.map(([label, value]) => (
                  <div className="stat-card" key={label}><h3>{value}</h3><p>{label}</p></div>
                ))}
              </div>
            </section>
          )}

          {section === 'users' && (
            <section>
              <div className="section-head">
                <h2>Registered Users</h2>
                <button className="btn btn-primary" onClick={() => setEditUser({})}>+ Add user</button>
              </div>
              {!users.length ? <p>No users have signed up yet.</p> : (
                <div className="table-container card">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Assigned tasks</th><th>Action</th></tr></thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{store.tasks.filter((t) => t.assigneeId === u.id).length}</td>
                          <td className="row-actions">
                            <button className="btn btn-secondary" onClick={() => setEditUser(u)}>Edit</button>
                            <button className="btn btn-danger" onClick={() => {
                              if (window.confirm(`Delete ${u.name}? Projects only they belong to are removed too.`)) {
                                dispatch({ type: 'deleteUser', id: u.id });
                              }
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {section === 'tasks' && (
            <section>
              <div className="section-head">
                <h2>All Tasks</h2>
                <button className="btn btn-primary" onClick={newTask} disabled={!store.projects.length}>+ Add task</button>
              </div>
              {!store.tasks.length ? <p>No tasks yet.</p> : (
                <div className="table-container card">
                  <table>
                    <thead><tr><th>Task</th><th>Project</th><th>Assignee</th><th>Deadline</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {store.tasks.map((t) => (
                        <tr key={t.id}>
                          <td>{t.title}</td>
                          <td>{store.projects.find((p) => p.id === t.projectId)?.name}</td>
                          <td>{nameOf(t.assigneeId)}</td>
                          <td>{t.due || '—'}</td>
                          <td>
                            <span className={`badge ${t.status === 'done' ? 'badge-completed' : 'badge-pending'}`}>
                              {t.status === 'done' ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td className="row-actions">
                            <button className="btn btn-secondary" onClick={() => setEditTask(t)}>Edit</button>
                            <button className="btn btn-danger" onClick={() => {
                              if (window.confirm(`Delete "${t.title}"?`)) dispatch({ type: 'deleteTask', id: t.id });
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
    {editUser && (
      <UserModal account={editUser} users={store.users} dispatch={dispatch} onClose={() => setEditUser(null)} />
    )}
    {editTask && (
      <div className="page-app modal-host">
        <TaskModal
          key={editTask.id}
          task={editTask}
          user={user}
          state={{ projects: store.projects, tasks: store.tasks, members: store.users }}
          isNew={!store.tasks.some((t) => t.id === editTask.id)}
          dispatch={dispatch}
          onClose={() => setEditTask(null)}
        />
      </div>
    )}
    </>
  );
}
