
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FolderKanban, Globe, ArrowLeft, ShieldCheck, Users } from "lucide-react";
import projectService from "../services/projectService";
import PageGuide from "../components/PageGuide";
import "./PublicProject.css";

export default function PublicProject() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProject() {
      try {
        const data = await projectService.getPublicProject(id);
        if (active) setProject(data);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Project nahi mila, ya ab private hai."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <main className="public-project-page">Loading project...</main>;
  }

  if (error || !project) {
    return (
      <main className="public-project-page">
        <section className="public-project-card">
          <FolderKanban size={35} />
          <h1>Project unavailable</h1>
          <p>{error || "Ye project public nahi hai."}</p>
          <Link to="/login" className="public-project-back">
            <ArrowLeft size={16} /> Back to CollabSphere
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="public-project-page">
      <section className="public-project-card">
        <div className="public-project-icon">
          <FolderKanban size={30} />
        </div>

        <span className="public-project-badge">
          <Globe size={15} /> Public project
        </span>

        <h1>{project.name}</h1>
        <p className="public-project-description">
          {project.description || "No project description provided."}
        </p>

        <p className="public-project-date">
          Created{" "}
          {project.createdAt
            ? new Date(project.createdAt).toLocaleDateString()
            : "on CollabSphere"}
        </p>

        <div className="public-project-details">
          <span><ShieldCheck size={17} /> Shared publicly by its owner</span>
          <span><Users size={17} /> A CollabSphere collaboration space</span>
        </div>

        <PageGuide
          variant="public"
          icon={Globe}
          title="A shared window into the work."
          description="This public page gives visitors a simple introduction to the project without exposing private workspace details."
          note="Only projects made public by their owner appear here."
        />

        <Link to="/login" className="public-project-back">
          <ArrowLeft size={16} /> Open CollabSphere
        </Link>
      </section>
    </main>
  );
}
