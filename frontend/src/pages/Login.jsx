import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  FolderKanban,
  MessageCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  
async function handleSubmit(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const data = await login({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (!data?.token) {
      throw new Error("Login response mein token nahi mila.");
    }

    navigate("/dashboard");
  } catch (err) {
    console.error("Login error:", err.response?.data || err);
    setError(
      err.response?.data?.message ||
      err.message ||
      "Login failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="auth-page">
      <aside className="auth-showcase">
        <div className="auth-showcase-copy">
          <span className="auth-showcase-kicker">
            <span /> YOUR TEAM, IN SYNC
          </span>
          <h2>
            Big ideas work
            <br />
            better <span>together.</span>
          </h2>
          <p>
            Bring projects, people and plans into one beautifully organized
            workspace.
          </p>

          <div className="auth-feature-grid">
            <article className="auth-feature-card">
              <span className="auth-feature-icon"><FolderKanban size={17} /></span>
              <strong>Projects</strong>
              <small>Keep shared work moving</small>
            </article>
            <article className="auth-feature-card">
              <span className="auth-feature-icon"><Check size={17} /></span>
              <strong>Shared notes</strong>
              <small>Keep ideas in context</small>
            </article>
            <article className="auth-feature-card">
              <span className="auth-feature-icon"><Users size={17} /></span>
              <strong>Team space</strong>
              <small>Stay in sync together</small>
            </article>
          </div>
        </div>

        <div className="auth-preview" aria-hidden="true">
          <div className="auth-preview-top">
            <span className="auth-preview-dot" />
            <span>SAMPLE WORKSPACE</span>
            <span className="auth-preview-online">PROJECT SNAPSHOT</span>
          </div>
          <div className="auth-preview-title">
            <div className="auth-preview-project-icon">
              <FolderKanban size={19} />
            </div>
            <div>
              <strong>Website redesign</strong>
              <span>Product team · 6 members</span>
            </div>
            <ArrowUpRight size={18} />
          </div>
          <div className="auth-preview-progress">
            <div><span>Project progress</span><strong>78%</strong></div>
            <span className="auth-preview-track"><span /></span>
          </div>
          <div className="auth-preview-bottom">
            <div className="auth-preview-avatars">
              <span>J</span><span>M</span><span>A</span><span>+3</span>
            </div>
            <span className="auth-preview-message">
              <MessageCircle size={15} /> Ideas in one shared space
            </span>
          </div>
        </div>

        <p className="auth-showcase-footnote">
          A calmer way to do great work.
        </p>
      </aside>

      <section className="auth-card">
        <div className="auth-form-brand">
          <div className="auth-logo">
            <Users size={25} />
          </div>
          <span>Welcome back</span>
        </div>
        <h1>Let’s get you in.</h1>
        <p className="auth-subtitle">
          Sign in to pick up where your team left off.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email address</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <div className="password-field">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
