import '../styles/home.css';

// Section links scroll instead of changing the URL hash, which the router uses.
const scrollTo = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export default function Home({ user }) {
  return (
    <div className="page-home">
      <header className="home-navbar">
          <a href="#/" className="brand">
              <div className="brand-icon">✓</div>
              <strong>Work<span>Orbit</span></strong>
          </a>
          <nav className="nav-links">
              <a href="#/" onClick={scrollTo('home')}>Home</a>
              <a href="#/" onClick={scrollTo('features')}>Features</a>
              <a href="#/" onClick={scrollTo('about')}>About</a>
          </nav>
          <div className="nav-buttons">
              {user ? (
                <a href={user.role === 'admin' ? '#/admin' : '#/app'} className="nav-signup">My Dashboard</a>
              ) : (
                <>
              <a href="#/login" className="nav-login">Login</a>
              <a href="#/signup" className="nav-signup">Get Started</a>
                </>
              )}
          </div>
      </header>
      <main id="home">
          <section className="hero">
              <div className="hero-content">
                  <div className="hero-badge">
                      ✨ Smart Task Management
                  </div>
                  <h1>
                      Organize your work.{' '}
                      <span>Achieve more.</span>
                  </h1>
                  <p>
                      WorkOrbit helps you organize tasks, manage deadlines, prioritize important work, and track your progress from one simple and powerful dashboard.
                  </p>
                  <div className="hero-buttons">
                      <a href="#/signup" className="primary-btn">
                          Get Started →
                      </a>
                      <a href="#/login" className="secondary-btn">
                          Login
                      </a>
                  </div>
                  <div className="hero-stats">
                      <div className="hero-stat">
                          <strong>100%</strong>
                          <span>Simple to use</span>
                      </div>
                      <div className="hero-stat">
                          <strong>24/7</strong>
                          <span>Task access</span>
                      </div>
                      <div className="hero-stat">
                          <strong>100%</strong>
                          <span>Local storage</span>
                      </div>
                  </div>
              </div>
              <div className="hero-visual">
                  <div className="dashboard-card">
                      <div className="dashboard-top">
                          <div className="dashboard-title">
                              My Dashboard
                          </div>
                          <div className="dashboard-dots">
                              <span></span>
                              <span></span>
                              <span></span>
                          </div>
                      </div>
                      <div className="overview">
                          <div className="overview-box">
                              <small>Total Tasks</small>
                              <strong>24</strong>
                          </div>
                          <div className="overview-box">
                              <small>Completed</small>
                              <strong>18</strong>
                          </div>
                          <div className="overview-box">
                              <small>Pending</small>
                              <strong>6</strong>
                          </div>
                      </div>
                      <div className="task-preview">
                          <div className="check">✓</div>
                          <div className="task-info">
                              <strong>Complete project documentation</strong>
                              <small>Today • Work</small>
                          </div>
                          <div className="priority">
                              HIGH
                          </div>
                      </div>
                      <div className="task-preview">
                          <div className="check">✓</div>
                          <div className="task-info">
                              <strong>Review development tasks</strong>
                              <small>Tomorrow • Project</small>
                          </div>
                          <div className="priority">
                              MEDIUM
                          </div>
                      </div>
                      <div className="task-preview">
                          <div className="check">✓</div>
                          <div className="task-info">
                              <strong>Prepare weekly report</strong>
                              <small>Friday • Reports</small>
                          </div>
                      </div>
                      <div className="progress-section">
                          <div className="progress-heading">
                              <span>Weekly Progress</span>
                              <strong>72%</strong>
                          </div>
                          <div className="progress-bar">
                              <div className="progress-fill"></div>
                          </div>
                      </div>
                  </div>
                  <div className="floating-card float-one">
                      <div className="floating-icon">
                          ✓
                      </div>
                      <div>
                          <strong>Task completed!</strong>
                          <small>Great progress</small>
                      </div>
                  </div>
                  <div className="floating-card float-two">
                      <div className="floating-icon">
                          📅
                      </div>
                      <div>
                          <strong>Upcoming deadline</strong>
                          <small>Project • Tomorrow</small>
                      </div>
                  </div>
              </div>
          </section>
          <section className="features-section" id="features">
              <div className="section-heading">
                  <div className="section-label">
                      Powerful Features
                  </div>
                  <h2>
                      Everything you need to stay organized
                  </h2>
                  <p>
                      Manage your everyday work efficiently with simple tools designed to help you focus on what matters.
                  </p>
              </div>
              <div className="features-grid">
                  <div className="feature-card">
                      <div className="feature-icon">
                          ✓
                      </div>
                      <h3>Task Management</h3>
                      <p>
                          Create, update, complete and delete tasks easily from your personal dashboard.
                      </p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">
                          ⚡
                      </div>
                      <h3>Priority Control</h3>
                      <p>
                          Mark tasks as high, medium or low priority so you can focus on important work first.
                      </p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">
                          📅
                      </div>
                      <h3>Deadlines</h3>
                      <p>
                          Set deadlines for your tasks and receive notifications when important dates are near.
                      </p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">
                          📊
                      </div>
                      <h3>Progress Tracking</h3>
                      <p>
                          Monitor completed and pending tasks using simple progress indicators.
                      </p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">
                          🔐
                      </div>
                      <h3>Secure Login</h3>
                      <p>
                          User registration and login information is managed using browser Local Storage.
                      </p>
                  </div>
                  <div className="feature-card">
                      <div className="feature-icon">
                          👨‍💼
                      </div>
                      <h3>Admin Dashboard</h3>
                      <p>
                          Administrators can manage users, monitor tasks and view overall system information.
                      </p>
                  </div>
              </div>
          </section>
          <section className="cta-section" id="about">
              <div className="cta-box">
                  <h2>
                      Ready to organize your work?
                  </h2>
                  <p>
                      Start managing your tasks with WorkOrbit and keep your projects, deadlines and priorities in one place.
                  </p>
                  <a href="#/signup" className="cta-button">
                      Create Your Account →
                  </a>
              </div>
          </section>
      </main>
      <footer className="footer">
          <div className="footer-content">
              <div className="footer-brand">
                  <a href="#/" className="brand">
                      <div className="brand-icon">✓</div>
                      <strong>Work<span>Orbit</span></strong>
                  </a>
                  <p>
                      A simple task management system designed to help users organize work, track progress and meet deadlines efficiently.
                  </p>
              </div>
              <div className="footer-column">
                  <h4>Navigation</h4>
                  <a href="#/" onClick={scrollTo('home')}>Home</a>
                  <a href="#/" onClick={scrollTo('features')}>Features</a>
                  <a href="#/" onClick={scrollTo('about')}>About</a>
              </div>
              <div className="footer-column">
                  <h4>Account</h4>
                  <a href="#/login">Login</a>
                  <a href="#/signup">Create Account</a>
                  <a href="#/admin/login">Admin Portal</a>
              </div>
          </div>
          <div className="footer-bottom">
              © 2026 WorkOrbit. Task Management System.
          </div>
      </footer>
    </div>
  );
}
