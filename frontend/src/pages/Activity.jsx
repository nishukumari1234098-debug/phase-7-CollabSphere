import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity as ActivityIcon,
  FolderKanban,
  CircleCheck,
  FileText,
  Users,
} from "lucide-react";
import activityService from "../services/activityService";
import projectService from "../services/projectService";
import PageGuide from "../components/PageGuide";
import "./Activity.css";

export default function Activity() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [activities, setActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedProjectName =
    projects.find((project) => project._id === selectedProject)?.name ||
    "Choose a project";

  async function refreshActivity() {
    if (!selectedProject) return;

    setRefreshing(true);
    setError("");

    try {
      const result = await activityService.getProjectActivity(selectedProject);
      setActivities(result);
    } catch (error) {
      console.error("Refresh activity error:", error);
      setError("Could not refresh activity.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function loadProjects() {
      try {
        const result = await projectService.getProjects();
        setProjects(result);
      } catch (error) {
        console.error("Load projects error:", error);
        setError("Could not load projects.");
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setActivities([]);
      return;
    }

    let active = true;

    async function loadActivity() {
      setLoading(true);
      setError("");

      try {
        const result =
          await activityService.getProjectActivity(selectedProject);

        if (active) setActivities(result);
      } catch (error) {
        console.error("Load activity error:", error);
        if (active) setError("Could not load project activity.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadActivity();

    return () => {
      active = false;
    };
  }, [selectedProject]);

  return (
    <main className="activity-page">
      <header className="activity-header">
        <div>
          <span className="page-kicker">TEAM TIMELINE</span>
          <h1>Project Activity</h1>
          <p>Every update, contribution and milestone in one shared feed.</p>
        </div>
        <div className="activity-header-actions">
          <button onClick={() => navigate("/dashboard")}>← Dashboard</button>
          <button
            onClick={refreshActivity}
            disabled={!selectedProject || refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh Activity"}
          </button>
        </div>
      </header>

      <div className="activity-filter">
        <label htmlFor="activity-project">Showing activity for</label>
        <select
          id="activity-project"
          value={selectedProject}
          onChange={(event) => setSelectedProject(event.target.value)}
        >
          <option value="">Select a project</option>

          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <section className="page-insights activity-insights">
        <article>
          <span className="page-insight-icon"><ActivityIcon size={17} /></span>
          <span><strong>{loading ? "—" : activities.length}</strong><small>Recent updates</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><FolderKanban size={17} /></span>
          <span><strong>{selectedProjectName}</strong><small>Selected project</small></span>
        </article>
        <p>Stay in the loop as teammates update shared project resources.</p>
      </section>

      <PageGuide
        variant="activity"
        icon={ActivityIcon}
        title="A little context makes every update useful."
        description="The timeline brings project changes together, making it easier to catch up and see what moved forward."
        note="Choose a project to see its activity."
      />

      <section className="activity-reading-guide">
        <div>
          <span className="page-kicker">READING THE TIMELINE</span>
          <h2>Catch up without losing context</h2>
          <p>Use the project filter to focus on one stream of work, then follow the details back to the update.</p>
        </div>
        <div className="activity-reading-points">
          <span><CircleCheck size={16} /> Scan what changed</span>
          <span><Users size={16} /> See who moved it forward</span>
          <span><FileText size={16} /> Open the related project notes</span>
        </div>
      </section>

      {loading && <p>Loading activity...</p>}
      {error && <p className="activity-error">{error}</p>}

      {!loading && selectedProject && activities.length === 0 && !error && (
        <p className="activity-empty">
          No activity yet. Create a note or upload a file first.
        </p>
      )}

      {!loading && activities.length > 0 && (
        <section className="activity-feed">
          <div className="activity-feed-heading">
            <div>
              <span className="page-kicker">THE LATEST</span>
              <h2>Team updates</h2>
            </div>
            <span>{activities.length} update{activities.length === 1 ? "" : "s"}</span>
          </div>
          <div className="activity-list">
            {activities.map((item) => (
              <article className="activity-card" key={item._id}>
                <h3>
                  {item.user?.name || "Team member"} {item.action}
                </h3>

                <p>{item.details}</p>

                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
