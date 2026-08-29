import React, { useState } from "react";
import { CheckCircle2, Lock, User, Mail, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { authService } from "../services/authService";

export default function AuthScreen({ onAuthSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const d = err.response.data;
        let msg = d.detail || d.error;
        if (!msg) {
          if (d.username) msg = d.username[0];
          else if (d.password) msg = d.password[0];
          else if (d.email) msg = d.email[0];
          else if (d.non_field_errors) msg = d.non_field_errors[0];
          else msg = "Authentication failed. Please check your credentials.";
        }
        setError(msg);
      } else {
        setError("Network error. Please make sure the backend is running.");
      }
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
    } catch (err) {
      console.error(err);
      setError("Failed to start guest demo session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen-container">
      <div className="auth-screen-card">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo-badge">
            <CheckCircle2 size={32} color="#ffffff" strokeWidth={2.5} />
          </div>
          <h1 className="auth-title">Todoist</h1>
          <p className="auth-subtitle">
            {isSignup
              ? "Join millions who organize work and life."
              : "Welcome back! Organize your work and life."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isSignup ? "active" : ""}`}
            onClick={() => {
              setIsSignup(false);
              setError("");
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`auth-tab ${isSignup ? "active" : ""}`}
            onClick={() => {
              setIsSignup(true);
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {isSignup && (
            <div className="form-group">
              <label>Email Address (optional)</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Enter password (min 4 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              "Please wait..."
            ) : (
              <>
                <span>{isSignup ? "Create Account" : "Log In"}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Demo Account Button */}
        <button
          type="button"
          className="btn-secondary auth-demo-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          <Sparkles size={18} color="var(--color-primary)" />
          <span>Explore Demo / Guest Account</span>
        </button>

        <div className="auth-footer-note">
          <ShieldCheck size={14} />
          <span>Fast, secure JWT authentication with PostgreSQL persistence</span>
        </div>
      </div>
    </div>
  );
}
