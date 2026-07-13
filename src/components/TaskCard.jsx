import api from "../api/client";

const STATUS_COLORS = {
  todo:        { bg: "#1e293b", text: "#94a3b8", label: "To Do" },
  "in-progress": { bg: "#1e3a5f", text: "#60a5fa", label: "In Progress" },
  done:        { bg: "#14532d", text: "#4ade80", label: "Done" },
};

const PRIORITY_COLORS = {
  low:    "#4ade80",
  medium: "#facc15",
  high:   "#fb923c",
  urgent: "#f87171",
};

const TaskCard = ({ task, onStatusChange }) => {
  const statusInfo = STATUS_COLORS[task.status] || STATUS_COLORS.todo;

  const cycleStatus = async () => {
    // Clicking a task card cycles its status: todo → in-progress → done → todo
    const nextStatus = {
      todo: "in-progress",
      "in-progress": "done",
      done: "todo",
    }[task.status];

    try {
      await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      onStatusChange(); // tell parent to refresh the task list
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div style={styles.card} onClick={cycleStatus} title="Click to cycle status">
      <div style={styles.header}>
        <span
          style={{
            ...styles.priorityDot,
            background: PRIORITY_COLORS[task.priority] || "#94a3b8",
          }}
        />
        <span
          style={{
            ...styles.statusBadge,
            background: statusInfo.bg,
            color: statusInfo.text,
          }}
        >
          {statusInfo.label}
        </span>
      </div>

      <p style={styles.title}>{task.title}</p>

      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      {task.due_date && (
        <p style={styles.dueDate}>
          Due: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}

      {task.tags?.length > 0 && (
        <div style={styles.tags}>
          {task.tags.map((tag) => (
            <span key={tag} style={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: "#1a1f2e",
    border: "1px solid #2d3748",
    borderRadius: "10px",
    padding: "16px",
    cursor: "pointer",
    transition: "border-color 0.2s",
    marginBottom: "12px",
  },
  header: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  priorityDot: { width: "8px", height: "8px", borderRadius: "50%" },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  title: { fontSize: "14px", fontWeight: "600", color: "#e2e8f0", marginBottom: "6px" },
  description: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "8px",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  dueDate: { fontSize: "11px", color: "#64748b", marginBottom: "8px" },
  tags: { display: "flex", flexWrap: "wrap", gap: "4px" },
  tag: {
    fontSize: "10px",
    color: "#6366f1",
    background: "#1e1b4b",
    padding: "2px 6px",
    borderRadius: "4px",
  },
};

export default TaskCard;