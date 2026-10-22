import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("REGISTER BUTTON CLICKED");
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/login", {
        state: { message: "Account created! Please sign in." },
      });
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Server response:", err.response?.data);

      setError(
        err.response?.data?.message || err.message || "Registration failed.",
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
            <span /> MAKE ROOM FOR GREAT WORK
          </span>
          <h2>
            Your next big
            <br />
            thing starts <span>here.</span>
          </h2>
          <p>
            Create a shared space for your people, your projects and all the
            ideas in between.
          </p>
          <div className="auth-feature-grid">
            <article className="auth-feature-card">
              <span className="auth-feature-icon"><FolderKanban size={17} /></span>
              <strong>Projects</strong>
              <small>Bring work into focus</small>
            </article>
            <article className="auth-feature-card">
              <span className="auth-feature-icon"><Sparkles size={17} /></span>
              <strong>Shared ideas</strong>
              <small>Turn plans into progress</small>
            </article>
            <article className="auth-feature-card">
              <span className="auth-feature-icon"><MessageCircle size={17} /></span>
              <strong>Team chat</strong>
              <small>Keep every voice close</small>
            </article>
          </div>
        </div>

        <div className="auth-preview auth-preview-register" aria-hidden="true">
          <div className="auth-preview-top">
            <span className="auth-preview-dot" />
            <span>WORKSPACE PREVIEW</span>
            <span className="auth-preview-online">A FRESH START</span>
          </div>
          <div className="auth-preview-title">
            <div className="auth-preview-project-icon">
              <FolderKanban size={19} />
            </div>
            <div>
              <strong>Ideas become projects</strong>
              <span>Plan it. Share it. Build it.</span>
            </div>
            <Sparkles size={18} />
          </div>
          <div className="auth-preview-progress">
            <div><span>Teamwork status</span><strong>Looking good</strong></div>
            <span className="auth-preview-track"><span /></span>
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
          <span>Get started</span>
        </div>
        <h1>Create your space.</h1>
        <p className="auth-subtitle">
          Set up your account and bring your team together.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full name</label>
          <input
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />

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
          <input
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <button className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
