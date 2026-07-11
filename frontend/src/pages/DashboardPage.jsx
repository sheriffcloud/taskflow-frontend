import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useNotifications from "../hooks/useNotifications";
import api from "../api/client";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";

const COLUMNS = [
  { key: "todo",        label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done",        label: "Done" },
];

const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    tags: "",
  });

  // ── Fetch tasks ─────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Handle incoming notifications ─────────────────────────────────────────
  const handleNotification = useCallback((notification) => {
    // Add to notification list (shown in navbar)
    setNotifications((prev) => [notification, ...prev].slice(0, 10));

    // If a task was created/updated/deleted, refresh the list
    if (["task.created", "task.updated", "task.deleted"].includes(notification.type)) {
      fetchTasks();
    }
  }, [fetchTasks]);

  // ── Connect to SSE stream ────────────────────────────────────────────────
  useNotifications(user?.userId, handleNotification);

  // ── Create task ──────────────────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", {
        ...newTask,
        tags: newTask.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setShowForm(false);
      setNewTask({ title: "", description: "", priority: "medium", due_date: "", tags: "" });
      fetchTasks();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  // Group tasks by status for the kanban columns
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      <Navbar notifications={notifications} />

      <div style={styles.content}>
        <div style={styles.topBar}>
          <h2 style={styles.heading}>Task Board</h2>
          <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Task"}
          </button>
        </div>

        {/* Create task form */}
        {showForm && (
          <form onSubmit={handleCreateTask} style={styles.form}>
            <input
              style={styles.input}
              placeholder="Task title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div style={styles.formRow}>
              <select
                style={styles.select}
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <input
                style={styles.input}
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>
            <input
              style={styles.input}
              placeholder="Tags (comma separated): bug, frontend, urgent"
              value={newTask.tags}
              onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
            />
            <button type="submit" style={styles.submitBtn}>Create Task</button>
          </form>
        )}

        {/* Kanban board */}
        {loading ? (
          <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "60px" }}>
            Loading tasks...
          </p>
        ) : (
          <div style={styles.board}>
            {COLUMNS.map((col) => (
              <div key={col.key} style={styles.column}>
                <div style={styles.columnHeader}>
                  <span style={styles.columnTitle}>{col.label}</span>
                  <span style={styles.columnCount}>{tasksByStatus[col.key].length}</span>
                </div>
                <div style={styles.columnBody}>
                  {tasksByStatus[col.key].length === 0 ? (
                    <p style={styles.emptyColumn}>No tasks here</p>
                  ) : (
                    tasksByStatus[col.key].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={fetchTasks}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "#0f1117" },
  content: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#e2e8f0" },
  createBtn: {
    padding: "8px 18px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  form: {
    background: "#1a1f2e",
    border: "1px solid #2d3748",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  formRow: { display: "flex", gap: "12px" },
  input: {
    padding: "10px 14px",
    background: "#0f1117",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  },
  select: {
    padding: "10px 14px",
    background: "#0f1117",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    flex: 1,
  },
  submitBtn: {
    padding: "10px",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  board: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  column: {
    background: "#141820",
    borderRadius: "12px",
    border: "1px solid #1e2535",
    overflow: "hidden",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid #1e2535",
  },
  columnTitle: { fontSize: "13px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  columnCount: {
    background: "#2d3748",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  columnBody: { padding: "12px" },
  emptyColumn: { color: "#4b5563", fontSize: "13px", textAlign: "center", padding: "20px 0" },
};

export default DashboardPage;