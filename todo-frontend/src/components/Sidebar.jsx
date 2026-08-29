import React from "react";
import {
  Inbox,
  Calendar,
  CalendarDays,
  CheckCircle,
  Plus,
  Flag,
  MoreHorizontal,
  X,
} from "lucide-react";

export default function Sidebar({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  onOpenProjectModal,
  onEditProject,
  onDeleteProject,
  taskCounts,
}) {
  const todayDateNum = new Date().getDate();

  const handleNavClick = (viewName) => {
    setActiveView(viewName);
    setSelectedProjectId(null);
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  const handleProjectClick = (projectId) => {
    setActiveView("project");
    setSelectedProjectId(projectId);
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${!isOpen ? "collapsed" : ""}`}>
        {/* Mobile Header with close button */}
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Menu</span>
          <button
            className="section-icon-btn"
            onClick={onClose}
            title="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Inbox */}
          <button
            className={`nav-item ${activeView === "inbox" ? "active" : ""}`}
            onClick={() => handleNavClick("inbox")}
          >
            <div className="nav-item-left">
              <Inbox size={18} color="#246fe0" />
              <span>Inbox</span>
            </div>
            {taskCounts.inbox > 0 && (
              <span className="nav-badge">{taskCounts.inbox}</span>
            )}
          </button>

          {/* Today */}
          <button
            className={`nav-item ${activeView === "today" ? "active" : ""}`}
            onClick={() => handleNavClick("today")}
          >
            <div className="nav-item-left">
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calendar size={18} color="#058527" />
                <span
                  style={{
                    position: "absolute",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    top: "5px",
                    color: "#058527",
                  }}
                >
                  {todayDateNum}
                </span>
              </div>
              <span>Today</span>
            </div>
            {taskCounts.today > 0 && (
              <span className="nav-badge" style={{ color: "var(--p1-color)" }}>
                {taskCounts.today}
              </span>
            )}
          </button>

          {/* Upcoming */}
          <button
            className={`nav-item ${activeView === "upcoming" ? "active" : ""}`}
            onClick={() => handleNavClick("upcoming")}
          >
            <div className="nav-item-left">
              <CalendarDays size={18} color="#692fc2" />
              <span>Upcoming</span>
            </div>
          </button>

          {/* Calendar View (All Categories) */}
          <button
            className={`nav-item ${activeView === "calendar" ? "active" : ""}`}
            onClick={() => handleNavClick("calendar")}
          >
            <div className="nav-item-left">
              <Calendar size={18} color="#f2994a" />
              <span>Calendar</span>
            </div>
          </button>

          {/* Priority 1 View */}
          <button
            className={`nav-item ${activeView === "priority_1" ? "active" : ""}`}
            onClick={() => handleNavClick("priority_1")}
          >
            <div className="nav-item-left">
              <Flag size={18} color="var(--p1-color)" />
              <span>Priority 1</span>
            </div>
          </button>

          {/* Completed */}
          <button
            className={`nav-item ${activeView === "completed" ? "active" : ""}`}
            onClick={() => handleNavClick("completed")}
          >
            <div className="nav-item-left">
              <CheckCircle size={18} color="#808080" />
              <span>Completed</span>
            </div>
          </button>
        </nav>

        {/* Projects Section */}
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <span>My Projects</span>
            <div className="section-actions">
              <button
                className="section-icon-btn"
                onClick={onOpenProjectModal}
                title="Add Project"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="projects-list">
            {projects.length === 0 ? (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  padding: "8px 10px",
                }}
              >
                No projects yet. Click + to add one.
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  className={`project-item ${
                    activeView === "project" && selectedProjectId === project.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="project-item-left">
                    <span
                      className="project-dot"
                      style={{ backgroundColor: project.color || "#db4035" }}
                    />
                    <span className="project-name">{project.name}</span>
                  </div>

                  <div className="project-item-actions">
                    <button
                      className="section-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}
                      title="Edit Project"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {project.task_count > 0 && (
                    <span className="nav-badge project-count">
                      {project.task_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
