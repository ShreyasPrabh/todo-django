import React, { useState, useEffect } from "react";
import {
  Calendar,
  Flag,
  Folder,
  X,
  Check,
  Clock,
} from "lucide-react";

export default function InlineTaskEditor({
  initialTask = null,
  projects = [],
  defaultProjectId = null,
  defaultDueDate = "",
  onSave,
  onCancel,
}) {
  const [title, setTitle] = useState(
    initialTask && initialTask.title ? initialTask.title : ""
  );
  const [description, setDescription] = useState(
    initialTask && initialTask.description ? initialTask.description : ""
  );
  const [dueDate, setDueDate] = useState(
    initialTask ? (initialTask.due_date || "") : defaultDueDate
  );
  const [priority, setPriority] = useState(
    initialTask && initialTask.priority ? initialTask.priority : 4
  );
  const [projectId, setProjectId] = useState(
    initialTask && initialTask.project
      ? initialTask.project
      : (defaultProjectId || "")
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };
  const getNextWeekStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description ? description.trim() : "",
        due_date: dueDate || null,
        priority: parseInt(priority, 10),
        project: projectId ? parseInt(projectId, 10) : null,
      });
    } catch (err) {
      console.error("Task submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const priorityLabels = {
    1: { label: "P1", color: "var(--p1-color)", text: "Urgent" },
    2: { label: "P2", color: "var(--p2-color)", text: "High" },
    3: { label: "P3", color: "var(--p3-color)", text: "Medium" },
    4: { label: "P4", color: "var(--p4-color)", text: "Normal" },
  };

  const currentProject = projects.find((p) => p.id === parseInt(projectId, 10));

  const formatDueDateLabel = (dateStr) => {
    if (!dateStr) return "Due date";
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();
    if (dateStr === today) return "Today";
    if (dateStr === tomorrow) return "Tomorrow";
    return dateStr;
  };

  return (
    <div className="task-editor-card">
      <input
        type="text"
        className="task-editor-title-input"
        placeholder="Task name e.g. Buy milk every Sunday #Household"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      <textarea
        className="task-editor-desc-input"
        placeholder="Description or notes"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      {/* Meta Row: Date, Priority, Project */}
      <div className="task-editor-meta-row">
        {/* Due Date Button */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className={`meta-chip ${dueDate ? "active-date" : ""}`}
            onClick={() => {
              setShowDatePicker(!showDatePicker);
              setShowPriorityPicker(false);
              setShowProjectPicker(false);
            }}
          >
            <Calendar size={14} />
            <span>{formatDueDateLabel(dueDate)}</span>
            {dueDate && (
              <X
                size={12}
                onClick={(e) => {
                  e.stopPropagation();
                  setDueDate("");
                }}
              />
            )}
          </button>

          {showDatePicker && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                backgroundColor: "var(--bg-modal)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                padding: "8px",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                minWidth: "160px",
              }}
            >
              <button
                type="button"
                className="section-icon-btn"
                style={{ padding: "6px 8px", fontSize: "0.82rem", justifyContent: "flex-start", width: "100%" }}
                onClick={() => {
                  setDueDate(getTodayStr());
                  setShowDatePicker(false);
                }}
              >
                <Calendar size={14} color="#058527" />
                <span style={{ marginLeft: "6px" }}>Today</span>
              </button>
              <button
                type="button"
                className="section-icon-btn"
                style={{ padding: "6px 8px", fontSize: "0.82rem", justifyContent: "flex-start", width: "100%" }}
                onClick={() => {
                  setDueDate(getTomorrowStr());
                  setShowDatePicker(false);
                }}
              >
                <Clock size={14} color="#f2994a" />
                <span style={{ marginLeft: "6px" }}>Tomorrow</span>
              </button>
              <button
                type="button"
                className="section-icon-btn"
                style={{ padding: "6px 8px", fontSize: "0.82rem", justifyContent: "flex-start", width: "100%" }}
                onClick={() => {
                  setDueDate(getNextWeekStr());
                  setShowDatePicker(false);
                }}
              >
                <Calendar size={14} color="#692fc2" />
                <span style={{ marginLeft: "6px" }}>Next week</span>
              </button>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setShowDatePicker(false);
                }}
                className="form-input"
                style={{ marginTop: "4px", padding: "4px 6px", fontSize: "0.8rem" }}
              />
            </div>
          )}
        </div>

        {/* Priority Selector */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className={`meta-chip p${priority}`}
            onClick={() => {
              setShowPriorityPicker(!showPriorityPicker);
              setShowDatePicker(false);
              setShowProjectPicker(false);
            }}
          >
            <Flag size={14} color={priorityLabels[priority].color} />
            <span>{priorityLabels[priority].label}</span>
          </button>

          {showPriorityPicker && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                backgroundColor: "var(--bg-modal)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                padding: "6px",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: "140px",
              }}
            >
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    fontSize: "0.82rem",
                    color: priorityLabels[p].color,
                    borderRadius: "var(--radius-sm)",
                    width: "100%",
                    justifyContent: "flex-start",
                  }}
                  className="section-icon-btn"
                  onClick={() => {
                    setPriority(p);
                    setShowPriorityPicker(false);
                  }}
                >
                  <Flag size={14} color={priorityLabels[p].color} />
                  <span>
                    Priority {p} ({priorityLabels[p].text})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Selector */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="meta-chip"
            onClick={() => {
              setShowProjectPicker(!showProjectPicker);
              setShowDatePicker(false);
              setShowPriorityPicker(false);
            }}
          >
            <Folder size={14} color={currentProject ? currentProject.color : "#246fe0"} />
            <span>{currentProject ? currentProject.name : "Inbox"}</span>
          </button>

          {showProjectPicker && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                backgroundColor: "var(--bg-modal)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-md)",
                padding: "6px",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                minWidth: "160px",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              <button
                type="button"
                className="section-icon-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 8px",
                  fontSize: "0.82rem",
                  width: "100%",
                  justifyContent: "flex-start",
                }}
                onClick={() => {
                  setProjectId("");
                  setShowProjectPicker(false);
                }}
              >
                <Folder size={14} color="#246fe0" />
                <span>Inbox</span>
              </button>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  className="section-icon-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    fontSize: "0.82rem",
                    width: "100%",
                    justifyContent: "flex-start",
                  }}
                  onClick={() => {
                    setProjectId(proj.id);
                    setShowProjectPicker(false);
                  }}
                >
                  <span
                    className="project-dot"
                    style={{ backgroundColor: proj.color }}
                  />
                  <span>{proj.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="task-editor-footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!title.trim() || submitting}
        >
          {submitting ? "Saving..." : initialTask ? "Save" : "Add task"}
        </button>
      </div>
    </div>
  );
}
