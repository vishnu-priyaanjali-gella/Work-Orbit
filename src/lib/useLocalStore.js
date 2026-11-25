import { useEffect, useReducer, useRef, useState } from 'react';
import { importBlocked, reducer } from './store.js';
import { ADMIN_SESSION_KEY, DATA_KEY, SESSION_KEY, loadData, loadSession, parseData, saveData, saveSession } from './storage.js';

// App data and login session, kept in Local Storage and synced between tabs.
export function useLocalStore() {
  const [store, rawDispatch] = useReducer(reducer, undefined, loadData);
  const [userId, setUserId] = useState(() => loadSession(SESSION_KEY));
  const [adminId, setAdminId] = useState(() => loadSession(ADMIN_SESSION_KEY));
  const [error, setError] = useState('');
  const latest = useRef(store);
  latest.current = store;

  useEffect(() => {
    setError(saveData(store) ? '' : 'Could not save to Local Storage. Changes will be lost on refresh.');
  }, [store]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === DATA_KEY) {
        const data = e.newValue && parseData(e.newValue);
        if (data) rawDispatch({ type: 'replace', state: data });
      }
      if (e.key === SESSION_KEY) setUserId(e.newValue);
      if (e.key === ADMIN_SESSION_KEY) setAdminId(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = (id) => {
    saveSession(id, SESSION_KEY);
    setUserId(id);
  };
  const signInAdmin = (id) => {
    saveSession(id, ADMIN_SESSION_KEY);
    setAdminId(id);
  };

  // Returns false when a change is not allowed, so forms can show a message.
  const dispatch = (action) => {
    if (action.type === 'addMember') {
      const email = action.email.trim().toLowerCase();
      const member = latest.current.users.find((u) => u.email === email && u.role !== 'admin');
      if (!member) return false;
      rawDispatch({ ...action, memberId: member.id });
    } else if (action.type === 'importProject') {
      const importer = userId;
      if (importBlocked(latest.current, action.data, importer)) return false;
      rawDispatch({ ...action, userId: importer });
    } else {
      rawDispatch(action);
    }
    return true;
  };

  return { store, dispatch, userId, signIn, adminId, signInAdmin, error, dismiss: () => setError('') };
}
