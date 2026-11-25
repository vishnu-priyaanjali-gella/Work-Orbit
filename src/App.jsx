import { useEffect } from 'react';
import Home from './pages/Home.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import { useLocalStore } from './lib/useLocalStore.js';
import { navigate, useRoute } from './lib/router.js';

export default function App() {
  const { store, dispatch, userId, signIn, adminId, signInAdmin, error, dismiss } = useLocalStore();
  const path = useRoute();
  const user = store.users.find((u) => u.id === userId && u.role !== 'admin');
  const admin = store.users.find((u) => u.id === adminId && u.role === 'admin');

  // The user portal and the admin portal check their own sessions.
  let redirect = null;
  if (path === '/app' && !user) redirect = '/login';
  else if (path === '/admin' && !admin) redirect = '/admin/login';
  else if ((path === '/login' || path === '/signup') && user) redirect = '/app';
  else if (path === '/admin/login' && admin) redirect = '/admin';

  useEffect(() => { if (redirect) navigate(redirect); }, [redirect]);
  // Remove saved sessions whose account no longer exists.
  useEffect(() => { if (userId && !user) signIn(null); }, [userId, user]);
  useEffect(() => { if (adminId && !admin) signInAdmin(null); }, [adminId, admin]);
  if (redirect) return null;

  const logout = () => { signIn(null); navigate('/'); };
  const logoutAdmin = () => { signInAdmin(null); navigate('/'); };
  const auth = (mode, onSignIn) => (
    <Auth key={mode} mode={mode} users={store.users} dispatch={dispatch} onSignIn={onSignIn} />
  );

  let page = <Home user={user} />;
  if (path === '/login') page = auth('login', signIn);
  else if (path === '/signup') page = auth('signup', signIn);
  else if (path === '/admin/login') page = auth('admin', signInAdmin);
  else if (path === '/app') {
    page = <Dashboard key={user.id} user={user} store={store} dispatch={dispatch} onLogout={logout} />;
  } else if (path === '/admin') {
    page = <AdminDashboard user={admin} store={store} dispatch={dispatch} onLogout={logoutAdmin} />;
  }

  return (
    <>
      {page}
      {error && (
        <div role="alert" style={{ position: 'fixed', bottom: 16, left: 16, right: 16, maxWidth: 480, margin: '0 auto', zIndex: 2000, background: '#991b1b', color: '#fff', padding: '12px 16px', borderRadius: 8 }}>
          {error} <button onClick={dismiss} aria-label="Dismiss">×</button>
        </div>
      )}
    </>
  );
}
