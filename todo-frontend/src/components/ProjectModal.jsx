import React, { useState, useEffect } from "react";
import { X, FolderPlus, Star } from "lucide-react";

const TODOIST_COLORS = [
  { name: "Berry Red", hex: "#db4035" },
  { name: "Orange", hex: "#ff9900" },
  { name: "Yellow", hex: "#fad000" },
  { name: "Olive Green", hex: "#afb83b" },
  { name: "Green", hex: "#299438" },
  { name: "Mint Green", hex: "#6accbc" },
  { name: "Teal", hex: "#158fad" },
  { name: "Sky Blue", hex: "#14aaf5" },
  { name: "Blue", hex: "#246fe0" },
  { name: "Grape", hex: "#8f4700" },
  { name: "Violet", hex: "#a970ff" },
  { name: "Lavender", hex: "#e26fe0" },
  { name: "Magenta", hex: "#e05194" },
  { name: "Charcoal", hex: "#808080" },
];

export default function ProjectModal({
  isOpen,
  project = null,
  onClose,
  onSave,
  onDelete,
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#db4035");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color || "#db4035");
      setIsFavorite(project.is_favorite || false);
    } else {
      setName("");
      setColor("#db4035");
      setIsFavorite(false);
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        is_favorite: isFavorite,
      });
    } catch (err) {
      console.error("Project save error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FolderPlus size={18} color="var(--color-primary)" />
            <h3>{project ? "Edit Project" : "Add Project"}</h3>
          </div>
          <button className="section-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Work, Fitness, Reading"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Color</label>
              <div className="color-picker-grid">
                {TODOIST_COLORS.map((c) => (
                  <div
                    key={c.hex}
                    className={`color-swatch ${color === c.hex ? "selected" : ""}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
                cursor: "pointer",
              }}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                style={{ accentColor: "var(--color-primary)" }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                Add to favorites
              </span>
            </div>
          </div>

          <div className="modal-footer">
            {project && (
              <button
                type="button"
                className="btn-secondary"
                style={{ marginRight: "auto", color: "var(--p1-color)" }}
                onClick={() => onDelete(project.id)}
              >
                Delete Project
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              {project ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
