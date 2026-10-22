
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  NotebookPen,
  Files,
  Sparkles,
  Bell,
  ActivityIcon,
  MessageCircle,
  LogIn,
  LogOut,
  UserPlus,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const groups = [
    {
      name: "YOUR WORKSPACE",
      links: [
        { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
        { name: "Projects", path: "/projects", icon: FolderKanban },
        { name: "Shared notes", path: "/notes", icon: NotebookPen },
        { name: "Files", path: "/files", icon: Files },
      ],
    },
    {
      name: "PEOPLE & UPDATES",
      links: [
        { name: "Team", path: "/team", icon: Users },
        { name: "Team chat", path: "/chat", icon: MessageCircle },
        { name: "Activity", path: "/activity", icon: ActivityIcon },
        { name: "Notifications", path: "/notifications", icon: Bell },
      ],
    },
  ];

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const displayName = user?.name?.trim().split(/\s+/)[0] || "Workspace";
  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "C";

  if (!user) {
    return (
      <header className="app-navbar is-guest">
        <Link to="/login" className="navbar-brand">
          <span className="navbar-logo"><Sparkles size={21} /></span>
          <span>CollabSphere</span>
        </Link>
        <span className="guest-nav-message">One space for your best work.</span>
        <nav className="navbar-auth-actions" aria-label="Account">
          <NavLink className="navbar-login-link" to="/login">
            <LogIn size={17} />
            <span>Log in</span>
          </NavLink>
          <Link className="navbar-auth-button navbar-register-button" to="/register">
            <UserPlus size={17} />
            <span>Create account</span>
            <ChevronRight size={15} />
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <aside className="app-navbar is-authenticated">
      <Link to="/dashboard" className="navbar-brand">
        <span className="navbar-logo"><Sparkles size={21} /></span>
        <span>Collab<span>Sphere</span></span>
      </Link>

      <div className="sidebar-workspace">
        <span className="workspace-avatar"><FolderKanban size={17} /></span>
        <span className="workspace-copy">
          <strong>My workspace</strong>
          <small><i /> All systems ready</small>
        </span>
        <ChevronRight size={15} />
      </div>

      <nav className="navbar-links" aria-label="Main navigation">
        {groups.map((group) => (
          <div className="navbar-nav-group" key={group.name}>
            <span className="navbar-group-label">{group.name}</span>
            {group.links.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{name}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-tip">
        <span className="sidebar-tip-icon"><ShieldCheck size={17} /></span>
        <strong>Your team, in sync</strong>
        <p>Projects, notes and conversations—all in one place.</p>
      </div>

      <div className="navbar-account">
        <span className="navbar-avatar" aria-hidden="true">{initials}</span>
        <span className="navbar-user-copy">
          <strong className="navbar-user-name">{displayName}</strong>
          <small>Workspace member</small>
        </span>
        <button
          className="navbar-logout-button"
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={17} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;
