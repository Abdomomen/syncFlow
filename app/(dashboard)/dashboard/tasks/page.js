"use client";

import { useState, useEffect } from "react";
import { useTokenSync } from "@/app/store/context";
import fetching from "@/app/store/fetchMiddleware";

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState([]);
  const [checked, setChecked] = useState({});
  const token = useTokenSync((s) => s.token);
  const setToken = useTokenSync((s) => s.setToken);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: "", desc: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch all tasks ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const url = searchQuery
          ? `/api/users/tasks/search?query=${encodeURIComponent(searchQuery)}`
          : "/api/users/tasks?limit=1000";

        if (searchQuery) setIsSearching(true);
        setSearchError("");

        const res = await fetching(url, "GET", null, token);
        if (res && res.newToken) setToken(res.newToken);

        if (res && (res.tasks || res.success)) {
          const tasks = res.tasks || [];
          setAllTasks(tasks);
          const initialChecked = {};
          tasks.forEach((t) => {
            if (t.status) initialChecked[t._id] = true;
          });
          setChecked(initialChecked);
        } else {
          setSearchError(res?.error || res?.message || "Search failed");
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setSearchError("Network error occurred");
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(
      () => {
        fetchTasks();
      },
      searchQuery ? 500 : 0,
    );

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  // --- Toggle Complete (PATCH) ---
  const toggleCheck = async (id, currentStatus) => {
    // Optimistic update
    setChecked((prev) => ({ ...prev, [id]: !currentStatus }));
    setAllTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: !currentStatus } : t)),
    );
    try {
      const res = await fetching(
        `/api/users/tasks/${id}`,
        "PATCH",
        null,
        token,
      );
      if (res && res.newToken) setToken(res.newToken);
      if (!res || !res.success) {
        // Rollback on failure
        setChecked((prev) => ({ ...prev, [id]: currentStatus }));
        setAllTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, status: currentStatus } : t)),
        );
      }
    } catch (err) {
      setChecked((prev) => ({ ...prev, [id]: currentStatus }));
      setAllTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: currentStatus } : t)),
      );
    }
  };

  // --- Delete Task (DELETE) ---
  const deleteTask = async (id) => {
    const prev = allTasks;
    setAllTasks((prev) => prev.filter((t) => t._id !== id)); // Optimistic remove
    try {
      const res = await fetching(
        `/api/users/tasks/${id}`,
        "DELETE",
        null,
        token,
      );
      if (res && res.newToken) setToken(res.newToken);
      if (!res || !res.success) setAllTasks(prev); // Rollback
    } catch (err) {
      setAllTasks(prev);
    }
  };

  // --- Create Task (POST) ---
  const handleCreate = async () => {
    setFormError("");
    if (!formData.title.trim()) return setFormError("Title is required.");
    setSubmitting(true);
    try {
      const res = await fetching(
        "/api/users/tasks",
        "POST",
        { title: formData.title, desc: formData.desc },
        token,
      );
      if (res && res.newToken) setToken(res.newToken);
      if (res && res.success && res.task) {
        setAllTasks((prev) => [res.task, ...prev]);
        setShowCreateModal(false);
        setFormData({ title: "", desc: "" });
      } else {
        setFormError(res?.message || "Failed to create task.");
      }
    } catch (err) {
      setFormError("Network error.");
    }
    setSubmitting(false);
  };

  // --- Edit Task (PUT) ---
  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, desc: task.desc || "" });
    setFormError("");
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    setFormError("");
    if (!formData.title.trim()) return setFormError("Title is required.");
    setSubmitting(true);
    try {
      const res = await fetching(
        `/api/users/tasks/${editingTask._id}`,
        "PUT",
        { title: formData.title, desc: formData.desc },
        token,
      );
      if (res && res.newToken) setToken(res.newToken);
      if (res && res.success && res.task) {
        setAllTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? res.task : t)),
        );
        setShowEditModal(false);
        setEditingTask(null);
      } else {
        setFormError(res?.message || "Failed to update task.");
      }
    } catch (err) {
      setFormError("Network error.");
    }
    setSubmitting(false);
  };

  return (
    <main className="p-6 space-y-6 max-w-[1440px] mx-auto w-full">
      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="border rounded-xl p-6 w-full max-w-md space-y-4"
            style={{ backgroundColor: "#131315", borderColor: "#27272a" }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="font-semibold text-lg"
                style={{ color: "#fafafa" }}
              >
                Create Task
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormError("");
                  setFormData({ title: "", desc: "" });
                }}
                style={{ color: "#71717a" }}
                className="hover:text-white transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  close
                </span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#71717a" }}
                >
                  Title
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  placeholder="Task title..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#71717a" }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  placeholder="Optional description..."
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, desc: e.target.value }))
                  }
                />
              </div>
              {formError && (
                <p className="text-xs" style={{ color: "#ef4444" }}>
                  {formError}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormError("");
                  setFormData({ title: "", desc: "" });
                }}
                className="px-4 py-2 text-xs rounded-lg border transition-colors"
                style={{ borderColor: "#27272a", color: "#71717a" }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-4 py-2 text-xs rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#8b5cf6", color: "#fff" }}
              >
                {submitting ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="border rounded-xl p-6 w-full max-w-md space-y-4"
            style={{ backgroundColor: "#131315", borderColor: "#27272a" }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="font-semibold text-lg"
                style={{ color: "#fafafa" }}
              >
                Edit Task
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                  setFormError("");
                }}
                style={{ color: "#71717a" }}
                className="hover:text-white transition-colors"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px" }}
                >
                  close
                </span>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#71717a" }}
                >
                  Title
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#71717a" }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm resize-none"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, desc: e.target.value }))
                  }
                />
              </div>
              {formError && (
                <p className="text-xs" style={{ color: "#ef4444" }}>
                  {formError}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                  setFormError("");
                }}
                className="px-4 py-2 text-xs rounded-lg border transition-colors"
                style={{ borderColor: "#27272a", color: "#71717a" }}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={submitting}
                className="px-4 py-2 text-xs rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#8b5cf6", color: "#fff" }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-semibold text-4xl" style={{ color: '#fafafa', letterSpacing: '-0.02em' }}>Tasks</h2>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>Manage and track your workflow projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200" 
              style={{ color: searchQuery ? '#8b5cf6' : '#52525b' }}>
              search
            </span>
            <input 
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all duration-200 outline-none w-full md:w-[280px]"
              style={{ 
                backgroundColor: '#131315', 
                borderColor: searchQuery ? '#8b5cf6' : '#27272a', 
                color: '#fafafa',
                boxShadow: searchQuery ? '0 0 0 1px rgba(139,92,246,0.2)' : 'none'
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-t-transparent border-violet-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <button onClick={() => { setShowCreateModal(true); setFormData({ title: '', desc: '' }); setFormError(''); }}
            className="text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm whitespace-nowrap"
            style={{ backgroundColor: '#8b5cf6', boxShadow: '0 4px 20px rgba(139,92,246,0.15)' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#7c4dff'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {searchError && (
        <div className="p-3 rounded-lg border flex items-center gap-2" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          <p className="text-xs font-medium">{searchError}</p>
        </div>
      )}

      {/* Tasks Table */}
      <div
        className="border rounded-xl overflow-hidden"
        style={{ backgroundColor: "#131315", borderColor: "#27272a" }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #27272a",
                backgroundColor: "rgba(14,14,16,0.5)",
              }}
            >
              <th
                className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#71717a", fontFamily: "Geist, sans-serif" }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded cursor-pointer"
                    style={{ accentColor: "#8b5cf6" }}
                  />
                  <span>Task Title</span>
                </div>
              </th>
              <th
                className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#71717a", fontFamily: "Geist, sans-serif" }}
              >
                Status
              </th>
              <th
                className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "#71717a", fontFamily: "Geist, sans-serif" }}
              >
                Created
              </th>
              <th
                className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-right"
                style={{ color: "#71717a", fontFamily: "Geist, sans-serif" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {allTasks.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-12 text-sm"
                  style={{ color: "#71717a" }}
                >
                  No tasks yet. Create your first task.
                </td>
              </tr>
            ) : (
              allTasks.map((task) => {
                const isCompleted = task.status;
                const statusText = isCompleted ? "Completed" : "Pending";
                const statusColor = isCompleted ? "#10b981" : "#f59e0b";
                const statusBg = isCompleted
                  ? "rgba(16,185,129,0.1)"
                  : "rgba(245,158,11,0.1)";
                const statusBorder = isCompleted
                  ? "rgba(16,185,129,0.2)"
                  : "rgba(245,158,11,0.2)";
                const formattedDate = new Date(
                  task.createdAt,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const isChecked = !!checked[task._id];

                return (
                  <tr
                    key={task._id}
                    className="group transition-colors cursor-default"
                    style={{
                      borderBottom: "1px solid #27272a",
                      backgroundColor: isChecked
                        ? "rgba(139,92,246,0.05)"
                        : "transparent",
                    }}
                    onMouseOver={(e) => {
                      if (!isChecked)
                        e.currentTarget.style.backgroundColor = "#18181b";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = isChecked
                        ? "rgba(139,92,246,0.05)"
                        : "transparent";
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="rounded cursor-pointer"
                          checked={isChecked}
                          onChange={() => toggleCheck(task._id, isCompleted)}
                          style={{ accentColor: "#8b5cf6" }}
                        />
                        <div>
                          <span
                            className="text-sm font-medium block"
                            style={{
                              color: isChecked ? "#71717a" : "#fafafa",
                              textDecoration: isChecked
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {task.title}
                          </span>
                          {task.desc && (
                            <span
                              className="text-xs"
                              style={{ color: "#52525b" }}
                            >
                              {task.desc}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                        style={{
                          color: statusColor,
                          backgroundColor: statusBg,
                          borderColor: statusBorder,
                        }}
                      >
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: statusColor }}
                        ></span>
                        {statusText}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-xs"
                      style={{ color: "#cbc3d7" }}
                    >
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(task)}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: "#71717a" }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#353437";
                            e.currentTarget.style.color = "#8b5cf6";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#71717a";
                          }}
                          title="Edit task"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "17px" }}
                          >
                            edit
                          </span>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: "#71717a" }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(239,68,68,0.1)";
                            e.currentTarget.style.color = "#ef4444";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "#71717a";
                          }}
                          title="Delete task"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "17px" }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs" style={{ color: "#71717a" }}>
          <span style={{ color: "#fafafa" }}>{allTasks.length}</span> tasks
          total —&nbsp;
          <span style={{ color: "#10b981" }}>
            {allTasks.filter((t) => t.status).length} completed
          </span>
          ,&nbsp;
          <span style={{ color: "#f59e0b" }}>
            {allTasks.filter((t) => !t.status).length} pending
          </span>
        </p>
      </div>
    </main>
  );
}
