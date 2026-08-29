import React from "react";
import { X, PlusCircle } from "lucide-react";
import InlineTaskEditor from "./InlineTaskEditor";

export default function QuickAddModal({
  isOpen,
  onClose,
  projects,
  onCreateTask,
}) {
  if (!isOpen) return null;

  const handleSave = (taskData) => {
    onCreateTask(taskData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: "560px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={18} color="var(--color-primary)" />
            <h3>Quick Add Task</h3>
          </div>
          <button className="section-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: "16px" }}>
          <InlineTaskEditor
            projects={projects}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
