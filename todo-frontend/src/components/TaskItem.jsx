import React, { useState } from "react";
import {
  Check,
  Calendar,
  Folder,
  CheckSquare,
  Edit2,
  Trash2,
  Flag,
  Clock,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    if (!task.completed) {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#db4035", "#f2994a", "#246fe0", "#299438"],
        });
      } catch {}
    }
    onToggleComplete(task.id);
  };

  const getPriorityClass = () => `p${task.priority || 4}`;

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date().toISOString().split("T")[0];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrow = d.toISOString().split("T")[0];

    if (dateStr < today && !task.completed) {
      return { text: `Overdue, ${dateStr}`, type: "overdue" };
    }
    if (dateStr === today) {
      return { text: "Today", type: "today" };
    }
    if (dateStr === tomorrow) {
      return { text: "Tomorrow", type: "tomorrow" };
    }
    return { text: dateStr, type: "future" };
  };

  const dueDateInfo = formatDueDate(task.due_date);

  return (
    <div
      className="task-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(task)}
    >
      <div className="task-item-main">
        <button
          type="button"
          className={`todoist-checkbox ${getPriorityClass()} ${
            task.completed ? "checked" : ""
          }`}
          onClick={handleCheckboxClick}
          title={task.completed ? "Mark incomplete" : "Complete task"}
        >
          <Check size={11} strokeWidth={3.5} className="check-icon" />
        </button>

        <div className="task-item-content">
          <span
            className={`task-title ${task.completed ? "completed" : ""}`}
          >
            {task.title}
          </span>

          {task.description && (
            <span className="task-desc-preview">{task.description}</span>
          )}

          <div className="task-meta-pills">
            {dueDateInfo && (
              <span className={`pill-date ${dueDateInfo.type}`}>
                <Calendar size={12} />
                {dueDateInfo.text}
              </span>
            )}

            {task.project_name && (
              <span className="pill-project">
                <span
                  className="project-dot"
                  style={{
                    backgroundColor: task.project_color || "var(--color-primary)",
                    width: "7px",
                    height: "7px",
                  }}
                />
                {task.project_name}
              </span>
            )}

            {task.subtask_total > 0 && (
              <span className="pill-subtasks">
                <CheckSquare size={12} />
                {task.subtask_completed}/{task.subtask_total}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="task-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          title="Edit task"
        >
          <Edit2 size={15} />
        </button>

        <button
          type="button"
          className="task-action-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          title="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
