"use client";
import { useRouter } from "next/navigation";
import "./globals.css";
import Provider, { useSync } from "./store/context";
import { useTokenSync } from "./store/context";
import { useEffect, useState } from "react";

function AuthWatcher({ children }) {
  // loading spinner
  const router = useRouter();
  const token = useTokenSync((s) => s.token);
  const setToken = useTokenSync((s) => s.setToken);
  const user = useSync((s) => s.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token && user?.username) {
      setLoading(true);
      const fetching = async () => {
        try {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
          });
          const data = await res.json();
          if (data.success) {
            setToken(data.token);
            router.replace("/dashboard");
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Auth refresh failed:", error);
          router.push("/login");
        } finally {
          setLoading(false);
        }
      };

      fetching();
    } else {
      setLoading(false);
    }
  }, [token, setToken, router, user?.username]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-surface-variant border-t-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Geist:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <Provider>
          <AuthWatcher>{children}</AuthWatcher>
        </Provider>
      </body>
    </html>
  );
}
