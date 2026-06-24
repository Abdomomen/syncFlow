"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTokenSync, useSync } from "@/app/store/context";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/dashboard/tasks", icon: "assignment", label: "Tasks" },
  {
    href: "/dashboard/subscriptions",
    icon: "payments",
    label: "Subscriptions",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const setToken = useTokenSync((s) => s.setToken);
  // Optional: clear user info if stored in clientStore
  const setUser = useSync((s) => s.setUser);

  const handleLogout = async (e) => {
    e.preventDefault();
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setToken(null);
    if (setUser) setUser(null);
    router.replace("/login");
  };
  return (
    <aside
      className="w-[240px] h-screen fixed left-0 top-0 border-r flex flex-col p-4 z-40 hidden md:flex"
      style={{ backgroundColor: "#1c1b1d", borderColor: "#27272a" }}
    >
      {/* Logo */}
      <div className="mb-6 px-2 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ backgroundColor: "#a078ff" }}
        >
          <span
            className="material-symbols-outlined text-sm"
            style={{
              color: "#340080",
              fontSize: "18px",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            layers
          </span>
        </div>
        <div>
          <h1
            className="font-bold text-lg leading-tight"
            style={{ color: "#fafafa", fontFamily: "Inter" }}
          >
            TaskFlow
          </h1>
          <p
            className="text-[10px] tracking-widest uppercase"
            style={{ color: "#71717a" }}
          >
            Enterprise Tier
          </p>
        </div>
      </div>

      {/* Create New Button */}
      <Link
        href="/dashboard/tasks"
        className="mb-6 flex items-center justify-center gap-2 text-white py-2 px-4 rounded-lg transition-all active:scale-95 font-medium text-sm w-full"
        style={{ backgroundColor: "#8b5cf6" }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#7c4dff")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#8b5cf6")}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "20px" }}
        >
          add_circle
        </span>
        <span>Create New</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        <div
          className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-3"
          style={{ color: "#71717a" }}
        >
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 group text-sm font-medium"
              style={{
                backgroundColor: isActive ? "#47464a" : "transparent",
                color: isActive ? "#b6b4b8" : "#71717a",
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#2a2a2c";
                  e.currentTarget.style.color = "#fafafa";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#71717a";
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "18px",
                  color: isActive ? "#d0bcff" : "#71717a",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div
        className="mt-auto pt-4 space-y-1"
        style={{ borderTop: "1px solid #27272a" }}
      >
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
          style={{ color: "#71717a" }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2c";
            e.currentTarget.style.color = "#fafafa";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#71717a";
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            help
          </span>
          <span>Help Center</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 text-sm cursor-pointer"
          style={{ color: "#71717a" }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2c";
            e.currentTarget.style.color = "#fafafa";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#71717a";
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "18px" }}
          >
            logout
          </span>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
