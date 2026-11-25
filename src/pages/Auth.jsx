import { useState } from 'react';
import { hashPassword, isEmail, normalizeEmail } from '../lib/auth.js';
import { uid } from '../lib/store.js';
import '../styles/auth.css';

function validate(form, signup) {
  const errors = {};
  if (signup && form.name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  if (!isEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!form.password) errors.password = 'Enter your password.';
  else if (signup && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) {
    errors.password = 'Use at least 8 characters with a letter and a number.';
  }
  if (signup && form.confirm !== form.password) errors.confirm = 'Passwords do not match.';
  return errors;
}

export default function Auth({ mode, users, dispatch, onSignIn }) {
  const signup = mode === 'signup';
  const adminPortal = mode === 'admin';
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const field = (key, label, props) => (
    <div className="form-group">
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        value={form[key]}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        onChange={(e) => {
          setForm({ ...form, [key]: e.target.value });
          setErrors({ ...errors, [key]: undefined });
          setError('');
        }}
        {...props}
      />
      {errors[key] && <small className="field-error" id={`${key}-error`}>{errors[key]}</small>}
    </div>
  );

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const found = validate(form, signup);
    setErrors(found);
    if (Object.keys(found).length) return;
    const email = normalizeEmail(form.email);
    const existing = users.find((u) => u.email === email);
    if (signup && existing) return setErrors({ email: 'An account with this email already exists.' });
    setBusy(true);
    try {
      if (signup) {
        const id = uid();
        const passwordHash = await hashPassword(id, form.password);
        dispatch({ type: 'register', user: { id, name: form.name.trim(), email, role: 'user', passwordHash } });
        onSignIn(id);
      } else if (existing && existing.passwordHash === (await hashPassword(existing.id, form.password))) {
        if ((existing.role === 'admin') === adminPortal) return onSignIn(existing.id);
        setError(adminPortal
          ? 'This account is not an administrator. Use the User Portal.'
          : 'This is the User Portal. Administrators must use the Admin Portal.');
        setBusy(false);
      } else {
        setError('Incorrect email or password.');
        setBusy(false);
      }
    } catch {
      setError('Sign-in needs a secure page: open the app on localhost or over HTTPS.');
      setBusy(false);
    }
  };

  const type = show ? 'text' : 'password';

  return (
    <div className={`page-auth ${adminPortal ? 'admin-portal' : ''}`}>
      <a href="#/" className="home-button">← Home</a>
      <div className="login-container">
        <section className="login-left">
          <a href="#/" className="brand"><div className="brand-icon">✓</div>WorkOrbit</a>
          <div className="login-left-content">
            <h1>{signup ? <>Join<br /> WorkOrbit</> : adminPortal ? <>Admin<br /> Portal</> : <>Welcome<br /> Back!</>}</h1>
            <p>
              {signup
                ? 'Create your WorkOrbit account and start managing your tasks, projects and deadlines.'
                : adminPortal
                ? 'Sign in as administrator to manage users and tasks and view the system overview.'
                : 'Log in to your WorkOrbit account and continue managing your tasks, projects and deadlines from one simple dashboard.'}
            </p>
            {(adminPortal
              ? ['Manage registered users', 'Monitor all tasks', 'View system totals']
              : ['Manage your tasks easily', 'Track your progress', 'Stay organized']
            ).map((text) => (
              <div className="benefit" key={text}><div className="benefit-icon">✓</div>{text}</div>
            ))}
          </div>
        </section>

        <section className="login-right">
          <div className="heading">
            <h2>{signup ? 'Create Account' : adminPortal ? 'Admin Login' : 'User Login'}</h2>
            <p>{signup ? 'Fill in your details to get started.' : 'Enter your account details to continue.'}</p>
          </div>
          <form onSubmit={submit} noValidate>
            {signup && field('name', 'Full Name', { placeholder: 'Enter your name', autoComplete: 'name' })}
            {field('email', 'Email Address', { type: 'email', placeholder: 'Enter your email', autoComplete: 'email' })}
            {field('password', 'Password', {
              type,
              placeholder: signup ? 'At least 8 characters' : 'Enter your password',
              autoComplete: signup ? 'new-password' : 'current-password',
            })}
            {signup && field('confirm', 'Confirm Password', { type, placeholder: 'Type the password again', autoComplete: 'new-password' })}
            <label className="show-password">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show password
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="login-btn" disabled={busy}>
              {signup ? 'Sign Up' : adminPortal ? 'Login as Admin' : 'Login to WorkOrbit'}
            </button>
          </form>
          {adminPortal ? (
            <>
              <div className="admin-note">
                <strong>Demo Admin Account</strong><br /> Email: admin@task.com<br /> Password: admin123
              </div>
              <div className="signup-text">Not an administrator? <a href="#/login">Go to User Portal</a></div>
            </>
          ) : (
            <>
              <div className="signup-text">
                {signup ? 'Already have an account? ' : "Don't have an account? "}
                <a href={signup ? '#/login' : '#/signup'}>{signup ? 'Login' : 'Create Account'}</a>
              </div>
              <div className="signup-text">Administrator? <a href="#/admin/login">Go to Admin Portal</a></div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
