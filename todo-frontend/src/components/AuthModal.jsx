import React, { useState } from "react";
import { X, Lock, User, Mail, Sparkles } from "lucide-react";
import TaskFlowIcon from "./TaskFlowIcon";
import { authService } from "../services/authService";

export default function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
  onAuthSuccess,
}) {
  const [isSignup, setIsSignup] = useState(initialMode === "signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setIsSignup(initialMode === "signup");
    setError("");
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await authService.signup(username, email, password);
      } else {
        await authService.login(username, password);
      }
      onAuthSuccess();
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      const msg =
        err.response?.data?.error ||
        (isSignup
          ? "Signup failed. Please try a different username."
          : "Invalid username or password.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await authService.guestLogin();
      onAuthSuccess();
      onClose();
    } catch (err) {
      console.error("Guest login error:", err);
      setError("Could not sign in as guest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ borderBottom: "none", paddingBottom: "0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TaskFlowIcon size={24} />
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>TaskFlow</span>
          </div>
          <button className="section-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  backgroundColor: "var(--p1-bg)",
                  color: "var(--p1-color)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.84rem",
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            {isSignup && (
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "10px", marginTop: "4px" }}
              disabled={loading}
            >
              {loading ? "Processing..." : isSignup ? "Sign up" : "Log in"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "8px 0",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>OR</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            </div>

            <button
              type="button"
              className="btn-secondary"
              style={{
                width: "100%",
                padding: "10px",
                gap: "8px",
                fontWeight: 600,
                color: "var(--color-primary)",
              }}
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <Sparkles size={16} />
              <span>Continue with Demo / Guest Account</span>
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: "12px",
                fontSize: "0.84rem",
                color: "var(--text-secondary)",
              }}
            >
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                style={{
                  color: "var(--color-primary)",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
              >
                {isSignup ? "Log in" : "Sign up"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
