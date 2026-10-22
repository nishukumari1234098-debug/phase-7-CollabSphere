
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Plus,
  Users,
  X,
  Copy,
  Globe,
  LockKeyhole,
  Compass,
  CircleCheck,
  MessageCircle,
} from "lucide-react";
import projectService from "../services/projectService";
import { useAuth } from "../context/AuthContext";
import PageGuide from "../components/PageGuide";
import "./Projects.css";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const publicProjectCount = projects.filter((project) => project.isPublic).length;
  const privateProjectCount = projects.length - publicProjectCount;
  const sharedMemberCount = projects.reduce(
    (total, project) => total + (project.members || []).length,
    0,
  );

  async function loadProjects() {
    try {
      const data = await projectService.getProjects();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Projects load nahi hue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await projectService.creatProject({
        name: name.trim(),
        description: description.trim(),
      });

      setName("");
      setDescription("");
      setShowForm(false);
      setSuccess("Project successfully created!");
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Project create nahi hua.");
    }
  }

  async function handleVisibility(project) {
    const nextValue = !project.isPublic;
    setSavingId(project._id);
    setError("");
    setSuccess("");

    try {
      await projectService.setPublic(project._id, nextValue);

      setProjects((current) =>
        current.map((item) =>
          item._id === project._id
            ? { ...item, isPublic: nextValue }
            : item
        )
      );

      setSuccess(
        nextValue
          ? "Project public ho gaya. Ab share link copy kar sakti ho."
          : "Project private kar diya gaya."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Sharing setting update nahi hui."
      );
    } finally {
      setSavingId("");
    }
  }

  async function handleCopyLink(project) {
    const shareLink =
      `${window.location.origin}/public/projects/${project._id}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      setError("");
      setSuccess("Public project link copied!");
    } catch {
      window.prompt("Is link ko copy karo:", shareLink);
    }
  }

  return (
    <main className="projects-page">
      <header className="projects-header">
        <div>
          <span className="eyebrow">WORKSPACE</span>
          <h1>My Projects</h1>
          <p>Apne projects aur team collaboration ko manage karo.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} /> New Project
        </button>
      </header>

      {error && <div className="project-alert error-alert">{error}</div>}
      {success && <div className="project-alert success-alert">{success}</div>}

      <section className="project-summary">
        <div className="summary-icon">
          <FolderKanban size={23} />
        </div>
        <div>
          <span>Total Projects</span>
          <strong>{projects.length}</strong>
        </div>
      </section>

      <section className="page-insights project-insights">
        <article>
          <span className="page-insight-icon"><Globe size={17} /></span>
          <span><strong>{publicProjectCount}</strong><small>Public projects</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><LockKeyhole size={17} /></span>
          <span><strong>{privateProjectCount}</strong><small>Private projects</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><Users size={17} /></span>
          <span><strong>{sharedMemberCount}</strong><small>Member spots</small></span>
        </article>
        <p>Keep your project space focused: invite collaborators, share updates, and make progress together.</p>
      </section>

      <PageGuide
        variant="projects"
        icon={FolderKanban}
        title="Give every good idea a home."
        description="A short description helps teammates understand the goal before they jump into a project."
        note="Keep private work private; share publicly only when it is ready."
      />

      <section className="projects-workflow">
        <div className="projects-workflow-heading">
          <div>
            <span className="eyebrow">A SIMPLE PROJECT RHYTHM</span>
            <h2>From first idea to shared progress</h2>
          </div>
          <p>Give the team a clear starting point and a natural way to keep momentum.</p>
        </div>
        <div className="projects-workflow-grid">
          <article>
            <span className="projects-workflow-number">01</span>
            <Compass size={20} />
            <h3>Set the direction</h3>
            <p>Write a short project description so everyone knows what success looks like.</p>
          </article>
          <article>
            <span className="projects-workflow-number">02</span>
            <Users size={20} />
            <h3>Bring in the right people</h3>
            <p>Invite the teammates who need to contribute, review, or stay informed.</p>
          </article>
          <article>
            <span className="projects-workflow-number">03</span>
            <MessageCircle size={20} />
            <h3>Keep progress visible</h3>
            <p>Use notes, files, and activity updates to keep project context together.</p>
          </article>
        </div>
        <div className="projects-workflow-foot">
          <CircleCheck size={17} />
          <span>Tip: review visibility before sharing a public project link.</span>
        </div>
      </section>

      {showForm && (
        <div className="project-modal-backdrop">
          <form className="project-form" onSubmit={handleCreate}>
            <div className="form-heading">
              <h2>Create a project</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <label>Project name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. CollabSphere Website"
              required
              maxLength={100}
            />

            <label>Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project about?"
              rows={4}
            />

            <button className="primary-button" type="submit">
              Create Project
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <section className="empty-projects">
          <div className="empty-icon"><FolderKanban size={30} /></div>
          <h2>Abhi koi project nahi hai</h2>
          <p>Apna pehla project create karne ke liye button par click karo.</p>
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} /> Create your first project
          </button>
        </section>
      ) : (
        <section className="projects-grid">
          {projects.map((project) => {
            const ownerId = String(
              project.owner?._id || project.owner || ""
            );
            const userId = String(user?._id || user?.id || "");
            const isOwner = ownerId === userId;

            return (
              <article className="project-card" key={project._id}>
                <div className="project-card-top">
                  <div className="project-card-icon">
                    <FolderKanban size={23} />
                  </div>
                  <span className={isOwner ? "role-badge owner-badge" : "role-badge"}>
                    {isOwner ? "Owner" : "Member"}
                  </span>
                </div>

                <h2>{project.name}</h2>
                <p>{project.description || "No description added yet."}</p>

                <div className="project-card-bottom">
                  <span>
                    <Users size={16} /> {(project.members || []).length} members
                  </span>
                  <span>
                    {project.isPublic ? "Public" : "Private"}
                  </span>
                </div>

                {isOwner && (
                  <div className="project-sharing-actions">
                    <button
                      type="button"
                      className="project-share-toggle"
                      onClick={() => handleVisibility(project)}
                      disabled={savingId === project._id}
                    >
                      {project.isPublic
                        ? <LockKeyhole size={16} />
                        : <Globe size={16} />}
                      {savingId === project._id
                        ? "Updating..."
                        : project.isPublic
                          ? "Make Private"
                          : "Make Public"}
                    </button>

                    {project.isPublic && (
                      <button
                        type="button"
                        className="project-copy-link"
                        onClick={() => handleCopyLink(project)}
                      >
                        <Copy size={16} /> Copy Share Link
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
