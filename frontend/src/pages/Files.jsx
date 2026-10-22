import { useEffect, useState } from "react";
import {
  Upload,
  Download,
  FileText,
  RefreshCw,
  Eye,
  X,
  FileImage,
  File as FileIcon,
  Trash2,
  FolderKanban,
  ShieldCheck,
  ScanEye,
  FolderOpen,
} from "lucide-react";
import api from "../services/api";
import projectService from "../services/projectService";
import PageGuide from "../components/PageGuide";
import "./Files.css";

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Files() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const selectedProject = projects.find((project) => project._id === projectId);
  const totalFileSize = files.reduce((total, file) => total + (file.size || 0), 0);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await projectService.getProjects();
        const list = Array.isArray(data) ? data : data.projects || [];
        setProjects(list);
        setProjectId((current) =>
          list.some((p) => p._id === current) ? current : list[0]?._id || "",
        );
      } catch {
        setError("Projects load nahi ho paaye.");
      }
    }

    loadProjects();
  }, []);

  async function loadFiles(id = projectId) {
    if (!id) {
      setFiles([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/files/${id}`);
      setFiles(response.data.files || []);
    } catch (err) {
      setError(err.response?.data?.message || "Files load nahi ho paayi.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles(projectId);
  }, [projectId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleUpload(event) {
    event.preventDefault();

    if (!projectId || !selectedFile) {
      setError("Project aur file dono select karo.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File maximum 5 MB ki honi chahiye.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(`/files/${projectId}`, formData);
      setMessage(response.data.message || "File uploaded successfully!");
      setSelectedFile(null);
      event.target.reset();
      await loadFiles(projectId);
    } catch (err) {
      setError(err.response?.data?.message || "File upload nahi ho paayi.");
    } finally {
      setUploading(false);
    }
  }

  async function getFileBlob(file) {
    const response = await api.get(`/files/${projectId}/${file._id}/download`, {
      responseType: "blob",
    });
    return response.data;
  }

  async function handleDownload(file) {
    try {
      setError("");
      const blob = await getFileBlob(file);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "File download nahi ho paayi.");
    }
  }

  async function handleDelete(file) {
    const confirmed = window.confirm(
      `Delete "${file.originalName}" permanently?`,
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/files/${projectId}/${file._id}`);

      if (previewFile?._id === file._id) {
        closePreview();
      }

      setFiles((current) => current.filter((item) => item._id !== file._id));

      setMessage("File deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "File delete nahi ho paayi.");
    }
  }

  async function handlePreview(file) {
    setPreviewFile(file);
    setPreviewUrl("");
    setPreviewText("");
    setError("");
    setPreviewLoading(true);

    try {
      const blob = await getFileBlob(file);
      const type = file.mimeType || blob.type || "";
      const url = URL.createObjectURL(blob);

      if (type.startsWith("image/") || type === "application/pdf") {
        setPreviewUrl(url);
      } else if (
        type.startsWith("text/") ||
        file.originalName?.toLowerCase().endsWith(".txt")
      ) {
        setPreviewText(await blob.text());
        URL.revokeObjectURL(url);
      } else {
        URL.revokeObjectURL(url);
        setError(
          "Is file type ka preview supported nahi hai. Download kar sakti ho.",
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Preview load nahi ho paaya.");
      setPreviewFile(null);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePreview() {
    setPreviewFile(null);
    setPreviewText("");
    setPreviewUrl("");
  }

  function getFileIcon(file) {
    if (file.mimeType?.startsWith("image/")) return <FileImage size={23} />;
    if (file.mimeType === "application/pdf") return <FileText size={23} />;
    return <FileIcon size={23} />;
  }

  return (
    <main className="files-page">
      <section className="files-heading">
        <div>
          <p className="files-eyebrow">COLLABORATION SPACE</p>
          <h1>File Sharing</h1>
          <p>Project files upload, preview aur download karo.</p>
        </div>
        <div className="files-heading-icon">
          <FileText size={30} />
        </div>
      </section>

      <section className="page-insights files-insights">
        <article>
          <span className="page-insight-icon"><FileText size={17} /></span>
          <span><strong>{loading ? "—" : files.length}</strong><small>Shared files</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><Download size={17} /></span>
          <span><strong>{formatSize(totalFileSize)}</strong><small>Space in this project</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><FolderKanban size={17} /></span>
          <span><strong>{selectedProject?.name || "No project"}</strong><small>Current collection</small></span>
        </article>
        <p>Share project-ready PDFs, images and notes. Preview files before downloading them.</p>
      </section>

      <PageGuide
        variant="files"
        icon={FileText}
        title="Keep the useful things close to the work."
        description="Share references, approved visuals, and lightweight documents in the project where your team needs them."
        note="Supported uploads: PDF, JPG, PNG, and TXT up to 5 MB."
      />

      <section className="files-workflow">
        <div className="files-workflow-heading">
          <div>
            <span className="files-eyebrow">SHARED FILES, MADE SIMPLE</span>
            <h2>A tidy home for project resources</h2>
          </div>
          <p>Keep useful references easy to find and straightforward to review.</p>
        </div>
        <div className="files-workflow-grid">
          <article>
            <span><FolderOpen size={18} /></span>
            <strong>Choose the right project</strong>
            <p>Store each resource with the project where your team will use it.</p>
          </article>
          <article>
            <span><ScanEye size={18} /></span>
            <strong>Preview before sharing</strong>
            <p>Check the file and its contents before teammates download it.</p>
          </article>
          <article>
            <span><ShieldCheck size={18} /></span>
            <strong>Keep names clear</strong>
            <p>Descriptive filenames help the team recognize the latest useful version.</p>
          </article>
        </div>
        <div className="files-capacity-note">
          <Upload size={17} />
          <span>Upload guidance</span>
          <p>PDF, JPG, PNG, or TXT files up to 5 MB are supported.</p>
        </div>
      </section>

      <section className="files-panel">
        <label htmlFor="file-project">Select Project</label>
        <select
          id="file-project"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setMessage("");
            setError("");
          }}
        >
          <option value="">Choose a project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>

        <form className="file-upload-form" onSubmit={handleUpload}>
          <label htmlFor="file-input">Choose a file</label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.txt"
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] || null)
            }
          />
          <p className="file-hint">PDF, JPG, PNG, TXT · Maximum size 5 MB</p>
          {selectedFile && (
            <p className="file-hint">
              Selected: {selectedFile.name} ({formatSize(selectedFile.size)})
            </p>
          )}
          <button
            type="submit"
            disabled={!projectId || !selectedFile || uploading}
          >
            <Upload size={17} />
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </section>

      {error && <p className="files-alert files-error">{error}</p>}
      {message && <p className="files-alert files-success">{message}</p>}

      <section className="files-list-section">
        <div className="files-list-heading">
          <div>
            <h2>Shared Files</h2>
            <p>
              {files.length} file{files.length === 1 ? "" : "s"} in this project
            </p>
          </div>
          <button
            type="button"
            className="files-refresh"
            onClick={() => loadFiles()}
            disabled={!projectId || loading}
            aria-label="Refresh files"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {!projectId ? (
          <div className="files-empty">
            Pehle ek project create ya join karo.
          </div>
        ) : loading ? (
          <div className="files-empty">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="files-empty">
            <FileText size={32} />
            <h3>No files yet</h3>
            <p>Is project ki first file upload karo.</p>
          </div>
        ) : (
          <div className="shared-files-list">
            {files.map((file) => (
              <article className="shared-file-card" key={file._id}>
                <div className="shared-file-icon">{getFileIcon(file)}</div>
                <div className="shared-file-info">
                  <h3>{file.originalName}</h3>
                  <p>
                    {formatSize(file.size)} ·{" "}
                    {file.uploadedBy?.name || "Team member"} ·{" "}
                    {file.createdAt
                      ? new Date(file.createdAt).toLocaleDateString()
                      : "Recently uploaded"}
                  </p>
                </div>
                <div className="file-card-actions">
                  <button
                    type="button"
                    className="file-preview-button"
                    onClick={() => handlePreview(file)}
                    aria-label={`Preview ${file.originalName}`}
                  >
                    <Eye size={17} />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    className="file-download-button"
                    onClick={() => handleDownload(file)}
                    aria-label={`Download ${file.originalName}`}
                  >
                    <Download size={17} />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    className="file-delete-button"
                    onClick={() => handleDelete(file)}
                    aria-label={`Delete ${file.originalName}`}
                  >
                    <Trash2 size={17} />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {previewFile && (
        <div className="file-preview-backdrop" onClick={closePreview}>
          <section
            className="file-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Preview ${previewFile.originalName}`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="file-preview-header">
              <div>
                <h2>{previewFile.originalName}</h2>
                <p>{formatSize(previewFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={closePreview}
                aria-label="Close preview"
              >
                <X size={22} />
              </button>
            </header>

            <div className="file-preview-body">
              {previewLoading ? (
                <p>Loading preview...</p>
              ) : previewUrl && previewFile.mimeType === "application/pdf" ? (
                <iframe title={previewFile.originalName} src={previewUrl} />
              ) : previewUrl && previewFile.mimeType?.startsWith("image/") ? (
                <img src={previewUrl} alt={previewFile.originalName} />
              ) : previewText ? (
                <pre>{previewText}</pre>
              ) : (
                <p>Preview available nahi hai. File download karke dekho.</p>
              )}
            </div>

            <footer className="file-preview-footer">
              <button
                type="button"
                className="file-download-button"
                onClick={() => handleDownload(previewFile)}
              >
                <Download size={17} /> Download file
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

export default Files;
