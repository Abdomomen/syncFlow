"use client";

import { useState, useEffect } from "react";
import { useTokenSync } from "@/app/store/context";
import fetching from "@/app/store/fetchMiddleware";

export default function SubscriptionsPage() {
  const [allSubs, setAllSubs] = useState([]);
  const token = useTokenSync((s) => s.token);
  const setToken = useTokenSync((s) => s.setToken);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [formData, setFormData] = useState({ title: "", price: "", next: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch all subs ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const url = searchQuery
          ? `/api/users/subs/search?query=${encodeURIComponent(searchQuery)}`
          : "/api/users/subs?limit=1000";

        if (searchQuery) setIsSearching(true);
        setSearchError("");

        const res = await fetching(url, "GET", null, token);
        if (res && res.newToken) setToken(res.newToken);

        if (res && (res.subs || res.success)) {
          setAllSubs(res.subs || []);
        } else {
          setSearchError(res?.error || res?.message || "Search failed");
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
        setSearchError("Network error occurred");
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(
      () => {
        fetchSubs();
      },
      searchQuery ? 500 : 0,
    );

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  // --- Delete Sub (DELETE) ---
  const deleteSub = async (id) => {
    const prev = allSubs;
    setAllSubs((prev) => prev.filter((s) => s._id !== id)); // Optimistic remove
    try {
      const res = await fetching(
        `/api/users/subs/${id}`,
        "DELETE",
        null,
        token,
      );
      if (res && res.newToken) setToken(res.newToken);
      if (!res || !res.success) setAllSubs(prev); // Rollback
    } catch (err) {
      setAllSubs(prev);
    }
  };

  // --- Create Sub (POST) ---
  const handleCreate = async () => {
    setFormError("");
    if (!formData.title.trim() || !formData.price || !formData.next)
      return setFormError("All fields are required.");
    setSubmitting(true);
    try {
      const res = await fetching(
        "/api/users/subs",
        "POST",
        { title: formData.title, price: formData.price, next: formData.next },
        token,
      );
      if (res && res.newToken) setToken(res.newToken);
      if (res && res.success && res.sub) {
        setAllSubs((prev) => [res.sub, ...prev]);
        setShowCreateModal(false);
        setFormData({ title: "", price: "", next: "" });
      } else {
        setFormError(
          typeof res?.message === "string"
            ? res.message
            : "Validation error. Check your input.",
        );
      }
    } catch (err) {
      setFormError("Network error.");
    }
    setSubmitting(false);
  };

  // --- Edit Sub (PUT) ---
  const openEdit = (sub) => {
    setEditingSub(sub);
    const nextDate = new Date(sub.next);
    const formatted = nextDate.toISOString().split("T")[0];
    setFormData({ title: sub.title, price: sub.price, next: formatted });
    setFormError("");
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    setFormError("");
    if (!formData.title.trim() || !formData.price || !formData.next)
      return setFormError("All fields are required.");
    setSubmitting(true);
    try {
      const res = await fetching(
        `/api/users/subs/${editingSub._id}`,
        "PUT",
        { title: formData.title, price: formData.price, next: formData.next },
        token,
      );
      if (res && res.newToken) setToken(res.newToken);
      if (res && res.success && res.sub) {
        setAllSubs((prev) =>
          prev.map((s) => (s._id === editingSub._id ? res.sub : s)),
        );
        setShowEditModal(false);
        setEditingSub(null);
      } else {
        setFormError(
          typeof res?.message === "string" ? res.message : "Validation error.",
        );
      }
    } catch (err) {
      setFormError("Network error.");
    }
    setSubmitting(false);
  };

  // --- Computed stats ---
  const totalMonthlySpend = allSubs.reduce(
    (acc, s) => acc + parseFloat(s.price || 0),
    0,
  );
  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(now.getDate() + 7);
  const upcomingCount = allSubs.filter((s) => {
    const d = new Date(s.next);
    return d >= now && d <= in7Days;
  }).length;
  const overdueCount = allSubs.filter((s) => new Date(s.next) < now).length;

  const summaryStats = [
    {
      label: "Monthly Spend",
      value: `$${totalMonthlySpend.toFixed(2)}`,
      meta: `${allSubs.length} subscriptions`,
      metaColor: "#71717a",
      icon: null,
    },
    {
      label: "Active Licenses",
      value: allSubs.length.toString(),
      meta: "Total tracked",
      metaColor: "#71717a",
      icon: null,
    },
    {
      label: "Upcoming Renewals",
      value: upcomingCount.toString(),
      meta: "Next 7 days",
      metaColor: "#f59e0b",
      icon: "event",
    },
    {
      label: "Overdue",
      value: overdueCount.toString(),
      meta: overdueCount > 0 ? "Attention needed" : "All good",
      metaColor: overdueCount > 0 ? "#ef4444" : "#10b981",
      icon: overdueCount > 0 ? "error" : "check_circle",
      valueColor: overdueCount > 0 ? "#ef4444" : "#fafafa",
    },
  ];

  return (
    <main className="p-6 space-y-8 max-w-[1440px] mx-auto w-full">
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
                Add Subscription
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormError("");
                  setFormData({ title: "", price: "", next: "" });
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
                  Service Name
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  placeholder="e.g. Netflix, AWS..."
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
                  Price / month ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  placeholder="19.99"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#71717a" }}
                >
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                    colorScheme: "dark",
                  }}
                  value={formData.next}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, next: e.target.value }))
                  }
                />
              </div>
              {formError && (
                <p className="text-xs" style={{ color: "#ef4444" }}>
                  {formError}
                </p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormError("");
                    setFormData({ title: "", price: "", next: "" });
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
                  {submitting ? "Saving..." : "Add Subscription"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSub && (
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
                Edit Subscription
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSub(null);
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
                  Service Name
                </label>
                <input
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  placeholder="e.g. Netflix, AWS..."
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
                  Price / month ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                  }}
                  placeholder="19.99"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium block mb-1"
                  style={{ color: "#71717a" }}
                >
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    outline: "none",
                    colorScheme: "dark",
                  }}
                  value={formData.next}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, next: e.target.value }))
                  }
                />
              </div>
              {formError && (
                <p className="text-xs" style={{ color: "#ef4444" }}>
                  {formError}
                </p>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSub(null);
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
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2
            className="font-semibold text-4xl"
            style={{ color: "#fafafa", letterSpacing: "-0.02em" }}
          >
            Subscriptions
          </h2>
          <p className="text-sm mt-1" style={{ color: "#71717a" }}>
            Manage your active software licenses and upcoming renewals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative group">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors duration-200"
              style={{ color: searchQuery ? "#8b5cf6" : "#52525b" }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all duration-200 outline-none w-full md:w-[280px]"
              style={{
                backgroundColor: "#131315",
                borderColor: searchQuery ? "#8b5cf6" : "#27272a",
                color: "#fafafa",
                boxShadow: searchQuery
                  ? "0 0 0 1px rgba(139,92,246,0.2)"
                  : "none",
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-t-transparent border-violet-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowCreateModal(true);
              setFormData({ title: "", price: "", next: "" });
              setFormError("");
            }}
            className="hover:opacity-90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.98] whitespace-nowrap"
            style={{ backgroundColor: "#8b5cf6" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#7c4dff")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#8b5cf6")
            }
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              add
            </span>
            Add Subscription
          </button>
        </div>
      </div>

      {searchError && (
        <div
          className="p-3 rounded-lg border flex items-center gap-2"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            borderColor: "rgba(239,68,68,0.2)",
            color: "#ef4444",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            error
          </span>
          <p className="text-xs font-medium">{searchError}</p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((s) => (
          <div
            key={s.label}
            className="p-4 border rounded-xl"
            style={{ backgroundColor: "#0e0e10", borderColor: "#27272a" }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.05em]"
              style={{ color: "#71717a", fontFamily: "Geist, sans-serif" }}
            >
              {s.label}
            </p>
            <p
              className="font-semibold text-2xl mt-1"
              style={{
                color: s.valueColor || "#fafafa",
                letterSpacing: "-0.02em",
              }}
            >
              {s.value}
            </p>
            <div
              className="mt-2 flex items-center gap-1"
              style={{ color: s.metaColor }}
            >
              {s.icon && (
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "14px" }}
                >
                  {s.icon}
                </span>
              )}
              <span className="text-xs">{s.meta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allSubs.map((sub) => {
          const nextDate = new Date(sub.next);
          const isOverdue = nextDate < now;
          const renewal = nextDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const statusText = isOverdue ? "Overdue" : "Active";
          const statusColor = isOverdue ? "#ef4444" : "#8b5cf6";
          const statusBg = isOverdue
            ? "rgba(239,68,68,0.1)"
            : "rgba(139,92,246,0.1)";
          const renewalColor = isOverdue ? "#ef4444" : "#fafafa";

          return (
            <div
              key={sub._id}
              className="border rounded-xl p-4 flex flex-col group cursor-default transition-all duration-200"
              style={{ backgroundColor: "#1c1b1d", borderColor: "#27272a" }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#3f3f46";
                e.currentTarget.style.backgroundColor = "#0c0c0e";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#27272a";
                e.currentTarget.style.backgroundColor = "#1c1b1d";
              }}
            >
              {/* Top row: icon + status + actions */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg border flex items-center justify-center"
                  style={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: isOverdue ? "#ef4444" : "#8b5cf6",
                      fontSize: "26px",
                    }}
                  >
                    subscriptions
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ color: statusColor, backgroundColor: statusBg }}
                  >
                    {statusText}
                  </span>
                  {/* Edit */}
                  <button
                    onClick={() => openEdit(sub)}
                    className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: "#71717a" }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#2a2a2c";
                      e.currentTarget.style.color = "#8b5cf6";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#71717a";
                    }}
                    title="Edit"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      edit
                    </span>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => deleteSub(sub._id)}
                    className="p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: "#71717a" }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(239,68,68,0.1)";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#71717a";
                    }}
                    title="Delete"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "16px" }}
                    >
                      delete
                    </span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <h3
                  className="font-medium text-base"
                  style={{ color: "#fafafa", letterSpacing: "-0.01em" }}
                >
                  {sub.title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>
                  Subscription
                </p>
              </div>

              {/* Price & Renewal */}
              <div
                className="mt-auto space-y-2 pt-4"
                style={{ borderTop: "1px solid rgba(39,39,42,0.5)" }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: "#71717a" }}>
                    Price
                  </span>
                  <span
                    className="font-medium text-base"
                    style={{ color: "#fafafa", letterSpacing: "-0.01em" }}
                  >
                    ${parseFloat(sub.price).toFixed(2)}
                    <span className="text-xs" style={{ color: "#71717a" }}>
                      /mo
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: "#71717a" }}>
                    Next Renewal
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: renewalColor }}
                  >
                    {isOverdue ? "Overdue — " : ""}
                    {renewal}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Card */}
        <div
          onClick={() => {
            setShowCreateModal(true);
            setFormData({ title: "", price: "", next: "" });
            setFormError("");
          }}
          className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[220px]"
          style={{ borderColor: "#27272a" }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#0e0e10";
            e.currentTarget.style.borderColor = "#8b5cf6";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "#27272a";
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: "#2a2a2c" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#71717a", fontSize: "24px" }}
            >
              add_circle
            </span>
          </div>
          <p
            className="font-medium text-base"
            style={{ color: "#fafafa", letterSpacing: "-0.01em" }}
          >
            Add New Service
          </p>
          <p
            className="text-xs mt-1 max-w-[160px]"
            style={{ color: "#71717a" }}
          >
            Track payments and renewal cycles
          </p>
        </div>
      </div>

      {/* Empty state */}
      {allSubs.length === 0 && (
        <div className="text-center py-8 text-sm" style={{ color: "#71717a" }}>
          No subscriptions yet. Add your first one.
        </div>
      )}
    </main>
  );
}
