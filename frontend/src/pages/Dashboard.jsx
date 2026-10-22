import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  FileText,
  Users,
  ArrowUpRight,
  Plus,
  Sparkles,
  Clock3,
  RefreshCw,
  CircleCheck,
  Activity,
  Download,
  MessageCircle,
  PieChart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageGuide from "../components/PageGuide";
import projectService from "../services/projectService";
import api from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [noteCount, setNoteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileCount, setFileCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [contributionCount, setContributionCount] = useState(0);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const result = await projectService.getProjects();
      const list = Array.isArray(result) ? result : result.projects || [];
      setProjects(list);

      const fileResults = await Promise.allSettled(
        list.map((project) => api.get(`/files/${project._id}`)),
      );

      const totalFiles = fileResults.reduce((sum, result) => {
        if (result.status !== "fulfilled") return sum;

        const data = result.value.data;
        const files = Array.isArray(data) ? data : data.files || [];

        return sum + files.length;
      }, 0);

      setFileCount(totalFiles);

      const activityResults = await Promise.allSettled(
        list.map((project) => api.get(`/activity/${project._id}`)),
      );

      const allActivities = activityResults
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value.data.activities || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRecentActivity(allActivities.slice(0, 5));
      const currentUserId = String(user?._id || user?.id || "");

      const myContributions = allActivities.filter((activity) => {
        const activityUserId = String(
          activity.user?._id || activity.user || "",
        );

        return activityUserId === currentUserId;
      });

      setContributionCount(myContributions.length);

      const noteResults = await Promise.allSettled(
        list.map((project) => api.get(`/notes/${project._id}`)),
      );

      const total = noteResults.reduce((sum, result) => {
        if (result.status !== "fulfilled") return sum;
        const data = result.value.data;
        const notes = Array.isArray(data) ? data : data.notes || [];
        return sum + notes.length;
      }, 0);

      setNoteCount(total);
    } catch (err) {
      setError(err.response?.data?.message || "Dashboard data load nahi hua.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const teamIds = new Set();
  projects.forEach((project) => {
    (project.members || []).forEach((member) => {
      teamIds.add(String(member?._id || member));
    });
  });

  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "blue",
      hint: "Projects you can access",
    },
    {
      label: "Total Files",
      value: fileCount,
      icon: Download,
      color: "blue",
      hint: "Files across your projects",
    },
    {
      label: "Total Notes",
      value: noteCount,
      icon: FileText,
      color: "green",
      hint: "Notes across your projects",
    },
    {
      label: "Contributions",
      value: contributionCount,
      icon: Activity,
      color: "green",
      hint: "Recorded project activities",
    },
  ];

  return (
    <main className="dashboard-page">
      <section className="dashboard-welcome">
        <div className="welcome-copy">
          <span className="dashboard-eyebrow">
            <Sparkles size={14} /> YOUR WORKSPACE
          </span>
          <h1>
            Hey, {firstName}! <span>👋</span>
          </h1>
          <p>Plan your work, share ideas, and make progress together.</p>
          <div className="welcome-actions">
            <Link
              className="dashboard-button dashboard-button-light"
              to="/projects"
            >
              <Plus size={17} /> New Project
            </Link>
            <Link
              className="dashboard-button dashboard-button-outline"
              to="/notes"
            >
              <FileText size={17} /> Open Notes
            </Link>
          </div>
        </div>

        <div className="welcome-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-card art-card-back">
            <Users size={25} />
          </div>
          <div className="art-card art-card-front">
            <FolderKanban size={34} />
          </div>
          <div className="art-sparkle">
            <Sparkles size={22} />
          </div>
        </div>
      </section>

      <PageGuide
        variant="dashboard"
        icon={CircleCheck}
        title="Small steps make shared goals feel closer."
        description="Start with one clear next step, then keep the notes and files your team needs close to the project."
        note="A little progress, shared often, adds up."
      />

      {error && (
        <div className="dashboard-alert">
          {error}
          <button onClick={loadDashboard}>Try again</button>
        </div>
      )}

      <div className="dashboard-section-heading">
        <div>
          <h2>Your overview</h2>
          <p>Here’s what’s happening in your workspace.</p>
        </div>
        <button
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
          title="Refresh dashboard"
        >
          <RefreshCw size={17} /> Refresh
        </button>
      </div>

      <section className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="dashboard-stat-card" key={stat.label}>
              <div className={`dashboard-stat-icon ${stat.color}`}>
                <Icon size={22} />
              </div>
              <div className="dashboard-stat-top">
                <span>{stat.label}</span>
                <ArrowUpRight size={17} />
              </div>
              <strong>{loading ? "—" : stat.value}</strong>
              <p>{stat.hint}</p>
            </article>
          );
        })}
      </section>

      <section className="dashboard-pulse">
        <div className="pulse-heading">
          <span className="pulse-indicator" />
          <span><strong>Workspace pulse</strong><small>A quick look at your collaboration space</small></span>
        </div>
        <div className="pulse-metric">
          <Users size={17} /><span>{teamIds.size}</span><small>collaborators</small>
        </div>
        <div className="pulse-metric">
          <FolderKanban size={17} /><span>{projects.filter((project) => project.isPublic).length}</span><small>shared projects</small>
        </div>
        <Link to="/activity" className="pulse-link">Explore activity <ArrowUpRight size={15} /></Link>
      </section>

      <section className="dashboard-focus-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Workspace focus mix</h2>
            <p>A visual example of how teams can balance shared work.</p>
          </div>
          <span className="dashboard-chart-badge"><PieChart size={15} /> SAMPLE VIEW</span>
        </div>
        <div className="dashboard-focus-content">
          <div className="dashboard-donut" role="img" aria-label="Illustrative focus mix: projects 42%, notes 28%, files 18%, and conversations 12%">
            <div>
              <strong>Focus</strong>
              <span>at a glance</span>
            </div>
          </div>
          <div className="dashboard-focus-legend">
            <div><i className="focus-projects" /><span>Projects</span><strong>42%</strong></div>
            <div><i className="focus-notes" /><span>Notes</span><strong>28%</strong></div>
            <div><i className="focus-files" /><span>Files</span><strong>18%</strong></div>
            <div><i className="focus-chat" /><span>Conversations</span><strong>12%</strong></div>
            <p>Illustrative sample only—not account analytics.</p>
          </div>
        </div>
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-projects-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Recent projects</h2>
              <p>Pick up where you left off.</p>
            </div>
            <Link to="/projects" className="dashboard-text-link">
              View all <ArrowUpRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              <Clock3 size={23} /> Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="dashboard-empty">
              <FolderKanban size={27} />
              <h3>Your workspace starts here</h3>
              <p>Create your first project to get started.</p>
              <Link to="/projects" className="dashboard-inline-link">
                Create a project <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="dashboard-project-list">
              {projects.slice(0, 4).map((project) => {
                const ownerId = String(
                  project.owner?._id || project.owner || "",
                );
                const userId = String(user?._id || user?.id || "");
                const isOwner = ownerId === userId;

                return (
                  <article className="dashboard-project-row" key={project._id}>
                    <div className="dashboard-project-icon">
                      <FolderKanban size={21} />
                    </div>
                    <div className="dashboard-project-info">
                      <strong>{project.name}</strong>
                      <span>
                        <Users size={14} /> {(project.members || []).length}{" "}
                        members
                      </span>
                    </div>
                    <span
                      className={`dashboard-project-role ${isOwner ? "is-owner" : ""}`}
                    >
                      {isOwner ? "Owner" : "Member"}
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="dashboard-quick-panel">
          <div className="dashboard-panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Jump straight into your work.</p>
            </div>
          </div>

          <Link to="/projects" className="dashboard-quick-action">
            <span className="quick-action-icon quick-purple">
              <Plus size={20} />
            </span>
            <span>
              <strong>Create a project</strong>
              <small>Start something new</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>

          <Link to="/notes" className="dashboard-quick-action">
            <span className="quick-action-icon quick-blue">
              <FileText size={20} />
            </span>
            <span>
              <strong>Write a note</strong>
              <small>Save your ideas</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>

          <Link to="/team" className="dashboard-quick-action">
            <span className="quick-action-icon quick-green">
              <Users size={20} />
            </span>
            <span>
              <strong>View your team</strong>
              <small>Meet your collaborators</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>

          <div className="dashboard-tip">
            <div className="tip-heading">
              <CircleCheck size={18} /> Collaboration tip
            </div>
            <p>
              Keep project notes updated so everyone on your team can stay on
              the same page.
            </p>
          </div>
        </aside>
      </section>

      <section className="dashboard-projects-panel dashboard-activity-panel">
        <div className="dashboard-panel-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest updates from your projects.</p>
          </div>
          <Link to="/activity" className="dashboard-text-link">
            View activity <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p>Loading activity...</p>
        ) : recentActivity.length === 0 ? (
          <div className="dashboard-empty">
            <Activity size={25} />
            <p>No recent activity yet.</p>
          </div>
        ) : (
          <div className="dashboard-project-list">
            {recentActivity.map((item) => (
              <article className="dashboard-project-row" key={item._id}>
                <div className="dashboard-project-icon">
                  <Activity size={20} />
                </div>
                <div className="dashboard-project-info">
                  <strong>
                    {item.user?.name || "Team member"} {item.action}
                  </strong>
                  <span>{item.details}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-guidelines">
        <div className="dashboard-panel-heading">
          <div>
            <h2>A smoother team rhythm</h2>
            <p>Three small habits that help shared work stay clear.</p>
          </div>
          <span className="dashboard-guidelines-label">WORKSPACE NOTES</span>
        </div>
        <div className="dashboard-guideline-grid">
          <article className="dashboard-guideline">
            <span className="dashboard-guideline-icon"><CircleCheck size={18} /></span>
            <div>
              <strong>Choose the next step</strong>
              <p>Give each project one clear action to keep momentum visible.</p>
            </div>
          </article>
          <article className="dashboard-guideline">
            <span className="dashboard-guideline-icon"><MessageCircle size={18} /></span>
            <div>
              <strong>Keep decisions in context</strong>
              <p>Capture useful discussions alongside the work they relate to.</p>
            </div>
          </article>
          <article className="dashboard-guideline">
            <span className="dashboard-guideline-icon"><FileText size={18} /></span>
            <div>
              <strong>Share a brief update</strong>
              <p>A short note helps teammates pick up where you left off.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="dashboard-playbook">
        <div className="dashboard-panel-heading">
          <div>
            <h2>A tiny collaboration playbook</h2>
            <p>Simple prompts for clearer project handoffs.</p>
          </div>
          <span className="dashboard-guidelines-label">TEAM PLAYBOOK</span>
        </div>
        <div className="dashboard-playbook-grid">
          <article className="dashboard-playbook-card">
            <span className="dashboard-playbook-step">01</span>
            <FolderKanban size={19} />
            <h3>Before kickoff</h3>
            <p>Agree on the goal, choose an owner, and write down the first milestone.</p>
          </article>
          <article className="dashboard-playbook-card">
            <span className="dashboard-playbook-step">02</span>
            <FileText size={19} />
            <h3>While work is moving</h3>
            <p>Keep decisions and useful files close to the project they support.</p>
          </article>
          <article className="dashboard-playbook-card">
            <span className="dashboard-playbook-step">03</span>
            <MessageCircle size={19} />
            <h3>At handoff</h3>
            <p>Leave a short update with what changed, what is next, and any open questions.</p>
          </article>
        </div>
      </section>

      <footer className="dashboard-footer">
        <Sparkles size={15} /> Small steps, great teamwork. Keep building!
      </footer>
    </main>
  );
}
