import React, { useState } from "react";
import {
  Menu,
  Plus,
  Search,
  Moon,
  Sun,
  LogOut,
  User,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import TaskFlowIcon from "./TaskFlowIcon";

export default function Header({
  onToggleSidebar,
  onOpenQuickAdd,
  onOpenSearch,
  onOpenAuth,
  onOpenProductivity,
  user,
  onLogout,
  theme,
  onToggleTheme,
  stats,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="header-btn"
          onClick={onToggleSidebar}
          title="Toggle Menu (M)"
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>

        <div className="logo-container" onClick={() => window.location.reload()}>
          <TaskFlowIcon size={26} variant="white" />
          <span className="logo-text">TaskFlow</span>
        </div>

        {/* Premium Desktop Search Bar */}
        <div
          className="header-search desktop-only"
          onClick={onOpenSearch}
          title="Quick search (Ctrl+K or ⌘K)"
          role="button"
          tabIndex={0}
        >
          <Search size={16} className="search-icon" />
          <span className="search-placeholder">Search tasks, projects, priorities...</span>
          <div className="search-shortcut-badge">
            <span className="shortcut-key">⌘</span>
            <span className="shortcut-key">K</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Mobile search icon button */}
        <button
          className="header-btn mobile-only"
          onClick={onOpenSearch}
          title="Search"
        >
          <Search size={19} />
        </button>

        <button
          className="header-btn quick-add-btn"
          onClick={onOpenQuickAdd}
          title="Quick Add Task (Q)"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="quick-add-text">Add task</span>
        </button>

        {stats && (
          <button
            className="header-btn desktop-only"
            onClick={onOpenProductivity}
            title={`Daily Goal: ${stats.today_completed}/${stats.daily_goal} completed`}
            style={{ gap: "5px", fontSize: "0.84rem", fontWeight: 600 }}
          >
            <TrendingUp size={16} />
            <span>
              {stats.today_completed}/{stats.daily_goal}
            </span>
          </button>
        )}

        <button
          className="header-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div style={{ position: "relative" }}>
            <button
              className="user-avatar-btn header-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="avatar-circle">
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "6px",
                  backgroundColor: "var(--bg-modal)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-md)",
                  minWidth: "190px",
                  padding: "6px",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid var(--border-subtle)",
                    fontSize: "0.84rem",
                    color: "var(--text-main)",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{user.username}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {user.email || "Active User"}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenProductivity();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    fontSize: "0.84rem",
                    color: "var(--text-main)",
                    borderRadius: "var(--radius-sm)",
                    width: "100%",
                    justifyContent: "flex-start",
                  }}
                  className="section-icon-btn"
                >
                  <Sparkles size={15} color="var(--color-primary)" />
                  <span>Productivity & Karma</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    fontSize: "0.84rem",
                    color: "var(--p1-color)",
                    borderRadius: "var(--radius-sm)",
                    width: "100%",
                    justifyContent: "flex-start",
                  }}
                  className="section-icon-btn"
                >
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="header-btn"
            onClick={onOpenAuth}
            style={{ fontSize: "0.84rem", fontWeight: 600 }}
          >
            <User size={16} style={{ marginRight: "4px" }} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
