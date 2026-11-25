import { useRef, useState } from 'react';
import { COLORS, parseImport, progress, uid } from '../lib/store.js';

export default function Sidebar({ state, dispatch, today, user, onLogout, selected, onSelect }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const addProject = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const project = { id: uid(), name: name.trim(), color: COLORS[state.projects.length % COLORS.length], ownerId: user.id, memberIds: [user.id] };
    dispatch({ type: 'addProject', project });
    onSelect(project.id);
    setName('');
  };

  const importFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = parseImport(await file.text());
      const exists = state.projects.some((p) => p.id === data.project.id);
      if (exists && !window.confirm(`Update "${data.project.name}" with the imported file? Matching tasks will be overwritten.`)) return;
      setError('');
      if (dispatch({ type: 'importProject', data })) onSelect(data.project.id);
      else setError('This project belongs to other accounts here. Ask a member to add you from Share.');
    } catch {
      setError('That file is not a valid project export.');
    }
  };

  const remove = (p) => {
    if (!window.confirm(`Delete "${p.name}" and all its tasks?`)) return;
    dispatch({ type: 'deleteProject', id: p.id });
    onSelect('all');
  };

  return (
    <aside>
      <a href="#/" className="brand">✓ WorkOrbit</a>
      <button className={`project ${selected === 'all' ? 'active' : ''}`} onClick={() => onSelect('all')}>
        All tasks
      </button>
      <h2>Projects</h2>
      {state.projects.map((p) => (
        <div className="project-row" key={p.id}>
          <button className={`project ${selected === p.id ? 'active' : ''}`} onClick={() => onSelect(p.id)}>
            <i style={{ background: p.color }} />
            <span>{p.name}</span>
            <small>{progress(state.tasks.filter((t) => t.projectId === p.id), today).percent}%</small>
          </button>
          {p.ownerId === user.id && (
            <button className="icon" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>×</button>
          )}
        </div>
      ))}
      <form onSubmit={addProject} className="inline">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New project" aria-label="New project name" />
        <button>Add</button>
      </form>
      <button onClick={() => fileRef.current.click()}>Import project</button>
      <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={importFile} />
      {error && <p className="error" role="alert">{error}</p>}
      <div className="account">
        <span>{user.name}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}
