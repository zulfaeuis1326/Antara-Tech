"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/TenantContext";

type Notif = {
  id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationBell() {
  const supabase = createClient();
  const { role } = useTenant();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  async function load() {
    const { data } = await supabase
      .from("notifications")
      .select("id, message, type, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    setNotifs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    const unreadIds = notifs.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
  }

  const typeIcon = (type: string) => {
    if (type === "low_stock") return "📦";
    if (type === "payment") return "💳";
    if (type === "trial_ending" || type === "subscription_ending") return "⏰";
    return "🔔";
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        aria-label="Notifikasi"
        className="relative w-9 h-9 rounded-full flex items-center justify-center bg-ink-50 dark:bg-white/10 hover:bg-ink-100 dark:hover:bg-white/15 transition-colors"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] card !p-0 overflow-hidden z-50 shadow-xl">
          <div className="px-4 py-3 border-b border-ink-100 dark:border-white/10">
            <p className="font-display font-bold text-sm">Notifikasi</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-2">
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-12 w-full" />
              </div>
            ) : notifs.length === 0 ? (
              <p className="text-center py-8 text-sm text-ink-400">Belum ada notifikasi.</p>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={
                    n.is_read
                      ? "flex gap-3 px-4 py-3 border-b border-ink-50 dark:border-white/5"
                      : "flex gap-3 px-4 py-3 border-b border-ink-50 dark:border-white/5 bg-brand-500/5"
                  }
                >
                  <span className="text-lg shrink-0">{typeIcon(n.type)}</span>
                  <div>
                    <p className="text-sm text-ink-700 dark:text-white/80">{n.message}</p>
                    <p className="text-[11px] text-ink-400 mt-1">
                      {new Date(n.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
