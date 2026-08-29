import React, { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TaskList from "./components/TaskList";
import TaskDetailModal from "./components/TaskDetailModal";
import QuickAddModal from "./components/QuickAddModal";
import SearchModal from "./components/SearchModal";
import ProjectModal from "./components/ProjectModal";
import LandingPage from "./components/LandingPage";
import ProductivityModal from "./components/ProductivityModal";
import CalendarView from "./components/CalendarView";
import CompletedView from "./components/CompletedView";

import { authService } from "./services/authService";
import { taskService } from "./services/taskService";
import { projectService } from "./services/projectService";
import { statsService } from "./services/statsService";

export default function App() {
  // Authentication state - starts null so landing page opens by default on initial URL load
  const [user, setUser] = useState(authService.getUserFromStorage());
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Navigation & View state
  const [activeView, setActiveView] = useState("inbox"); // inbox, today, upcoming, calendar, project, priority_1, completed
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth > 768 : true
  );

  // Data state
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [taskCounts, setTaskCounts] = useState({ inbox: 0, today: 0 });

  // Modals & Drawers state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isProductivityOpen, setIsProductivityOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);

  // Theme state
  const [theme, setTheme] = useState(
    localStorage.getItem("todoist_theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("todoist_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Verify auth on mount
  useEffect(() => {
    // Clear legacy localStorage so visiting the URL presents the Landing/Login screen
    localStorage.removeItem("todoist_access_token");
    localStorage.removeItem("todoist_refresh_token");
    localStorage.removeItem("todoist_user");

    const sessionUser = authService.getUserFromStorage();
    if (sessionUser && authService.isAuthenticated()) {
      setUser(sessionUser);
    } else {
      setUser(null);
    }
    setCheckingAuth(false);
  }, []);

  // Fetch Projects
  const loadProjects = useCallback(async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, []);

  // Fetch Stats & Counts
  const loadStats = useCallback(async () => {
    try {
      const data = await statsService.getStats();
      setStats(data);
      // Fetch badge counts
      const [inboxTasks, todayTasks] = await Promise.all([
        taskService.getTasks({ view: "inbox" }),
        taskService.getTasks({ view: "today" }),
      ]);
      setTaskCounts({
        inbox: inboxTasks.length,
        today: todayTasks.length,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  // Fetch Tasks for current view
  const loadTasks = useCallback(async () => {
    try {
      let data = [];
      if (activeView === "calendar") {
        data = await taskService.getTasks({ view: "calendar", include_completed: true });
      } else if (activeView === "project" && selectedProjectId) {
        data = await taskService.getTasks({ projectId: selectedProjectId });
      } else if (activeView === "priority_1") {
        data = await taskService.getTasks({ priority: 1 });
      } else {
        data = await taskService.getTasks({ view: activeView });
      }
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, [activeView, selectedProjectId]);

  useEffect(() => {
    if (user) {
      loadProjects();
      loadStats();
      loadTasks();
    }
  }, [user, activeView, selectedProjectId, loadProjects, loadStats, loadTasks]);

  // Global Keyboard Shortcuts (Q, Ctrl+K, M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in input or textarea
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key.toLowerCase() === "q") {
        e.preventDefault();
        setIsQuickAddOpen(true);
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Task Operations
  const handleCreateTask = async (taskData) => {
    try {
      const created = await taskService.createTask(taskData);
      await Promise.all([loadTasks(), loadProjects(), loadStats()]);
      return created;
    } catch (err) {
      console.error("Failed to create task:", err);
      throw err;
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const updated = await taskService.updateTask(id, taskData);
      await Promise.all([loadTasks(), loadProjects(), loadStats()]);
      if (selectedTaskForDetail && selectedTaskForDetail.id === id) {
        setSelectedTaskForDetail(updated);
      }
      return updated;
    } catch (err) {
      console.error("Failed to update task:", err);
      throw err;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      loadTasks();
      loadProjects();
      loadStats();
      if (selectedTaskForDetail && selectedTaskForDetail.id === id) {
        setSelectedTaskForDetail(null);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await taskService.toggleComplete(id);
      loadTasks();
      loadProjects();
      loadStats();
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
    }
  };

  const handleAddSubtask = async (parentId, title) => {
    try {
      const subtask = await taskService.addSubtask(parentId, title);
      loadTasks();
      return subtask;
    } catch (err) {
      console.error("Failed to add subtask:", err);
      return null;
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      await taskService.toggleComplete(subtaskId);
      if (selectedTaskForDetail) {
        const updated = await taskService.getTask(selectedTaskForDetail.id);
        setSelectedTaskForDetail(updated);
      }
      loadTasks();
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  // Project Operations
  const handleSaveProject = async (projectData) => {
    try {
      let result;
      if (editingProject) {
        result = await projectService.updateProject(editingProject.id, projectData);
      } else {
        result = await projectService.createProject(projectData);
        setSelectedProjectId(result.id);
        setActiveView("project");
      }
      setIsProjectModalOpen(false);
      setEditingProject(null);
      await loadProjects();
      return result;
    } catch (err) {
      console.error("Failed to save project:", err);
      throw err;
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      setIsProjectModalOpen(false);
      setEditingProject(null);
      setActiveView("inbox");
      setSelectedProjectId(null);
      loadProjects();
      loadTasks();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // Auth Operations
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setProjects([]);
    setTasks([]);
    setStats(null);
  };

  const handleAuthSuccess = async () => {
    const u = await authService.getCurrentUser();
    setUser(u);
  };

  // If user is not authenticated, render the official Todoist-style Landing Introduction Page
  if (!user && !checkingAuth) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (checkingAuth) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-app)",
          color: "var(--text-muted)",
          fontSize: "0.95rem",
        }}
      >
        Loading Todoist...
      </div>
    );
  }

  // Determine Title for current view
  const getViewTitle = () => {
    if (activeView === "inbox") return "Inbox";
    if (activeView === "today") return "Today";
    if (activeView === "upcoming") return "Upcoming";
    if (activeView === "calendar") return "Calendar";
    if (activeView === "priority_1") return "Priority 1";
    if (activeView === "completed") return "Completed Archive";
    if (activeView === "project") {
      const proj = projects.find((p) => p.id === selectedProjectId);
      return proj ? proj.name : "Project";
    }
    return "Tasks";
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuth={() => {}}
        onOpenProductivity={() => setIsProductivityOpen(true)}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        stats={stats}
      />

      {/* Main Layout Area */}
      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeView={activeView}
          setActiveView={setActiveView}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          projects={projects}
          onOpenProjectModal={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          onEditProject={(proj) => {
            setEditingProject(proj);
            setIsProjectModalOpen(true);
          }}
          onDeleteProject={handleDeleteProject}
          taskCounts={taskCounts}
        />

        {/* Main Content Workspace */}
        <main className="content-workspace">
          {activeView === "calendar" ? (
            <div className="workspace-inner board-mode-active">
              <CalendarView
                tasks={tasks}
                projects={projects}
                onToggleComplete={handleToggleComplete}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onTaskClick={(task) => setSelectedTaskForDetail(task)}
              />
            </div>
          ) : activeView === "completed" ? (
            <div className="workspace-inner">
              <CompletedView
                tasks={tasks}
                projects={projects}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onTaskClick={(task) => setSelectedTaskForDetail(task)}
              />
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              activeView={activeView}
              viewTitle={getViewTitle()}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onToggleComplete={handleToggleComplete}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onTaskClick={(task) => setSelectedTaskForDetail(task)}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        projects={projects}
        onCreateTask={handleCreateTask}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTask={(task) => setSelectedTaskForDetail(task)}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        project={editingProject}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />

      <TaskDetailModal
        task={selectedTaskForDetail}
        projects={projects}
        onClose={() => setSelectedTaskForDetail(null)}
        onUpdateTask={handleUpdateTask}
        onAddSubtask={handleAddSubtask}
        onToggleSubtask={handleToggleSubtask}
      />

      <ProductivityModal
        isOpen={isProductivityOpen}
        onClose={() => setIsProductivityOpen(false)}
        stats={stats}
      />
    </div>
  );
}