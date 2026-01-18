// tasks-complete.tsx
import React, { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
};

type GroupMember = {
  id: string;
  name: string;
  isOnline: boolean;
};

// ----------------------------------------
// Mock Data (replace with your real API)
// ----------------------------------------

const MOCK_MEMBERS: GroupMember[] = [
  { id: "me", name: "My Tasks", isOnline: true },
  { id: "u1", name: "Alex", isOnline: true },
  { id: "u2", name: "Jordan", isOnline: false },
  { id: "u3", name: "Sam", isOnline: true },
];

const MOCK_TASKS: Record<string, Task[]> = {
  me: [
    { id: "t1", title: "Finish report", completed: false, dueDate: "2026-01-20" },
    { id: "t2", title: "Review PR #42", completed: true },
  ],
  u1: [
    { id: "t3", title: "Update design docs", completed: false },
    { id: "t4", title: "Fix navbar bug", completed: true },
  ],
  u2: [
    { id: "t5", title: "Prepare sprint demo", completed: false },
  ],
  u3: [
    { id: "t6", title: "Write unit tests", completed: true },
    { id: "t7", title: "Refactor API calls", completed: false },
  ],
};

// Simulated fetch function — swap this out for your real API call.
async function fetchTasksForUser(userId: string): Promise<Task[]> {
  // Example: replace with fetch(`/api/tasks?userId=${userId}`) etc.
  await new Promise((resolve) => setTimeout(resolve, 200)); // simulate latency
  return MOCK_TASKS[userId] ?? [];
}

// ----------------------------------------
// Page Component
// ----------------------------------------

const TasksCompletePage: React.FC = () => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("me");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load members once (in a real app, fetch them from your backend)
  useEffect(() => {
    setMembers(MOCK_MEMBERS);
  }, []);

  // Fetch tasks whenever the selected user changes
  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTasksForUser(selectedUserId);
        if (!cancelled) {
          setTasks(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load tasks.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };

  const selectedMember = members.find((m) => m.id === selectedUserId);

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "8px" }}>
          Completed Tasks
        </h1>
        <p style={{ color: "#555", margin: 0 }}>
          View your tasks or switch to see a group member’s tasks (online only).
        </p>
      </header>

      {/* User selection (you + online members) */}
      <section
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <label htmlFor="user-select" style={{ fontWeight: 500 }}>
          Viewing tasks for:
        </label>
        <select
          id="user-select"
          value={selectedUserId}
          onChange={handleUserChange}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            minWidth: "220px",
          }}
        >
          {/* First option: you */}
          {members
            .filter((m) => m.id === "me")
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (you)
              </option>
            ))}

          {/* Divider-like disabled option (visual only) */}
          <option disabled>───────────────</option>

          {/* Online group members only */}
          {members
            .filter((m) => m.id !== "me" && m.isOnline)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (online)
              </option>
            ))}
        </select>
      </section>

      {/* Tasks List */}
      <section
        style={{
          borderRadius: "10px",
          border: "1px solid #e0e0e0",
          padding: "16px 20px",
          backgroundColor: "#fafafa",
        }}
      >
        <div
          style={{
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
            {selectedMember?.id === "me"
              ? "Your tasks"
              : `${selectedMember?.name}'s tasks`}
          </h2>
          {selectedMember && selectedMember.id !== "me" && (
            <span
              style={{
                fontSize: "0.85rem",
                color: selectedMember.isOnline ? "#0a7c2f" : "#999",
              }}
            >
              {selectedMember.isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>

        {isLoading && <p>Loading tasks…</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!isLoading && !error && tasks.length === 0 && (
          <p style={{ color: "#666", marginTop: "8px" }}>No tasks to show.</p>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {tasks.map((task) => (
              <li
                key={task.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                <div>
                  <span
                    style={{
                      textDecoration: task.completed ? "line-through" : "none",
                      fontWeight: 500,
                    }}
                  >
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "0.85rem",
                        color: "#777",
                      }}
                    >
                      (due {task.dueDate})
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: task.completed ? "#0a7c2f" : "#b8860b",
                    color: task.completed ? "#0a7c2f" : "#b8860b",
                  }}
                >
                  {task.completed ? "Done" : "In progress"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default TasksCompletePage;
