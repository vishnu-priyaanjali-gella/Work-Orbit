import { useState } from 'react';
import Modal from './Modal.jsx';
import { exportProject } from '../lib/store.js';

export default function ShareModal({ project, user, store, dispatch, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const owner = project.ownerId === user.id;

  const add = (e) => {
    e.preventDefault();
    setError('');
    if (dispatch({ type: 'addMember', projectId: project.id, email })) setEmail('');
    else setError('Could not add that person. Check that they have signed up with this email.');
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(exportProject(store, project.id), null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/[^\w-]+/g, '-').toLowerCase()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  return (
    <Modal title={`Share “${project.name}”`} onClose={onClose}>
      <h3>Team members</h3>
      <ul className="members">
        {store.users.filter((u) => project.memberIds.includes(u.id)).map((u) => (
          <li key={u.id}>
            <span>{u.name} <small>{u.email}{u.id === project.ownerId ? ' · owner' : ''}</small></span>
            {owner && u.id !== user.id && (
              <button className="icon" aria-label={`Remove ${u.name}`}
                onClick={() => dispatch({ type: 'removeMember', projectId: project.id, memberId: u.id })}>×</button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="inline">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Teammate's email" aria-label="Teammate's email" />
        <button>Add member</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <h3>Send this project</h3>
      <p className="muted">Download a project file and send it to a teammate. They load it with “Import project”.</p>
      <button className="primary" onClick={download}>Download project file</button>
    </Modal>
  );
}
