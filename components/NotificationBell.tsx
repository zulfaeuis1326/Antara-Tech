"use client";

import { useEffect, useState } from "react";
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
  const { role, tenantId } = useTenant();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  async function load() {
    // Superadmin tidak punya tenant sendiri — notifikasi trial/langganan milik tenant
    // lain tidak relevan buat mereka, jadi sengaja dikosongkan di sini.
    // (Superadmin sudah punya ringkasan sendiri di halaman Dashboard & Audit Log.)
    if (role === "superadmin") {
      setNotifs([]);
      setLoading(false);
      return;
    }

    if (!tenantId) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("notifications")
      .select("id, message, type, is_read, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(15);
    setNotifs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [tenantId, role]);

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
    <>
      <button
        onClick={() => {
          setOpen(true);
          markAllRead();
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
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[60]"
          onClick={() => setOpen(false)}
        >
          <div
            className="card !p-0 overflow-hidden w-full max-w-sm max-h-[75vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-grad-purple text-white shrink-0">
              <p className="font-display font-bold flex items-center gap-2">🔔 Notifikasi</p>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 space-y-2">
                  <div className="skeleton h-14 w-full" />
                  <div className="skeleton h-14 w-full" />
                </div>
              ) : notifs.length === 0 ? (
                <div className="text-center py-14 px-6">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-sm text-ink-400">Semua beres, belum ada notifikasi baru.</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-3 px-5 py-4 border-b border-ink-50 dark:border-white/5 last:border-0"
                  >
                    <span className="text-xl shrink-0 w-9 h-9 rounded-full bg-ink-50 dark:bg-white/10 flex items-center justify-center">
                      {typeIcon(n.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-ink-700 dark:text-white/85 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-ink-400 mt-1.5">
                        {new Date(n.created_at).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
