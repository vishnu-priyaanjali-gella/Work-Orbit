# WorkOrbit: Task Management System (React + Vite)

Data and the login session are stored in the browser's Local Storage. No server or database.

## Run it in VS Code
Needs Node.js 20.19+ or 22.12+. Open this folder, then in the terminal:

    npm install
    npm run dev      # opens the app, usually at http://localhost:5173

Other commands: `npm test`, `npm run build`, `npm run preview`.

## Two separate portals
| Portal | Login address | Dashboard |
|---|---|---|
| User | `#/login` (signup at `#/signup`) | `#/app` |
| Admin | `#/admin/login` | `#/admin` |

Demo admin: `admin@task.com` / `admin123`

## Folder structure
    index.html
    vite.config.js
    src/
      main.jsx          entry point
      App.jsx           routes and page access
      pages/            Home, Auth (login and signup)
        user/           user dashboard
        admin/          admin dashboard
      components/       reusable UI components
      lib/              storage, login, router, business logic
      styles/           one stylesheet per page
    tests/

## Modules
- **User:** projects and tasks (create, view, edit, delete), complete, drag-and-drop board
  and calendar, reminders, progress, search and filters, comments, sharing.
- **Admin:** totals, users (add, view, edit, delete), tasks (add, view, edit, delete).

## Local Storage
| Key | Contents |
|---|---|
| workorbit:data | users, projects, tasks |
| workorbit:session | id of the signed-in user; removed on logout |
| workorbit:admin-session | admin login; removed on logout |

To see it in Chrome: press F12, then Application > Local Storage.
The session stays after refresh or reopening the browser. Tabs stay in sync.

## Limitations
- Data stays in one browser on one computer.
- This is demonstration login, not real security. Do not use real passwords.
- Desktop alerts only work while the app is open.
- Drag-and-drop is unreliable on touch screens; use the task editor there.
