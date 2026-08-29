import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Flag,
  Folder,
  CheckSquare,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";

export default function TaskDetailModal({
  task,
  projects,
  onClose,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
}) {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [priority, setPriority] = useState(task.priority || 4);
  const [projectId, setProjectId] = useState(task.project || "");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [subtasks, setSubtasks] = useState(task.subtasks || []);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(task.due_date || "");
    setPriority(task.priority || 4);
    setProjectId(task.project || "");
    setSubtasks(task.subtasks || []);
  }, [task]);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onUpdateTask(task.id, {
        title: title.trim(),
        description: description ? description.trim() : "",
        due_date: dueDate || null,
        priority: parseInt(priority, 10),
        project: projectId ? parseInt(projectId, 10) : null,
      });
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const created = await onAddSubtask(task.id, newSubtaskTitle.trim());
    if (created) {
      setSubtasks([...subtasks, created]);
      setNewSubtaskTitle("");
    }
  };

  const priorityOptions = [
    { value: 1, label: "Priority 1 (Urgent)", color: "var(--p1-color)" },
    { value: 2, label: "Priority 2 (High)", color: "var(--p2-color)" },
    { value: 3, label: "Priority 3 (Medium)", color: "var(--p3-color)" },
    { value: 4, label: "Priority 4 (Normal)", color: "var(--p4-color)" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card task-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckSquare size={18} color="var(--color-primary)" />
            <h3>Task Details</h3>
          </div>
          <button className="section-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description & Notes</label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, links..."
            />
          </div>

          {/* Meta Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "12px",
            }}
          >
            {/* Due Date */}
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label>Priority</label>
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div className="form-group">
              <label>Project</label>
              <select
                className="form-input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Inbox</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="subtasks-section">
            <label style={{ fontSize: "0.84rem", fontWeight: 700 }}>
              Subtasks ({subtasks.filter((s) => s.completed).length}/
              {subtasks.length})
            </label>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {subtasks.map((st) => (
                <div key={st.id} className="subtask-item">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => onToggleSubtask(st.id)}
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span
                    style={{
                      textDecoration: st.completed ? "line-through" : "none",
                      color: st.completed
                        ? "var(--text-muted)"
                        : "var(--text-main)",
                      flex: 1,
                    }}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="subtask-add-row">
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: "6px 10px", fontSize: "0.85rem" }}
                placeholder="Add subtask and press Enter..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                disabled={!newSubtaskTitle.trim()}
              >
                <Plus size={14} /> Add
              </button>
            </form>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
