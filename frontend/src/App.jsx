import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Notes from "./pages/Notes";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import Navbar from "./components/Navbar";
import Notifications from "./pages/Notifications";
import Activity from "./pages/Activity";
import PublicProject from "./pages/PublicProject";
import Chat from "./pages/Chat";
import Footer from "./components/Footer";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="app-loading">Loading CollabSphere...</div>;

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <div className={`app-shell ${user ? "has-sidebar" : "guest-shell"}`}>
      {!loading && <Navbar />}

      <div className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={loading ? "/" : user ? "/dashboard" : "/login"}
                replace
              />
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public/projects/:id" element={<PublicProject />} />
          <Route path="/chat" element={<Chat />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <Files />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <Activity />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
