import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Calendar,
  Folder,
  ArrowRight,
  Flag,
  CheckCircle2,
  Clock,
  Sparkles,
  Command,
} from "lucide-react";
import { taskService } from "../services/taskService";

export default function SearchModal({
  isOpen,
  onClose,
  onSelectTask,
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, p1, today, completed
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveFilter("all");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const filterParams = { search: query.trim() };
        if (activeFilter === "p1") {
          filterParams.priority = 1;
        } else if (activeFilter === "today") {
          filterParams.view = "today";
        } else if (activeFilter === "completed") {
          filterParams.view = "completed";
        }
        const data = await taskService.getTasks(filterParams);
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSearchResults, 150);
    return () => clearTimeout(timer);
  }, [query, activeFilter]);

  // Keyboard navigation for arrow keys and enter
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onSelectTask(results[selectedIndex]);
      onClose();
    }
  };

  if (!isOpen) return null;

  const priorityColors = {
    1: "var(--p1-color)",
    2: "var(--p2-color)",
    3: "var(--p3-color)",
    4: "var(--p4-color)",
  };

  return (
    <div className="modal-overlay search-modal-overlay" onClick={onClose}>
      <div
        className="modal-card search-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Search Input Bar */}
        <div className="search-modal-header">
          <div className="search-modal-input-wrapper">
            <Search size={22} className="search-modal-icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-modal-input"
              placeholder="Type a task name, project, or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                className="search-clear-btn"
                onClick={() => setQuery("")}
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className="search-close-icon-btn" onClick={onClose}>
            <span className="esc-key-badge">ESC</span>
          </button>
        </div>

        {/* Quick Filter Chips */}
        <div className="search-filter-chips">
          <button
            className={`search-filter-chip ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Tasks
          </button>
          <button
            className={`search-filter-chip ${activeFilter === "today" ? "active" : ""}`}
            onClick={() => setActiveFilter("today")}
          >
            <Calendar size={13} color="#058527" />
            <span>Today</span>
          </button>
          <button
            className={`search-filter-chip ${activeFilter === "p1" ? "active" : ""}`}
            onClick={() => setActiveFilter("p1")}
          >
            <Flag size={13} color="var(--p1-color)" />
            <span>Priority 1</span>
          </button>
          <button
            className={`search-filter-chip ${activeFilter === "completed" ? "active" : ""}`}
            onClick={() => setActiveFilter("completed")}
          >
            <CheckCircle2 size={13} color="#808080" />
            <span>Completed</span>
          </button>
        </div>

        {/* Results List */}
        <div className="search-modal-body">
          {loading && (
            <div className="search-empty-state">
              <div className="search-spinner" />
              <span>Searching your tasks...</span>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="search-empty-state">
              <Sparkles size={28} color="var(--text-muted)" />
              <p style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "4px" }}>
                {query ? `No tasks found for "${query}"` : "No matching tasks"}
              </p>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Try searching by different keywords or selecting another filter.
              </span>
            </div>
          )}

          <div className="search-results-list">
            {results.map((task, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={task.id}
                  className={`search-result-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onSelectTask(task);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="search-result-left">
                    <span
                      className="search-priority-indicator"
                      style={{ backgroundColor: priorityColors[task.priority || 4] }}
                      title={`Priority ${task.priority || 4}`}
                    />

                    <div className="search-result-info">
                      <span
                        className={`search-result-title ${
                          task.completed ? "completed" : ""
                        }`}
                      >
                        {task.title}
                      </span>

                      {task.description && (
                        <span className="search-result-desc">
                          {task.description}
                        </span>
                      )}

                      <div className="search-result-tags">
                        {task.project_name ? (
                          <span className="search-tag-pill">
                            <span
                              className="project-dot"
                              style={{
                                backgroundColor: task.project_color || "var(--color-primary)",
                                width: "6px",
                                height: "6px",
                              }}
                            />
                            {task.project_name}
                          </span>
                        ) : (
                          <span className="search-tag-pill">
                            <Folder size={11} color="#246fe0" /> Inbox
                          </span>
                        )}

                        {task.due_date && (
                          <span className="search-tag-pill date">
                            <Calendar size={11} /> {task.due_date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="search-result-action">
                    <span className="search-open-hint">Open</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with keyboard hints */}
        <div className="search-modal-footer">
          <div className="search-footer-hint">
            <span className="key-cap">↑</span>
            <span className="key-cap">↓</span>
            <span>to navigate</span>
          </div>
          <div className="search-footer-hint">
            <span className="key-cap">↵</span>
            <span>to select</span>
          </div>
          <div className="search-footer-hint">
            <span className="key-cap">esc</span>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
