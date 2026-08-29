import React, { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle2,
  Inbox,
  Calendar,
  AlertCircle,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import TaskItem from "./TaskItem";
import InlineTaskEditor from "./InlineTaskEditor";
import KanbanBoard from "./KanbanBoard";
import CalendarView from "./CalendarView";

export default function TaskList({
  tasks,
  activeView,
  viewTitle,
  projects,
  selectedProjectId,
  onToggleComplete,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onTaskClick,
}) {
  const [layoutMode, setLayoutMode] = useState(
    () => localStorage.getItem("taskflow_layout_mode") || "list"
  );
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showCompletedList, setShowCompletedList] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    localStorage.setItem("taskflow_layout_mode", layoutMode);
  }, [layoutMode]);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Group tasks for Today view (Overdue vs Today)
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.due_date && t.due_date < todayStr
  );
  const todayTasks = tasks.filter(
    (t) => !t.completed && (!t.due_date || t.due_date >= todayStr)
  );

  const handleSaveNew = (taskData) => {
    onCreateTask(taskData);
    setIsAddingTask(false);
  };

  const handleSaveEdit = (taskData) => {
    onUpdateTask(editingTaskId, taskData);
    setEditingTaskId(null);
  };

  const getEmptyStateContent = () => {
    if (activeView === "inbox") {
      return {
        icon: <Inbox size={32} color="#246fe0" />,
        title: "Your inbox is empty",
        desc: "All tasks are captured and organized. Enjoy your clarity of mind!",
      };
    }
    if (activeView === "today") {
      return {
        icon: <CheckCircle2 size={32} color="#058527" />,
        title: "All done for today!",
        desc: "You have completed all tasks scheduled for today. Relax and recharge.",
      };
    }
    if (activeView === "completed") {
      return {
        icon: <CheckCircle2 size={32} color="var(--color-primary)" />,
        title: "No completed tasks yet",
        desc: "Check off your tasks to see them archived here and boost your Karma.",
      };
    }
    return {
      icon: <CheckCircle2 size={32} color="var(--color-primary)" />,
      title: "No tasks here",
      desc: "Get started by adding a task to this list.",
    };
  };

  const emptyState = getEmptyStateContent();

  const listItemsToRender =
    activeView === "today"
      ? todayTasks
      : activeView === "completed"
      ? completedTasks
      : activeTasks;

  return (
    <div className={`workspace-inner ${layoutMode !== "list" ? "board-mode-active" : ""}`}>
      {/* View Header with List / Board Switcher */}
      <div className="view-header">
        <div className="view-title-group">
          <h1 className="view-title">{viewTitle}</h1>
          <span className="view-count-badge">
            {activeView === "completed" ? completedTasks.length : activeTasks.length}{" "}
            {(activeView === "completed" ? completedTasks.length : activeTasks.length) === 1
              ? "task"
              : "tasks"}
          </span>
        </div>

        {/* List ↔ Board View Switcher Pills */}
        <div className="view-switcher-group">
          <button
            className={`view-switcher-btn ${layoutMode === "list" ? "active" : ""}`}
            onClick={() => setLayoutMode("list")}
            title="List View"
          >
            <List size={15} />
            <span className="view-switcher-label">List</span>
          </button>
          <button
            className={`view-switcher-btn ${layoutMode === "board" ? "active" : ""}`}
            onClick={() => setLayoutMode("board")}
            title="Kanban Board View"
          >
            <LayoutGrid size={15} />
            <span className="view-switcher-label">Board</span>
          </button>
        </div>
      </div>

      {/* Render Kanban Board if layout is 'board' */}
      {layoutMode === "board" ? (
        <KanbanBoard
          tasks={tasks}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onToggleComplete={onToggleComplete}
          onCreateTask={onCreateTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onTaskClick={onTaskClick}
        />
      ) : (
        /* Standard List View */
        <>
          {/* Overdue Section in Today View */}
          {activeView === "today" && overdueTasks.length > 0 && (
            <div className="task-list-group">
              <div className="task-group-header overdue">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertCircle size={15} /> Overdue
                </span>
                <span>{overdueTasks.length}</span>
              </div>

              {overdueTasks.map((task) =>
                editingTaskId === task.id ? (
                  <InlineTaskEditor
                    key={task.id}
                    initialTask={task}
                    projects={projects}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingTaskId(null)}
                  />
                ) : (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDeleteTask}
                    onEdit={() => setEditingTaskId(task.id)}
                    onClick={() => onTaskClick(task)}
                  />
                )
              )}
            </div>
          )}

          {/* Regular Tasks Section */}
          <div className="task-list-group">
            {activeView === "today" && overdueTasks.length > 0 && (
              <div className="task-group-header">
                <span>Today</span>
                <span>{todayTasks.length}</span>
              </div>
            )}

            {listItemsToRender.map((task) =>
              editingTaskId === task.id ? (
                <InlineTaskEditor
                  key={task.id}
                  initialTask={task}
                  projects={projects}
                  onSave={handleSaveEdit}
                  onCancel={() => setEditingTaskId(null)}
                />
              ) : (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDeleteTask}
                  onEdit={() => setEditingTaskId(task.id)}
                  onClick={() => onTaskClick(task)}
                />
              )
            )}
          </div>

          {/* Completed collapsible section in list mode if there are completed tasks */}
          {activeView !== "completed" && completedTasks.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={() => setShowCompletedList(!showCompletedList)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  padding: "6px 0",
                }}
              >
                {showCompletedList ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                <span>Completed ({completedTasks.length})</span>
              </button>

              {showCompletedList && (
                <div className="task-list-group" style={{ opacity: 0.8, marginTop: "4px" }}>
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDeleteTask}
                      onEdit={() => setEditingTaskId(task.id)}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {listItemsToRender.length === 0 && !isAddingTask && (
            <div className="empty-state">
              <div className="empty-state-icon">{emptyState.icon}</div>
              <h4>{emptyState.title}</h4>
              <p>{emptyState.desc}</p>
            </div>
          )}

          {/* Inline Add Task Form or Button */}
          {activeView !== "completed" &&
            (isAddingTask ? (
              <InlineTaskEditor
                projects={projects}
                defaultProjectId={selectedProjectId}
                onSave={handleSaveNew}
                onCancel={() => setIsAddingTask(false)}
              />
            ) : (
              <button
                className="add-task-inline-trigger"
                onClick={() => setIsAddingTask(true)}
              >
                <div className="plus-circle">
                  <Plus size={16} strokeWidth={2.5} />
                </div>
                <span>Add task</span>
              </button>
            ))}
        </>
      )}
    </div>
  );
}
