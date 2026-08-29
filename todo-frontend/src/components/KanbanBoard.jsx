import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Calendar,
  Flag,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import InlineTaskEditor from "./InlineTaskEditor";

export default function KanbanBoard({
  tasks,
  projects,
  selectedProjectId,
  onToggleComplete,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onTaskClick,
}) {
  const [addingToColumn, setAddingToColumn] = useState(null); // 'todo' | 'inprogress' | 'completed' | null
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // Group tasks into 3 workflow columns by status:
  // 1. To Do: uncompleted tasks with status 'todo' or default
  // 2. In Progress / High Focus: uncompleted tasks with status 'inprogress'
  // 3. Completed: completed tasks or status 'completed'
  const todoTasks = tasks.filter(
    (t) => !t.completed && (t.status === "todo" || !t.status || t.status === "")
  );
  const inProgressTasks = tasks.filter(
    (t) => !t.completed && t.status === "inprogress"
  );
  const completedTasks = tasks.filter((t) => t.completed || t.status === "completed");

  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "#246fe0",
      bgLight: "rgba(36, 111, 224, 0.1)",
      tasks: todoTasks,
      badgeText: "Queued",
      defaultPriority: 4,
    },
    {
      id: "inprogress",
      title: "In Progress / High Focus",
      color: "var(--p1-color)",
      bgLight: "var(--p1-bg)",
      tasks: inProgressTasks,
      badgeText: "Active",
      defaultPriority: 1,
    },
    {
      id: "completed",
      title: "Completed",
      color: "#058527",
      bgLight: "rgba(5, 133, 39, 0.1)",
      tasks: completedTasks,
      badgeText: "Done",
      defaultPriority: 4,
    },
  ];

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (colId) => {
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = async (e, targetColId) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskIdStr = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (!taskIdStr) return;
    const taskId = parseInt(taskIdStr, 10);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (targetColId === "completed") {
      if (!task.completed) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#db4035", "#246fe0", "#ff9900", "#299438"],
        });
        onToggleComplete(taskId);
      }
    } else if (targetColId === "inprogress") {
      if (task.completed) {
        await onToggleComplete(taskId);
      }
      onUpdateTask(taskId, { status: "inprogress" });
    } else if (targetColId === "todo") {
      if (task.completed) {
        await onToggleComplete(taskId);
      }
      // Reset priority to the column's default when moving to To Do
      const newPriority = columns.find((c) => c.id === "todo")?.defaultPriority ?? 4;
      onUpdateTask(taskId, { status: "todo", priority: newPriority });
    }
    setDraggedTaskId(null);
  };

  const handleSaveNew = (taskData, colId) => {
    const status = colId === "inprogress" ? "inprogress" : "todo";
    onCreateTask({
      ...taskData,
      status: status,
    });
    setAddingToColumn(null);
  };

  const handleSaveEdit = (taskData) => {
    onUpdateTask(editingTaskId, taskData);
    setEditingTaskId(null);
  };

  const priorityColors = {
    1: "var(--p1-color)",
    2: "var(--p2-color)",
    3: "var(--p3-color)",
    4: "var(--p4-color)",
  };

  return (
    <div className="kanban-board-container">
      <div className="kanban-board-grid">
        {columns.map((col) => {
          const isOver = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              className={`kanban-column ${isOver ? "drag-over" : ""}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <div className="kanban-col-title-group">
                  <span
                    className="kanban-col-dot"
                    style={{ backgroundColor: col.color }}
                  />
                  <h3 className="kanban-col-title">{col.title}</h3>
                  <span className="kanban-col-count">{col.tasks.length}</span>
                </div>

                {col.id !== "completed" && (
                  <button
                    className="section-icon-btn"
                    onClick={() =>
                      setAddingToColumn(addingToColumn === col.id ? null : col.id)
                    }
                    title={`Add task to ${col.title}`}
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Inline task adder inside column */}
              {addingToColumn === col.id && (
                <div style={{ marginBottom: "12px" }}>
                  <InlineTaskEditor
                    projects={projects}
                    defaultProjectId={selectedProjectId}
                    initialTask={{ priority: col.defaultPriority }}
                    onSave={(data) => handleSaveNew(data, col.id)}
                    onCancel={() => setAddingToColumn(null)}
                  />
                </div>
              )}

              {/* Cards List */}
              <div className="kanban-cards-list">
                {col.tasks.map((task) => {
                  const isEditing = editingTaskId === task.id;
                  const isOverdue =
                    !task.completed &&
                    task.due_date &&
                    task.due_date < todayStr;

                  if (isEditing) {
                    return (
                      <InlineTaskEditor
                        key={task.id}
                        initialTask={task}
                        projects={projects}
                        onSave={handleSaveEdit}
                        onCancel={() => setEditingTaskId(null)}
                      />
                    );
                  }

                  return (
                    <div
                      key={task.id}
                      className={`kanban-card ${task.completed ? "completed" : ""} ${
                        draggedTaskId === task.id ? "dragging" : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => onTaskClick(task)}
                    >
                      {/* Priority left border indicator */}
                      <div
                        className="kanban-card-priority-stripe"
                        style={{
                          backgroundColor: priorityColors[task.priority || 4],
                        }}
                      />

                      <div className="kanban-card-body">
                        {/* Top row: Checkbox + Title + Actions */}
                        <div className="kanban-card-top-row">
                          <button
                            className={`todoist-checkbox p${task.priority || 4} ${
                              task.completed ? "checked" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!task.completed) {
                                confetti({
                                  particleCount: 40,
                                  spread: 50,
                                  origin: { y: 0.7 },
                                  colors: ["#db4035", "#246fe0", "#ff9900"],
                                });
                              }
                              onToggleComplete(task.id);
                            }}
                            title="Complete task"
                          >
                            <Check size={11} strokeWidth={3.5} className="check-icon" />
                          </button>

                          <span
                            className={`kanban-card-title ${
                              task.completed ? "done" : ""
                            }`}
                          >
                            {task.title}
                          </span>

                          <div
                            className="kanban-card-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="kanban-action-btn"
                              onClick={() => setEditingTaskId(task.id)}
                              title="Edit task"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="kanban-action-btn delete"
                              onClick={() => onDeleteTask(task.id)}
                              title="Delete task"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Description Preview */}
                        {task.description && (
                          <p className="kanban-card-desc">{task.description}</p>
                        )}

                        {/* Meta Tags Footer */}
                        <div className="kanban-card-tags">
                          {task.project_name && (
                            <span className="kanban-tag">
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
                          )}

                          {task.due_date && (
                            <span
                              className={`kanban-tag date ${
                                isOverdue ? "overdue" : ""
                              } ${task.due_date === todayStr ? "today" : ""}`}
                            >
                              <Calendar size={11} /> {task.due_date}
                            </span>
                          )}

                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="kanban-tag">
                              <Layers size={11} />{" "}
                              {task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {col.tasks.length === 0 && !addingToColumn && (
                  <div className="kanban-column-empty">
                    <p>No tasks in this column</p>
                    {col.id !== "completed" && (
                      <button
                        className="kanban-add-placeholder-btn"
                        onClick={() => setAddingToColumn(col.id)}
                      >
                        <Plus size={14} /> Add task
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
