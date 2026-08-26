"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("antara-theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("antara-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Ganti tema"
      className="w-8 h-8 rounded-full flex items-center justify-center bg-ink-50 dark:bg-white/10 text-sm hover:opacity-80"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
