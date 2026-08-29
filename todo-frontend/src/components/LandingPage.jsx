import React, { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Calendar,
  Flag,
  Folder,
  Check,
  TrendingUp,
  Zap,
  Layers,
  Star,
} from "lucide-react";
import TaskFlowIcon from "./TaskFlowIcon";
import AuthModal from "./AuthModal";
import { authService } from "../services/authService";

export default function LandingPage({ onAuthSuccess }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" or "signup"
  const [demoLoading, setDemoLoading] = useState(false);

  // Interactive sample task states in the Hero mockup
  const [previewTasks, setPreviewTasks] = useState([
    { id: 1, title: "Review quarterly strategy roadmap", priority: 1, date: "Today", project: "Work", color: "#246fe0", completed: false },
    { id: 2, title: "Prepare weekly grocery shopping list", priority: 2, date: "Tomorrow", project: "Personal", color: "#299438", completed: false },
    { id: 3, title: "Morning 5km running streak 🏃‍♂️", priority: 3, date: "Today", project: "Fitness", color: "#ff9900", completed: true },
    { id: 4, title: "Book flight tickets for vacation", priority: 4, date: "Next week", project: "Travel", color: "#a970ff", completed: false },
  ]);

  const togglePreviewTask = (id) => {
    setPreviewTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleOpenLogin = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalMode("signup");
    setIsAuthModalOpen(true);
  };

  const handleGuestDemo = async () => {
    setDemoLoading(true);
    try {
      await authService.guestLogin();
      onAuthSuccess();
    } catch (err) {
      console.error("Guest demo login failed:", err);
    } finally {
      setDemoLoading(false);
    }
  };

  const priorityColors = {
    1: "var(--p1-color)",
    2: "var(--p2-color)",
    3: "var(--p3-color)",
    4: "var(--p4-color)",
  };

  return (
    <div className="landing-page-root">
      {/* ---------------- Navigation Bar ---------------- */}
      <header className="landing-navbar">
        <div className="landing-navbar-inner">
          <div className="landing-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <TaskFlowIcon size={32} />
            <span className="landing-logo-text">TaskFlow</span>
          </div>

          <nav className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#productivity" className="landing-nav-link">Productivity</a>
            <a href="#preview" className="landing-nav-link">Live App</a>
          </nav>

          <div className="landing-nav-actions">
            <button className="landing-btn-ghost" onClick={handleOpenLogin}>
              Log in
            </button>
            <button className="landing-btn-primary" onClick={handleOpenSignup}>
              Start for free
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Hero Section ---------------- */}
      <section className="landing-hero-section">
        <div className="landing-hero-content">
          <div className="landing-pill-badge">
            <TaskFlowIcon size={16} />
            <span>The world's #1 to-do list & task manager</span>
          </div>

          <h1 className="landing-hero-title">
            Organize your work and life, <span className="highlight-text">finally.</span>
          </h1>

          <p className="landing-hero-subtitle">
            Simplify your life. One task at a time. Become focused, organized, and calm with TaskFlow.
          </p>

          <div className="landing-hero-cta-group">
            <button
              className="landing-hero-btn-primary"
              onClick={handleOpenSignup}
            >
              <span>Start for free</span>
              <ArrowRight size={18} />
            </button>

            <button
              className="landing-hero-btn-secondary"
              onClick={handleGuestDemo}
              disabled={demoLoading}
            >
              <Sparkles size={18} color="var(--color-primary)" />
              <span>{demoLoading ? "Launching..." : "Explore Live Demo"}</span>
            </button>
          </div>

          <div className="landing-social-proof">
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={15} fill="#ff9900" color="#ff9900" />
              ))}
            </div>
            <span>4.8/5 on App Store • 30M+ people trust TaskFlow</span>
          </div>
        </div>

        {/* ---------------- Interactive App Preview Mockup ---------------- */}
        <div className="landing-preview-card-wrapper" id="preview">
          <div className="landing-preview-card">
            {/* Mockup Header */}
            <div className="mockup-header">
              <div className="mockup-window-controls">
                <span className="ctrl-dot red" />
                <span className="ctrl-dot yellow" />
                <span className="ctrl-dot green" />
              </div>
              <div className="mockup-title">Today • Interactive Preview</div>
              <div className="mockup-badge">Click to complete tasks 👇</div>
            </div>

            {/* Mockup Body */}
            <div className="mockup-body">
              <div className="mockup-tasks-list">
                {previewTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`mockup-task-item ${t.completed ? "completed" : ""}`}
                    onClick={() => togglePreviewTask(t.id)}
                  >
                    <div
                      className={`todoist-checkbox p${t.priority} ${
                        t.completed ? "checked" : ""
                      }`}
                    >
                      <Check size={11} strokeWidth={3.5} className="check-icon" />
                    </div>

                    <div className="mockup-task-info">
                      <span className={`mockup-task-title ${t.completed ? "done" : ""}`}>
                        {t.title}
                      </span>
                      <div className="mockup-task-tags">
                        <span className="mockup-tag date">
                          <Calendar size={11} /> {t.date}
                        </span>
                        <span className="mockup-tag">
                          <span className="project-dot" style={{ backgroundColor: t.color, width: "6px", height: "6px" }} />
                          {t.project}
                        </span>
                        <span className="mockup-tag" style={{ color: priorityColors[t.priority] }}>
                          <Flag size={11} /> P{t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mockup-quick-add-bar" onClick={handleOpenSignup}>
                <span className="mockup-plus">+</span>
                <span>Add task (e.g. Schedule team meeting #Work tomorrow @priority 1)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Features Section ---------------- */}
      <section className="landing-features-section" id="features">
        <div className="section-header-center">
          <h2 className="section-title">Clear your mind & reach your goals</h2>
          <p className="section-subtitle">
            TaskFlow gives you the clarity and structure you need to get things done.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-badge" style={{ backgroundColor: "rgba(36, 111, 224, 0.1)", color: "#246fe0" }}>
              <Zap size={24} />
            </div>
            <h3>Quick Add Tasks</h3>
            <p>Capture tasks the instant they pop into your head with smart date recognition and keyboard shortcuts.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge" style={{ backgroundColor: "rgba(219, 64, 53, 0.1)", color: "var(--color-primary)" }}>
              <Calendar size={24} />
            </div>
            <h3>Today & Upcoming Views</h3>
            <p>Know what to tackle today and see what's on the horizon with day-by-day calendar views.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge" style={{ backgroundColor: "rgba(41, 148, 56, 0.1)", color: "#299438" }}>
              <Layers size={24} />
            </div>
            <h3>Projects & Subtasks</h3>
            <p>Organize large goals into custom color-coded projects and break them down into actionable subtasks.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-badge" style={{ backgroundColor: "rgba(242, 153, 74, 0.1)", color: "#f2994a" }}>
              <Flag size={24} />
            </div>
            <h3>Priority Levels (P1–P4)</h3>
            <p>Highlight what's urgent with color flags, keeping your focus on the highest-impact work.</p>
          </div>
        </div>
      </section>

      {/* ---------------- Productivity / Karma Section ---------------- */}
      <section className="landing-productivity-section" id="productivity">
        <div className="productivity-banner-card">
          <div className="productivity-banner-left">
            <div className="landing-pill-badge" style={{ alignSelf: "flex-start", backgroundColor: "rgba(219, 64, 53, 0.15)" }}>
              <TrendingUp size={14} color="var(--color-primary)" />
              <span>Karma & Habit Builder</span>
            </div>
            <h2 className="banner-title">Turn productivity into a daily reward</h2>
            <p className="banner-subtitle">
              Set daily and weekly task goals, build completion streaks, and watch your TaskFlow Karma grow.
            </p>
            <button className="landing-btn-primary" style={{ alignSelf: "flex-start", marginTop: "12px" }} onClick={handleGuestDemo}>
              Try it live in demo
            </button>
          </div>

          <div className="productivity-stats-preview">
            <div className="stat-box">
              <span className="stat-label">Karma Level</span>
              <span className="stat-val" style={{ color: "var(--color-primary)" }}>Master</span>
              <span className="stat-sub">750 pts</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Daily Goal</span>
              <span className="stat-val">5 / 5</span>
              <span className="stat-sub">100% achieved</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Current Streak</span>
              <span className="stat-val" style={{ color: "#ff9900" }}>7 Days 🔥</span>
              <span className="stat-sub">Keep it going!</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Bottom CTA Section ---------------- */}
      <section className="landing-bottom-cta-section">
        <div className="bottom-cta-content">
          <h2>Gain clarity and calm with TaskFlow</h2>
          <p>Join millions of people organizing work, school, and personal life with confidence.</p>
          <div className="landing-hero-cta-group">
            <button className="landing-hero-btn-primary" onClick={handleOpenSignup}>
              <span>Start for free</span>
              <ArrowRight size={18} />
            </button>
            <button className="landing-hero-btn-secondary" onClick={handleOpenLogin}>
              <span>Log in to your account</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <div className="landing-logo">
              <TaskFlowIcon size={26} />
              <span className="landing-logo-text">TaskFlow</span>
            </div>
            <p className="footer-tagline">Join millions of people who organize work and life with TaskFlow.</p>
          </div>

          <div className="footer-links-group">
            <div className="footer-column">
              <h4>Features</h4>
              <a href="#features">Quick Add</a>
              <a href="#features">Today & Upcoming</a>
              <a href="#features">Projects & Subtasks</a>
              <a href="#productivity">Karma Tracker</a>
            </div>
            <div className="footer-column">
              <h4>Account</h4>
              <button className="footer-link-btn" onClick={handleOpenLogin}>Log In</button>
              <button className="footer-link-btn" onClick={handleOpenSignup}>Sign Up</button>
              <button className="footer-link-btn" onClick={handleGuestDemo}>Guest Demo</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom-bar">
          <span>© 2026 TaskFlow. Built with Django REST Framework & React.</span>
        </div>
      </footer>

      {/* ---------------- Auth Modal ---------------- */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAuthModalOpen(false);
          onAuthSuccess();
        }}
      />
    </div>
  );
}
