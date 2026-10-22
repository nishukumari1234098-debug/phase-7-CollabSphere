
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Check, Clock3 } from "lucide-react";
import notificationService from "../services/notificationService";
import PageGuide from "../components/PageGuide";
import "./Notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setError("");
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Notifications load nahi hui."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markRead(id) {
    try {
      await notificationService.markRead(id);
      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id ? { ...item, isRead: true } : item
        )
      );
    } catch {
      setError("Notification update nahi hui.");
    }
  }

  async function markAllRead() {
    try {
      await notificationService.markAllRead();
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );
    } catch {
      setError("Notifications update nahi hui.");
    }
  }

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const readCount = notifications.length - unreadCount;

  return (
    <main className="notifications-page">
      <header className="notifications-heading">
        <div>
          <p className="notifications-eyebrow">YOUR WORKSPACE</p>
          <h1>Notifications</h1>
          <p>You have {unreadCount} unread notification(s).</p>
        </div>

        <button
          className="notifications-mark-all"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={17} />
          Mark all read
        </button>
      </header>

      <section className="page-insights notification-insights">
        <article>
          <span className="page-insight-icon"><Bell size={17} /></span>
          <span><strong>{notifications.length}</strong><small>All updates</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><Clock3 size={17} /></span>
          <span><strong>{unreadCount}</strong><small>Need your attention</small></span>
        </article>
        <article>
          <span className="page-insight-icon"><Check size={17} /></span>
          <span><strong>{readCount}</strong><small>Already reviewed</small></span>
        </article>
        <p>Project invitations and team updates land here, so nothing important gets missed.</p>
      </section>

      <PageGuide
        variant="notifications"
        icon={Bell}
        title="Stay in the loop at your own pace."
        description="Come back to invitations and project updates when you are ready, then mark them read to clear your focus."
        note="Unread updates are highlighted for you."
      />

      <section className="notification-routine">
        <div className="notification-routine-heading">
          <div>
            <span className="notifications-eyebrow">A CALMER INBOX</span>
            <h2>Turn updates into a simple routine</h2>
          </div>
          <p>A quick review keeps the important project context close without interrupting your flow.</p>
        </div>
        <div className="notification-routine-grid">
          <article>
            <span><Bell size={17} /></span>
            <strong>Scan the project context</strong>
            <p>Check which project an update belongs to before jumping into the next task.</p>
          </article>
          <article>
            <span><Clock3 size={17} /></span>
            <strong>Review when it suits you</strong>
            <p>Unread items stay highlighted until you are ready to mark them as reviewed.</p>
          </article>
          <article>
            <span><CheckCheck size={17} /></span>
            <strong>Clear the queue together</strong>
            <p>Use “Mark all read” after catching up to reset your unread focus.</p>
          </article>
        </div>
        <div className="notification-routine-foot">
          <Check size={16} />
          <span>Tip: open the related project when an update needs more context.</span>
        </div>
      </section>

      {error && <p className="notifications-error">{error}</p>}

      {loading ? (
        <p className="notifications-empty">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <Bell size={34} />
          <h3>You're all caught up!</h3>
          <p>New updates will appear here.</p>
        </div>
      ) : (
        <section className="notifications-list">
          {notifications.map((item) => (
            <article
              key={item._id}
              className={`notification-card ${item.isRead ? "read" : "unread"}`}
            >
              <div className="notification-icon">
                <Bell size={20} />
              </div>

              <div className="notification-content">
                <p>{item.message}</p>
                <span>
                  {item.project?.name ? `${item.project.name} · ` : ""}
                  {new Date(item.createdAt).toLocaleString()}
                </span>
                {!item.isRead && (
                  <button onClick={() => markRead(item._id)}>
                    Mark as read
                  </button>
                )}
              </div>

              {!item.isRead && (
                <span className="notification-dot" aria-label="Unread" />
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
