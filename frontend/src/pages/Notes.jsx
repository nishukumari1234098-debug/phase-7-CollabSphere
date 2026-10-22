
import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, X, FileText, Eye, Edit3,
  Sparkles, BookOpen, Code2, FileCode, ListChecks, Highlighter, Share2
} from "lucide-react";
import projectService from "../services/projectService";
import api from "../services/api";
import PageGuide from "../components/PageGuide";
import "./Notes.css";

export default function Notes() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const selectedProject = projects.find((project) => project._id === projectId);

  async function loadProjects() {
    try {
      const data = await projectService.getProjects();
      const list = Array.isArray(data) ? data : data.projects || [];
      setProjects(list);
      setProjectId((current) =>
        list.some((p) => p._id === current) ? current : list[0]?._id || ""
      );
    } catch (err) {
      setError(err.response?.data?.message || "Projects load nahi hue.");
    }
  }

  async function loadNotes(id = projectId) {
    if (!id) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/notes/${id}`);
      setNotes(Array.isArray(data) ? data : data.notes || []);
    } catch (err) {
      setError(err.response?.data?.message || "Notes load nahi hue.");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    loadNotes(projectId);
  }, [projectId]);

  function openCreateForm() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setAiResult("");
    setPreview(false);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(note) {
    setEditingId(note._id);
    setTitle(note.title || "");
    setContent(note.content || "");
    setAiResult("");
    setPreview(false);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!projectId) {
      setError("Pehle project select karo.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const noteData = { title: title.trim(), content: content.trim() };

      if (editingId) {
        await api.put(`/notes/${projectId}/${editingId}`, noteData);
        setSuccess("Note update ho gaya!");
      } else {
        await api.post(`/notes/${projectId}`, noteData);
        setSuccess("Note create ho gaya!");
      }

      setShowForm(false);
      setEditingId(null);
      await loadNotes(projectId);
    } catch (err) {
      setError(err.response?.data?.message || "Note save nahi ho paaya.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId) {
    if (!window.confirm("Kya tum ye note delete karna chahti ho?")) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/notes/${projectId}/${noteId}`);
      setNotes((current) => current.filter((note) => note._id !== noteId));
      setSuccess("Note delete ho gaya.");
    } catch (err) {
      setError(err.response?.data?.message || "Note delete nahi ho paaya.");
    }
  }

  async function runAI(action) {
    if (!content.trim()) {
      setError("Pehle note mein code ya content likho.");
      return;
    }

    setAiLoading(action);
    setError("");
    setAiResult("");

    try {
      const endpoint = {
        explain: "/gemini/explain",
        docs: "/gemini/docs",
        readme: "/gemini/readme",
      }[action];

      const payload =
        action === "readme"
          ? {
              projectName: title.trim() || "My Project",
              description: content,
              code: content,
            }
          : { code: content };

      const { data } = await api.post(endpoint, payload);
      setAiResult(data.result || "AI ne koi result return nahi kiya.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gemini request fail hui. API key aur backend check karo."
      );
    } finally {
      setAiLoading("");
    }
  }

  function renderMarkdown(text) {
    return text.split("\n").map((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("### ")) {
        return <h3 key={index}>{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={index}>{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith("# ")) {
        return <h1 key={index}>{trimmed.slice(2)}</h1>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <p key={index}>• {trimmed.slice(2)}</p>;
      }
      if (trimmed.startsWith("```")) {
        return <p key={index}>──────── Code block ────────</p>;
      }
      if (!trimmed) return <div key={index} className="markdown-space" />;
      return <p key={index}>{line}</p>;
    });
  }

  return (
    <main className="notes-page">
      <header className="notes-header">
        <div>
          <span className="notes-eyebrow">WORKSPACE</span>
          <h1>Project Notes</h1>
          <p>Notes likho, Markdown preview dekho aur Gemini AI use karo.</p>
        </div>

        <button
          className="notes-primary-button"
          onClick={openCreateForm}
          disabled={!projectId}
        >
          <Plus size={18} /> New Note
        </button>
      </header>

      {error && <div className="notes-alert notes-error">{error}</div>}
      {success && <div className="notes-alert notes-success">{success}</div>}

      {projects.length > 0 && (
        <div className="notes-project-select">
          <label htmlFor="notes-project">Choose project</label>
          <select
            id="notes-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <section className="page-insights notes-insights">
        <article>
          <span className="page-insight-icon"><FileText size={17} /></span>
          <span><strong>{loading ? "—" : notes.length}</strong><small>Notes in this space</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><BookOpen size={17} /></span>
          <span><strong>{selectedProject?.name || "Choose a project"}</strong><small>Selected project</small></span>
        </article>
        <p>Capture decisions, document ideas, and turn your notes into shareable project knowledge.</p>
      </section>

      <PageGuide
        variant="notes"
        icon={BookOpen}
        title="Catch the idea while it is fresh."
        description="Meeting takeaways, decisions, and helpful snippets are easier to find when they live beside the project."
        note="Use a clear title so teammates can scan and find notes later."
      />

      <section className="notes-craft-panel">
        <div className="notes-craft-heading">
          <div>
            <span className="notes-eyebrow">A BETTER NOTE, IN THREE PARTS</span>
            <h2>Make shared knowledge easy to use</h2>
            <p>A lightweight structure makes notes quicker to scan and easier to revisit.</p>
          </div>
          <span className="notes-craft-mark"><BookOpen size={20} /></span>
        </div>
        <div className="notes-craft-grid">
          <article>
            <span><Highlighter size={17} /></span>
            <strong>Lead with the takeaway</strong>
            <p>Use a specific title and put the main decision or idea first.</p>
          </article>
          <article>
            <span><ListChecks size={17} /></span>
            <strong>Break up the details</strong>
            <p>Headings and short lists help teammates find the part they need.</p>
          </article>
          <article>
            <span><Share2 size={17} /></span>
            <strong>Keep it connected</strong>
            <p>Choose the project that gives this note the right context.</p>
          </article>
        </div>
        <div className="notes-format-strip">
          <code># Decision</code>
          <code>## Next steps</code>
          <code>- Owner</code>
          <span>Markdown-friendly outline</span>
        </div>
      </section>

      {showForm && (
        <div className="notes-modal-backdrop">
          <form className="notes-form notes-editor-form" onSubmit={handleSubmit}>
            <div className="notes-form-heading">
              <h2>{editingId ? "Edit note" : "Create note"}</h2>
              <button
                type="button"
                className="notes-close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Team meeting notes"
              required
              maxLength={150}
            />

            <div className="markdown-toolbar">
              <span><Edit3 size={16} /> Markdown Editor</span>
              <button
                type="button"
                onClick={() => setPreview((value) => !value)}
              >
                {preview ? <Edit3 size={16} /> : <Eye size={16} />}
                {preview ? "Edit" : "Preview"}
              </button>
            </div>

            {preview ? (
              <div className="markdown-preview">
                {content ? renderMarkdown(content) : "Preview yahan dikhega."}
              </div>
            ) : (
              <textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"# Heading\n\nWrite your notes here...\n\n- First point\n- Second point"}
                rows={9}
              />
            )}

            <div className="gemini-tools">
              <h3><Sparkles size={18} /> Gemini AI Assistant</h3>
              <p>Note ke content ya code par AI tools use karo.</p>

              <div className="gemini-actions">
                <button
                  type="button"
                  onClick={() => runAI("explain")}
                  disabled={!!aiLoading}
                >
                  <Code2 size={16} />
                  {aiLoading === "explain" ? "Working..." : "Explain"}
                </button>

                <button
                  type="button"
                  onClick={() => runAI("docs")}
                  disabled={!!aiLoading}
                >
                  <BookOpen size={16} />
                  {aiLoading === "docs" ? "Working..." : "Generate Docs"}
                </button>

                <button
                  type="button"
                  onClick={() => runAI("readme")}
                  disabled={!!aiLoading}
                >
                  <FileCode size={16} />
                  {aiLoading === "readme" ? "Working..." : "Generate README"}
                </button>
              </div>

              {aiResult && (
                <div className="gemini-result">
                  <h4>AI Result</h4>
                  <pre>{aiResult}</pre>
                  <button
                    type="button"
                    onClick={() => setContent((old) =>
                      old ? `${old}\n\n${aiResult}` : aiResult
                    )}
                  >
                    Add result to note
                  </button>
                </div>
              )}
            </div>

            <button
              className="notes-primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Note"}
            </button>
          </form>
        </div>
      )}

      {projects.length === 0 && !loading ? (
        <section className="notes-empty">
          <FileText size={34} />
          <h2>No projects yet</h2>
          <p>Create a project first, then you can add notes.</p>
        </section>
      ) : loading ? (
        <p className="notes-muted">Loading notes...</p>
      ) : notes.length === 0 ? (
        <section className="notes-empty">
          <FileText size={34} />
          <h2>No notes yet</h2>
          <p>Is project ke liye pehla note create karo.</p>
          <button className="notes-primary-button" onClick={openCreateForm}>
            <Plus size={18} /> Create your first note
          </button>
        </section>
      ) : (
        <section className="notes-grid">
          {notes.map((note) => (
            <article className="note-card" key={note._id}>
              <div className="note-card-icon"><FileText size={20} /></div>
              <h2>{note.title}</h2>
              <p className="note-content">{note.content || "No content added."}</p>

              <div className="note-card-footer">
                <span>
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString()
                    : "Recently added"}
                </span>
                <div className="note-actions">
                  <button
                    onClick={() => openEditForm(note)}
                    aria-label="Edit note"
                    title="Edit note"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    aria-label="Delete note"
                    title="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
