import React, { useState } from "react";
import {
  CheckCircle2,
  Trash2,
  RotateCcw,
  Calendar,
  Folder,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";

export default function CompletedView({
  tasks = [],
  projects = [],
  onToggleComplete,
  onDeleteTask,
  onTaskClick,
}) {
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");

  const completedTasks = tasks.filter((t) => t.completed);

  const filteredTasks = completedTasks.filter((task) => {
    if (selectedProjectFilter === "all") return true;
    if (selectedProjectFilter === "inbox") return !task.project;
    return task.project === parseInt(selectedProjectFilter, 10);
  });

  const priorityColors = {
    1: "var(--p1-color)",
    2: "var(--p2-color)",
    3: "var(--p3-color)",
    4: "var(--p4-color)",
  };

  const formatCompletedDate = (task) => {
    if (task.completed_at) {
      try {
        const d = new Date(task.completed_at);
        return d.toLocaleDateString("default", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "Completed";
      }
    }
    return "Completed";
  };

  return (
    <div className="completed-view-root">
      {/* Header Bar */}
      <div className="completed-header-bar">
        <div className="completed-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="completed-icon-badge">
              <CheckCircle2 size={24} color="#058527" />
            </div>
            <div>
              <h1 className="completed-view-title">Completed Tasks</h1>
              <p className="completed-view-subtitle">
                Archive of all tasks you have accomplished
              </p>
            </div>
          </div>

          <div className="completed-count-pill">
            <span>{completedTasks.length} Completed</span>
          </div>
        </div>

        {/* Project Filter Chips */}
        {completedTasks.length > 0 && (
          <div className="completed-filter-chips">
            <button
              className={`completed-filter-chip ${
                selectedProjectFilter === "all" ? "active" : ""
              }`}
              onClick={() => setSelectedProjectFilter("all")}
            >
              All Projects ({completedTasks.length})
            </button>

            <button
              className={`completed-filter-chip ${
                selectedProjectFilter === "inbox" ? "active" : ""
              }`}
              onClick={() => setSelectedProjectFilter("inbox")}
            >
              <Folder size={12} color="#246fe0" />
              <span>Inbox</span>
            </button>

            {projects.map((proj) => {
              const count = completedTasks.filter((t) => t.project === proj.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={proj.id}
                  className={`completed-filter-chip ${
                    selectedProjectFilter === String(proj.id) ? "active" : ""
                  }`}
                  onClick={() => setSelectedProjectFilter(String(proj.id))}
                >
                  <span
                    className="project-dot"
                    style={{
                      backgroundColor: proj.color || "var(--color-primary)",
                      width: "7px",
                      height: "7px",
                    }}
                  />
                  <span>
                    {proj.name} ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Tasks List */}
      <div className="completed-tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 16px" }}>
            <div className="empty-state-icon" style={{ color: "#058527" }}>
              <CheckCircle2 size={36} />
            </div>
            <h4>No completed tasks in this view</h4>
            <p>
              Complete active tasks from your Inbox, Today, or Projects to archive them here.
            </p>
          </div>
        ) : (
          <div className="completed-items-list">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="completed-task-card"
                onClick={() => onTaskClick(task)}
              >
                <div className="completed-task-left">
                  {/* Circular Checkbox / Restore Action */}
                  <button
                    className="todoist-checkbox checked"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task.id);
                    }}
                    title="Click to uncomplete / restore task"
                  >
                    <Check size={11} strokeWidth={3.5} className="check-icon" />
                  </button>

                  <div className="completed-task-details">
                    <span className="completed-task-title">{task.title}</span>

                    {task.description && (
                      <p className="completed-task-desc">{task.description}</p>
                    )}

                    <div className="completed-task-meta">
                      {task.project_name ? (
                        <span className="completed-meta-tag">
                          <span
                            className="project-dot"
                            style={{
                              backgroundColor:
                                task.project_color || "var(--color-primary)",
                              width: "6px",
                              height: "6px",
                            }}
                          />
                          {task.project_name}
                        </span>
                      ) : (
                        <span className="completed-meta-tag">
                          <Folder size={11} color="#246fe0" /> Inbox
                        </span>
                      )}

                      <span className="completed-meta-tag time">
                        <CheckCircle2 size={11} color="#058527" />{" "}
                        {formatCompletedDate(task)}
                      </span>

                      {task.subtasks && task.subtasks.length > 0 && (
                        <span className="completed-meta-tag">
                          <Layers size={11} /> {task.subtasks.length} subtasks
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions: Restore & Delete */}
                <div
                  className="completed-task-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="completed-action-btn restore"
                    onClick={() => onToggleComplete(task.id)}
                    title="Restore task to active"
                  >
                    <RotateCcw size={14} />
                    <span>Restore</span>
                  </button>

                  <button
                    className="completed-action-btn delete"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
