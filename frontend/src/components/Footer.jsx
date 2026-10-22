import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  FolderKanban,
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Footer.css";

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="app-footer">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link
            to={user ? "/dashboard" : "/login"}
            className="footer-brand"
          >
            <span className="footer-brand-icon"><Sparkles size={19} /></span>
            <span>Collab<span>Sphere</span></span>
          </Link>
          <p>
            Make good work happen together. Keep your team, ideas and projects
            moving in one shared space.
          </p>
          <span className="footer-status">
            <i /> Built for better teamwork
          </span>
        </div>

        {user ? (
          <>
            <div className="footer-link-column">
              <span className="footer-column-title">YOUR WORKSPACE</span>
              <Link to="/dashboard">Overview <ArrowUpRight size={13} /></Link>
              <Link to="/projects"><FolderKanban size={14} /> Projects</Link>
              <Link to="/notes">Shared notes</Link>
            </div>
            <div className="footer-link-column">
              <span className="footer-column-title">STAY CONNECTED</span>
              <Link to="/team">Your team</Link>
              <Link to="/chat"><MessageCircle size={14} /> Team chat</Link>
              <Link to="/activity">Recent activity</Link>
            </div>
          </>
        ) : (
          <>
            <div className="footer-link-column">
              <span className="footer-column-title">GET STARTED</span>
              <Link to="/login">Log in <ArrowUpRight size={13} /></Link>
              <Link to="/register">Create your account</Link>
            </div>
            <div className="footer-link-column footer-footer-note">
              <span className="footer-column-title">A LITTLE MORE FOCUS</span>
              <p>Less chasing updates. More making progress.</p>
            </div>
          </>
        )}
      </div>

      <div className="footer-bottom">
        <span>© {currentYear} CollabSphere</span>
        <span>Made for teams that <Heart size={13} fill="currentColor" /> build together</span>
        <Link to={user ? "/dashboard" : "/login"}>Back to your workspace ↑</Link>
      </div>
    </footer>
  );
}
