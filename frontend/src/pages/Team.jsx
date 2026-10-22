import { useEffect, useState } from "react";
import {
  Mail,
  Crown,
  UserPlus,
  Users,
  RefreshCw,
  CircleCheck,
  MessageCircle,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import projectService from "../services/projectService";
import PageGuide from "../components/PageGuide";
import "./Team.css";

export default function Team() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProjects() {
    setError("");
    try {
      const data = await projectService.getProjects();
      const list = Array.isArray(data) ? data : data.projects || [];
      setProjects(list);

      setSelectedId((current) =>
        list.some((p) => p._id === current) ? current : list[0]?._id || "",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Projects not loaded");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const project = projects.find((p) => p._id === selectedId);

  const ownerId = String(project?.owner?._id || project?.owner || "");
  const currentUserId = String(user?._id || user?.id || "");
  const isOwner = ownerId === currentUserId;
  const members = project?.members || [];

  async function handleAddMember(e) {
    e.preventDefault();
    if (!project || !email.trim()) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const result = await projectService.addMember(project._id, email);
      setEmail("");
      setSuccess(result.message || "Member successfully added!");
      await loadProjects();
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        setError("Alread a member of this project");
      } else if (status === 404 && message === "User not found") {
        setError(
          "Is email se account nahi mila. Pehle user ko register karna hoga.",
        );
      } else if (status === 403) {
        setError("Sirf project owner hi members add kar sakta hai.");
      } else {
        setError(message || "member not added");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="team-page">Loading team...</main>;
  }

  return (
    <main className="team-page">
      <header className="team-header">
        <div>
          <span className="team-eyebrow">COLLABORATION</span>
          <h1>Team Members</h1>
          <p>Apne project ke owner aur team members ko yahan dekho.</p>
        </div>
        <button className="team-refresh" onClick={loadProjects}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {error && <div className="team-alert team-error">{error}</div>}
      {success && <div className="team-alert team-success">{success}</div>}

      <section className="page-insights team-insights">
        <article>
          <span className="page-insight-icon"><Users size={17} /></span>
          <span><strong>{project ? members.length : "—"}</strong><small>Member records</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><Crown size={17} /></span>
          <span><strong>{project ? (isOwner ? "You" : "Project owner") : "No project"}</strong><small>Ownership</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><UserPlus size={17} /></span>
          <span><strong>{projects.length}</strong><small>Team projects</small></span>
        </article>
        <p>Healthy collaboration starts with clear ownership and the right people in the room.</p>
      </section>

      <PageGuide
        variant="team"
        icon={Users}
        title="Good collaboration starts with context."
        description="Choose the right project and invite people who need to contribute to its shared work."
        note="Only project owners can add members."
      />

      <section className="team-principles">
        <div className="team-principles-heading">
          <div>
            <span className="team-eyebrow">TEAM PLAYBOOK</span>
            <h2>Make room for good collaboration</h2>
          </div>
          <p>Small shared habits make project work easier to follow.</p>
        </div>
        <div className="team-principles-grid">
          <article>
            <span className="team-principle-icon"><FolderKanban size={18} /></span>
            <strong>Invite with context</strong>
            <p>Share the project goal and where a teammate can make a difference.</p>
          </article>
          <article>
            <span className="team-principle-icon"><MessageCircle size={18} /></span>
            <strong>Keep decisions visible</strong>
            <p>Capture important choices near the project conversation and notes.</p>
          </article>
          <article>
            <span className="team-principle-icon"><CircleCheck size={18} /></span>
            <strong>Close the loop</strong>
            <p>Leave a quick update when a task is complete or ready for handoff.</p>
          </article>
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="team-empty">
          <Users size={35} />
          <h2>Abhi koi project nahi hai</h2>
          <p>
            Members manage karne se pehle Projects page par project create karo.
          </p>
        </section>
      ) : (
        <>
          <section className="team-project-select">
            <label htmlFor="team-project">Select project</label>
            <select
              id="team-project"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setError("");
                setSuccess("");
              }}
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </section>

          <section className="team-panel">
            <div className="team-panel-heading">
              <div className="team-panel-icon">
                <Users size={22} />
              </div>
              <div>
                <h2>{project?.name}</h2>
                <p>{members.length} member record(s), including the owner</p>
              </div>
            </div>

            <div className="team-list">
              <article className="team-person">
                <div className="team-avatar">
                  {(project?.owner?.name || "O").charAt(0).toUpperCase()}
                </div>
                <div className="team-person-info">
                  <strong>
                    {project?.owner?.name ||
                      (ownerId === currentUserId
                        ? user?.name
                        : "Project Owner")}
                    {ownerId === currentUserId ? " (You)" : ""}
                  </strong>
                  <span>{project?.owner?.email || "Owner account"}</span>
                </div>
                <span className="team-role owner-role">
                  <Crown size={14} /> Owner
                </span>
              </article>

              {members
                .filter((member) => {
                  const id = String(member?._id || member);
                  return id !== ownerId;
                })
                .map((member, index) => {
                  const memberId = String(member?._id || member);
                  const memberName = member?.name || "Team Member";
                  return (
                    <article className="team-person" key={memberId || index}>
                      <div className="team-avatar member-avatar">
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <div className="team-person-info">
                        <strong>{memberName}</strong>
                        <span>
                          {member?.email || "Member details unavailable"}
                        </span>
                      </div>
                      <span className="team-role">Member</span>
                    </article>
                  );
                })}
            </div>
          </section>

          {isOwner && (
            <section className="team-add-panel">
              <div className="team-add-icon">
                <UserPlus size={23} />
              </div>
              <h2>Add a team member</h2>
              <p>
                Member ka registered email enter karo. Unka CollabSphere account
                pehle se hona chahiye.
              </p>

              <form className="team-add-form" onSubmit={handleAddMember}>
                <div className="team-email-field">
                  <Mail size={18} />
                  <input
                    type="email"
                    placeholder="member@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button className="team-add-button" disabled={saving}>
                  {saving ? "Adding..." : "Add Member"}
                </button>
              </form>
            </section>
          )}

          {!isOwner && (
            <p className="team-owner-note">
              Only the project owner can add new members.
            </p>
          )}
        </>
      )}
    </main>
  );
}
