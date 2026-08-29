import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar as CalendarIcon,
  Check,
  Flag,
  Folder,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import InlineTaskEditor from "./InlineTaskEditor";

export default function CalendarView({
  tasks = [],
  projects = [],
  onToggleComplete,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onTaskClick,
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr); // YYYY-MM-DD
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);
  const [isAddingTaskForSelectedDay, setIsAddingTaskForSelectedDay] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(todayStr);
  };

  const handleMonthChange = (newMonthIdx) => {
    setCurrentDate(new Date(year, parseInt(newMonthIdx, 10), 1));
  };

  const handleYearChange = (newYear) => {
    setCurrentDate(new Date(parseInt(newYear, 10), month, 1));
  };

  // Month metadata
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthName = monthNames[month];
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (!showCompleted && task.completed) return false;
    if (selectedProjectFilter === "all") return true;
    if (selectedProjectFilter === "inbox") return !task.project;
    return task.project === parseInt(selectedProjectFilter, 10);
  });

  // Map tasks by due_date: "YYYY-MM-DD" -> [tasks]
  const tasksByDate = {};
  const unscheduledTasks = [];

  filteredTasks.forEach((task) => {
    if (task.due_date) {
      if (!tasksByDate[task.due_date]) {
        tasksByDate[task.due_date] = [];
      }
      tasksByDate[task.due_date].push(task);
    } else {
      unscheduledTasks.push(task);
    }
  });

  // Generate calendar grid cells (42 cells: 6 weeks)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      targetMonth: prevM,
      targetYear: prevY,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      targetMonth: month,
      targetYear: year,
    });
  }

  // Next month leading days to complete 42 cells
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      targetMonth: nextM,
      targetYear: nextY,
    });
  }

  const priorityColors = {
    1: "var(--p1-color)",
    2: "var(--p2-color)",
    3: "var(--p3-color)",
    4: "var(--p4-color)",
  };

  const handleCellClick = (cell) => {
    setSelectedDate(cell.dateStr);
    setIsAddingTaskForSelectedDay(false);
    if (!cell.isCurrentMonth) {
      setCurrentDate(new Date(cell.targetYear, cell.targetMonth, 1));
    }
  };

  const handleCreateTaskForDay = async (taskData) => {
    try {
      await onCreateTask({
        ...taskData,
        due_date: taskData.due_date || selectedDate,
      });
      setIsAddingTaskForSelectedDay(false);
    } catch (err) {
      console.error("Failed to create task for calendar day:", err);
    }
  };

  // Format selected date for display
  const formatSelectedDateTitle = (dateStr) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString("default", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const selectedDayTasks = selectedDate ? tasksByDate[selectedDate] || [] : [];

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="calendar-view-root">
      {/* Calendar Header & Controls */}
      <div className="calendar-header-bar">
        <div className="calendar-title-group">
          {/* Custom Month & Year Picker Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className={`calendar-picker-trigger-btn ${isPickerOpen ? "active" : ""}`}
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              title="Change month or year"
            >
              <CalendarIcon size={18} color="var(--color-primary)" />
              <span className="picker-month-name">{monthName}</span>
              <span className="picker-year-name">{year}</span>
              <ChevronDown
                size={16}
                className={`picker-chevron ${isPickerOpen ? "rotated" : ""}`}
              />
            </button>

            {/* Custom Month & Year Popover Menu */}
            {isPickerOpen && (
              <>
                <div
                  className="calendar-popover-overlay"
                  onClick={() => setIsPickerOpen(false)}
                />
                <div className="calendar-picker-popover-menu">
                  {/* Year Switcher Header */}
                  <div className="popover-year-row">
                    <button
                      className="popover-year-nav-btn"
                      onClick={() => handleYearChange(year - 1)}
                      title="Previous Year"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="popover-current-year">{year}</span>
                    <button
                      className="popover-year-nav-btn"
                      onClick={() => handleYearChange(year + 1)}
                      title="Next Year"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* 12 Months Grid */}
                  <div className="popover-months-grid">
                    {monthNames.map((name, idx) => {
                      const isCurrentActive = idx === month;
                      return (
                        <button
                          key={name}
                          className={`popover-month-cell ${
                            isCurrentActive ? "active" : ""
                          }`}
                          onClick={() => {
                            handleMonthChange(idx);
                            setIsPickerOpen(false);
                          }}
                        >
                          {name.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Year Quick Chips */}
                  <div className="popover-quick-years-row">
                    {[2025, 2026, 2027, 2028].map((y) => (
                      <button
                        key={y}
                        className={`popover-year-chip ${y === year ? "active" : ""}`}
                        onClick={() => handleYearChange(y)}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Nav buttons */}
          <div className="calendar-nav-buttons">
            <button className="calendar-nav-btn" onClick={prevMonth} title="Previous Month">
              <ChevronLeft size={18} />
            </button>
            <button className="calendar-today-btn" onClick={jumpToToday}>
              Today
            </button>
            <button className="calendar-nav-btn" onClick={nextMonth} title="Next Month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Category / Project Filter Chips */}
        <div className="calendar-filter-bar">
          <div className="calendar-project-pills">
            <button
              className={`calendar-filter-pill ${selectedProjectFilter === "all" ? "active" : ""}`}
              onClick={() => setSelectedProjectFilter("all")}
            >
              All Categories ({filteredTasks.length})
            </button>

            <button
              className={`calendar-filter-pill ${selectedProjectFilter === "inbox" ? "active" : ""}`}
              onClick={() => setSelectedProjectFilter("inbox")}
            >
              <Folder size={12} color="#246fe0" />
              <span>Inbox</span>
            </button>

            {projects.map((proj) => (
              <button
                key={proj.id}
                className={`calendar-filter-pill ${
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
                <span>{proj.name}</span>
              </button>
            ))}
          </div>

          <label className="calendar-completed-toggle">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            <span>Show Completed</span>
          </label>
        </div>
      </div>

      {/* Main Calendar Section & Selected Day Inspector */}
      <div className="calendar-layout-grid">
        {/* Calendar Grid Section */}
        <div className="calendar-matrix-wrapper">
          {/* Weekday Headers */}
          <div className="calendar-grid-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="calendar-weekday-cell">
                {day}
              </div>
            ))}
          </div>

          {/* 42-cell Month Grid */}
          <div className="calendar-grid-matrix">
            {calendarCells.map((cell, idx) => {
              const cellTasks = tasksByDate[cell.dateStr] || [];
              const isSelected = selectedDate === cell.dateStr;

              return (
                <div
                  key={idx}
                  className={`calendar-day-tile ${!cell.isCurrentMonth ? "other-month" : ""} ${
                    cell.isToday ? "today-cell" : ""
                  } ${isSelected ? "selected-day-cell" : ""}`}
                  onClick={() => handleCellClick(cell)}
                >
                  {/* Day Number Header */}
                  <div className="calendar-day-header">
                    <span
                      className={`calendar-day-number ${
                        cell.isToday ? "today-number-badge" : ""
                      } ${isSelected && !cell.isToday ? "selected-number-badge" : ""}`}
                    >
                      {cell.day}
                    </span>

                    <button
                      className="calendar-tile-add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(cell.dateStr);
                        setIsAddingTaskForSelectedDay(true);
                      }}
                      title={`Add task for ${cell.dateStr}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Tasks List for Date */}
                  <div className="calendar-day-tasks">
                    {cellTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`calendar-task-chip ${task.completed ? "completed" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(cell.dateStr);
                          onTaskClick(task);
                        }}
                        title={`${task.title} ${task.project_name ? `• #${task.project_name}` : ""}`}
                      >
                        <span
                          className="calendar-task-priority-dot"
                          style={{ backgroundColor: priorityColors[task.priority || 4] }}
                        />

                        <button
                          className={`todoist-checkbox p${task.priority || 4} ${
                            task.completed ? "checked" : ""
                          }`}
                          style={{ width: "13px", height: "13px", marginRight: "3px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!task.completed) {
                              confetti({
                                particleCount: 35,
                                spread: 50,
                                origin: { y: 0.6 },
                              });
                            }
                            onToggleComplete(task.id);
                          }}
                        >
                          <Check size={8} strokeWidth={4} className="check-icon" />
                        </button>

                        <span
                          className={`calendar-task-chip-title ${
                            task.completed ? "done" : ""
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Panel */}
        {selectedDate && (
          <div className="calendar-day-inspector">
            <div className="day-inspector-header">
              <div>
                <span className="day-inspector-sub">Selected Day</span>
                <h3 className="day-inspector-title">
                  {formatSelectedDateTitle(selectedDate)}
                </h3>
              </div>

              <span className="day-inspector-count-badge">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>

            {/* Inline task creator for the selected day */}
            {isAddingTaskForSelectedDay ? (
              <div style={{ margin: "10px 0" }}>
                <InlineTaskEditor
                  projects={projects}
                  defaultDueDate={selectedDate}
                  onSave={handleCreateTaskForDay}
                  onCancel={() => setIsAddingTaskForSelectedDay(false)}
                />
              </div>
            ) : (
              <button
                className="day-inspector-add-btn"
                onClick={() => setIsAddingTaskForSelectedDay(true)}
              >
                <Plus size={15} />
                <span>Add task for this day</span>
              </button>
            )}

            {/* List of tasks for this selected day */}
            <div className="day-inspector-tasks-list">
              {selectedDayTasks.length === 0 ? (
                <div className="day-inspector-empty">
                  <CalendarIcon size={28} color="var(--text-muted)" />
                  <p>No tasks scheduled on this date.</p>
                </div>
              ) : (
                selectedDayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="day-inspector-task-item"
                    onClick={() => onTaskClick(task)}
                  >
                    <button
                      className={`todoist-checkbox p${task.priority || 4} ${
                        task.completed ? "checked" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!task.completed) {
                          confetti({ particleCount: 30, spread: 50 });
                        }
                        onToggleComplete(task.id);
                      }}
                    >
                      <Check size={10} strokeWidth={3} className="check-icon" />
                    </button>

                    <div className="day-inspector-task-info">
                      <span
                        className={`day-inspector-task-title ${
                          task.completed ? "done" : ""
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <p className="day-inspector-task-desc">{task.description}</p>
                      )}
                      <div className="day-inspector-task-meta">
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
                        <span
                          className="kanban-tag"
                          style={{ color: priorityColors[task.priority || 4] }}
                        >
                          P{task.priority || 4}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Unscheduled Tasks Drawer */}
      {unscheduledTasks.length > 0 && (
        <div className="calendar-unscheduled-tray">
          <div className="calendar-tray-header">
            <span
              style={{
                fontWeight: 700,
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Clock size={15} color="var(--text-muted)" /> Unscheduled Tasks (
              {unscheduledTasks.length})
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Click any task to schedule or view details
            </span>
          </div>

          <div className="calendar-tray-tasks-row">
            {unscheduledTasks.map((task) => (
              <div
                key={task.id}
                className="calendar-unscheduled-card"
                onClick={() => onTaskClick(task)}
              >
                <span
                  className="calendar-task-priority-dot"
                  style={{ backgroundColor: priorityColors[task.priority || 4] }}
                />
                <span style={{ fontSize: "0.84rem", fontWeight: 500, flex: 1 }}>
                  {task.title}
                </span>
                {task.project_name && (
                  <span className="calendar-tag" style={{ fontSize: "0.7rem" }}>
                    {task.project_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
