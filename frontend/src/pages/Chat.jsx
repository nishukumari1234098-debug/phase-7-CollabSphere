
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import PageGuide from "../components/PageGuide";
import {
  Send,
  MessageCircle,
  Users,
  Sparkles,
  CircleCheck,
} from "lucide-react";
import "./Chat.css";

const SOCKET_URL = "http://localhost:3000";

export default function Chat() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;

    api.get("/projects")
      .then(({ data }) => {
        if (!active) return;

        const list = Array.isArray(data)
          ? data
          : data.projects || [];

        setProjects(list);
      })
      .catch(() => {
        if (active) setError("Projects load nahi hue. Login check karo.");
      });

    return () => {
      active = false;
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!projectId) {
      setMessages([]);
      return;
    }

    let active = true;
    setMessages([]);
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Login token nahi mila. Dobara login karo.");
      setLoading(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("chat:join", projectId, (result) => {
        if (!active) return;

        if (!result?.ok) {
          setError(result?.message || "Chat join nahi ho paya.");
          setLoading(false);
          return;
        }

        setMessages(result.messages || []);
        setLoading(false);
      });
    });

    socket.on("connect_error", () => {
      if (active) {
        setError("Chat connection fail hua. Backend aur token check karo.");
        setLoading(false);
      }
    });

    const handleNewMessage = (message) => {
      if (!active) return;

      setMessages((previous) => {
        if (previous.some((item) => item._id === message._id)) {
          return previous;
        }
        return [...previous, message];
      });
    };

    socket.on("chat:new-message", handleNewMessage);

    return () => {
      active = false;
      socket.off("chat:new-message", handleNewMessage);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();

    const messageText = text.trim();
    if (!messageText || !projectId) return;

    try {
      setError("");

      const { data } = await api.post(
        `/chat/${projectId}/messages`,
        { text: messageText }
      );

      const savedMessage = data.chatMessage;

      if (savedMessage) {
        setMessages((previous) =>
          previous.some((item) => item._id === savedMessage._id)
            ? previous
            : [...previous, savedMessage]
        );
      }

      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Message send nahi hua.");
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const selectedProject = projects.find((project) => project._id === projectId);
  const chatMembers = selectedProject?.members?.length || 0;

  
return (
  <div className="chat-page">
    <header className="chat-header">
      <div className="chat-header-icon">
        <MessageCircle size={25} />
      </div>
      <div>
        <h1>Team Chat</h1>
        <p>Connect with your project team in real time.</p>
      </div>
    </header>

    <section className="page-insights chat-insights">
      <article>
        <span className="page-insight-icon"><MessageCircle size={17} /></span>
        <span><strong>{messages.length}</strong><small>Messages in this room</small></span>
      </article>
      <article>
        <span className="page-insight-icon"><Users size={17} /></span>
        <span><strong>{projectId ? chatMembers : "—"}</strong><small>Project collaborators</small></span>
      </article>
      <p>{selectedProject ? `You’re chatting in ${selectedProject.name}.` : "Select a project to open its team conversation."}</p>
    </section>

    <PageGuide
      variant="chat"
      icon={MessageCircle}
      title="Keep the conversation close to the project."
      description="Choose a project to talk through ideas, share quick updates, and keep decisions connected to the work."
      note="Your messages are shared with that project's team."
    />

    <div className="chat-workspace-layout">
    <section className="chat-card">
      <div className="chat-project-select">
        <label htmlFor="project-select">Select Project</label>
        <select
          id="project-select"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        >
          <option value="">Choose a project...</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-room-title">
        <Users size={18} />
        <span>
          {projects.find((project) => project._id === projectId)?.name ||
            "Project conversation"}
        </span>
      </div>

      <div className="chat-messages">
        {!projectId && (
          <p className="chat-empty">
            Chat start karne ke liye project select karo.
          </p>
        )}

        {loading && <p className="chat-empty">Loading messages...</p>}

        {projectId && !loading && messages.length === 0 && !error && (
          <p className="chat-empty">
            Abhi messages nahi hain. Conversation start karo!
          </p>
        )}

        {messages.map((message) => (
          <div className="chat-message" key={message._id}>
            <div className="chat-message-meta">
              <span className="chat-sender">
                {message.sender?.name ||
                  message.sender?.email ||
                  "Team member"}
              </span>
              <time>{formatTime(message.createdAt)}</time>
            </div>
            <p>{message.text}</p>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {error && <p className="chat-error">{error}</p>}

      <form onSubmit={sendMessage} className="chat-compose">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={
            projectId ? "Type your message..." : "Select a project first"
          }
          maxLength={2000}
          disabled={!projectId || loading}
        />

        <button
          type="submit"
          disabled={!projectId || !text.trim() || loading}
          aria-label="Send message"
        >
          <Send size={19} />
          <span>Send</span>
        </button>
      </form>
    </section>

    <aside className="chat-side-panel">
      <div className="chat-side-heading">
        <span className="chat-side-icon"><Sparkles size={17} /></span>
        <div>
          <h2>Make the conversation count</h2>
          <p>A few prompts to get the team moving.</p>
        </div>
      </div>
      <div className="chat-prompt-list">
        <article>
          <span>01</span>
          <p>What is the next small step we can finish?</p>
        </article>
        <article>
          <span>02</span>
          <p>Is there a decision we should capture in the project notes?</p>
        </article>
        <article>
          <span>03</span>
          <p>Who needs an update before we hand this off?</p>
        </article>
      </div>
      <div className="chat-side-note">
        <CircleCheck size={17} />
        <p>Keep updates clear, kind, and connected to the project.</p>
      </div>
      <div className="chat-side-foot">
        <Users size={15} />
        <span>Messages are shared with the selected project team.</span>
      </div>
    </aside>
    </div>
  </div>
);

}
