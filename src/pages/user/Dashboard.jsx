import { useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import Board from '../../components/Board.jsx';
import Calendar from '../../components/Calendar.jsx';
import TaskList from '../../components/TaskList.jsx';
import ProgressView from '../../components/ProgressView.jsx';
import TaskModal from '../../components/TaskModal.jsx';
import ShareModal from '../../components/ShareModal.jsx';
import Notifications from '../../components/Notifications.jsx';
import { useDesktopAlerts, useToday } from '../../lib/hooks.js';
import { progress, reminders, uid } from '../../lib/store.js';
import '../../styles/app.css';

const VIEWS = ['Board', 'Calendar', 'List', 'Progress'];

export default function Dashboard({ user, store, dispatch, onLogout }) {
  // Limit everything on this page to projects the signed-in user belongs to.
  const projects = store.projects.filter((p) => p.memberIds.includes(user.id));
  const mine = new Set(projects.map((p) => p.id));
  const teammates = new Set(projects.flatMap((p) => p.memberIds));
  const state = {
    projects,
    tasks: store.tasks.filter((t) => mine.has(t.projectId)),
    members: store.users.filter((u) => u.id === user.id || teammates.has(u.id)),
  };
  const [projectId, setProjectId] = useState('all');
  const [view, setView] = useState('Board');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [editing, setEditing] = useState(null);
  const [sharing, setSharing] = useState(false);
  const today = useToday();
  const alerts = useDesktopAlerts(state.tasks, today);

  const project = state.projects.find((p) => p.id === projectId);
  const scoped = project ? state.tasks.filter((t) => t.projectId === project.id) : state.tasks;
  const visible = scoped.filter(
    (t) =>
      t.title.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!priority || t.priority === priority) &&
      (!assignee || t.assigneeId === assignee)
  );
  const stats = progress(scoped, today);

  const newTask = (defaults = {}) => {
    if (!state.projects.length) return;
    setEditing({
      id: uid(), projectId: project?.id ?? state.projects[0].id, title: '', description: '',
      status: 'todo', priority: 'medium', due: '', assigneeId: user.id, comments: [], ...defaults,
    });
  };

  const shared = { tasks: visible, state, dispatch, today, onOpen: setEditing, onNew: newTask };

  return (
    <div className="page-app">
    <div className="app">
      <Sidebar
        state={state}
        dispatch={dispatch}
        today={today}
        user={user}
        onLogout={onLogout}
        selected={project ? project.id : 'all'}
        onSelect={(id) => { setProjectId(id); setAssignee(''); }}
      />
      <main>
        <header>
          <div>
            <h1>{project ? project.name : 'All tasks'}</h1>
            <p className="muted">
              {stats.done} of {stats.total} done · {stats.overdue} overdue
            </p>
          </div>
          <div className="actions">
            <Notifications tasks={reminders(state.tasks, today)} today={today} alerts={alerts} onOpen={setEditing} />
            {project && <button onClick={() => setSharing(true)}>Share</button>}
            <button className="primary" onClick={() => newTask()} disabled={!state.projects.length}>
              + New task
            </button>
          </div>
        </header>

        <div className="bar" role="progressbar" aria-label="Completion" aria-valuenow={stats.percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${stats.percent}%`, background: project?.color }} />
        </div>

        <div className="toolbar">
          <nav>
            {VIEWS.map((v) => (
              <button key={v} className={v === view ? 'active' : ''} aria-pressed={v === view} onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </nav>
          <input type="search" placeholder="Search tasks" aria-label="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select aria-label="Filter by assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Everyone</option>
            {state.members
              .filter((m) => !project || project.memberIds.includes(m.id))
              .map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        {view === 'Board' && <Board {...shared} />}
        {view === 'Calendar' && <Calendar {...shared} />}
        {view === 'List' && <TaskList {...shared} />}
        {view === 'Progress' && <ProgressView {...shared} />}
      </main>

      {editing && mine.has(editing.projectId) && (
        <TaskModal
          key={editing.id}
          task={editing}
          state={state}
          user={user}
          isNew={!state.tasks.some((t) => t.id === editing.id)}
          dispatch={dispatch}
          onClose={() => setEditing(null)}
        />
      )}
      {sharing && project && (
        <ShareModal project={project} user={user} store={store} dispatch={dispatch} onClose={() => setSharing(false)} />
      )}
    </div>
    </div>
  );
}
