"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LogEntry = {
  id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  actor_role: string | null;
  created_at: string;
};

type SysLog = {
  id: string;
  job_name: string;
  status: string;
  detail: string | null;
  created_at: string;
};

export default function AuditLogPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sysLogs, setSysLogs] = useState<SysLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: audit }, { data: sys }] = await Promise.all([
        supabase
          .from("audit_logs")
          .select("id, action, target_table, target_id, actor_role, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("system_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setLogs(audit ?? []);
      setSysLogs(sys ?? []);
      setLoading(false);
    })();
  }, []);

  const actionColor = (action: string) =>
    action === "DELETE" ? "text-pink-500" : action === "INSERT" ? "text-teal-500" : "text-gold-500";

  return (
    <main className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Audit Log & System Health</h1>
        <p className="text-sm text-ink-400">Pantau aktivitas sensitif dan status job otomatis.</p>
      </div>

      <div className="card mb-6">
        <p className="text-sm text-ink-400 mb-3 font-medium">Status Job Otomatis (10 terakhir)</p>
        {loading ? (
          <div className="skeleton h-20" />
        ) : sysLogs.length === 0 ? (
          <p className="text-sm text-ink-400">Belum ada log. Job berjalan otomatis tiap jam/hari.</p>
        ) : (
          <div className="space-y-2">
            {sysLogs.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl2 bg-ink-50 dark:bg-white/5 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{s.job_name}</p>
                  <p className="text-xs text-ink-400">{s.detail}</p>
                </div>
                <div className="text-right">
                  <span className={s.status === "success" ? "badge-active" : "badge-locked"}>
                    {s.status === "success" ? "Sukses" : "Gagal"}
                  </span>
                  <p className="text-[10px] text-ink-400 mt-1">
                    {new Date(s.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <p className="text-sm text-ink-400 mb-3 font-medium">Riwayat Perubahan Data (50 terakhir)</p>
        {loading ? (
          <div className="skeleton h-40" />
        ) : logs.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-8">Belum ada aktivitas tercatat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-400 border-b border-ink-100 dark:border-white/10">
                  <th className="pb-2 font-medium">Aksi</th>
                  <th className="pb-2 font-medium">Tabel</th>
                  <th className="pb-2 font-medium">Oleh</th>
                  <th className="pb-2 font-medium">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-white/5">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className={`py-2 font-medium ${actionColor(l.action)}`}>{l.action}</td>
                    <td className="py-2 text-ink-500">{l.target_table}</td>
                    <td className="py-2 text-ink-500 capitalize">{l.actor_role ?? "system"}</td>
                    <td className="py-2 text-ink-400 text-xs">
                      {new Date(l.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
