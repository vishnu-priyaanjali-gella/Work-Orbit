import { useState } from 'react';
import Modal from './Modal.jsx';
import { hashPassword, isEmail, normalizeEmail } from '../lib/auth.js';
import { uid } from '../lib/store.js';
import '../styles/app.css';

// Administrator form to add a user or edit an existing one.
export default function UserModal({ account, users, dispatch, onClose }) {
  const isNew = !account.id;
  const [form, setForm] = useState({ name: account.name ?? '', email: account.email ?? '', password: '' });
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = normalizeEmail(form.email);
    if (name.length < 2) return setError('Enter a name of at least 2 characters.');
    if (!isEmail(email)) return setError('Enter a valid email address.');
    if (users.some((u) => u.email === email && u.id !== account.id)) return setError('That email is already in use.');
    if ((isNew || form.password) && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) {
      return setError('Use a password of at least 8 characters with a letter and a number.');
    }
    const id = account.id ?? uid();
    const passwordHash = form.password ? await hashPassword(id, form.password) : undefined;
    dispatch(
      isNew
        ? { type: 'register', user: { id, name, email, role: 'user', passwordHash } }
        : { type: 'updateUser', id, changes: { name, email, passwordHash } }
    );
    onClose();
  };

  return (
    <div className="page-app modal-host">
      <Modal title={isNew ? 'Add user' : 'Edit user'} onClose={onClose}>
        <form onSubmit={save} noValidate>
          <label>Name<input value={form.name} onChange={set('name')} /></label>
          <label>Email<input type="email" value={form.email} onChange={set('email')} /></label>
          <label>{isNew ? 'Password' : 'New password (optional)'}
            <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <footer>
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="primary">Save user</button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
