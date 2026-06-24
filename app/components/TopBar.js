"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSync } from "../store/context";

const mobileNavItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/dashboard/tasks", icon: "assignment", label: "Tasks" },
  { href: "/dashboard/subscriptions", icon: "payments", label: "Subs" },
];

export default function TopBar({ searchPlaceholder = "Search..." }) {
  const pathname = usePathname();
  const user = useSync((s) => s.user);
  return (
    <>
      {/* Desktop/Mobile Top Header */}
      <header
        className="h-16 w-full sticky top-0 z-30 border-b flex items-center justify-between px-6"
        style={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
      >
        <div className="flex items-center gap-4 flex-1 max-w-xl"></div>
        <div className="flex items-center gap-4">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
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
              style={{ fontSize: "20px" }}
            >
              dark_mode
            </span>
          </button>
          <div
            className="h-6 w-px mx-1"
            style={{ backgroundColor: "#27272a" }}
          ></div>
          <div
            className="w-8 h-8 rounded-full overflow-hidden border cursor-pointer"
            style={{ borderColor: "#27272a" }}
          >
            <div
              className="w-full h-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "#47464a", color: "#d0bcff" }}
            >
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "AT"}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full border-t flex justify-around py-3 z-50 px-6"
        style={{ backgroundColor: "#201f22", borderColor: "#27272a" }}
      >
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1"
              style={{ color: isActive ? "#8b5cf6" : "#71717a" }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "22px",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
