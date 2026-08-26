"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Tenant = {
  id: string;
  name: string;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
};

export default function TenantPage() {
  const supabase = createClient();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    setTenants(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleLock(t: Tenant) {
    const newStatus = t.status === "locked" ? "active" : "locked";
    await supabase.from("tenants").update({ status: newStatus }).eq("id", t.id);
    load();
  }

  const badgeClass = (status: string) =>
    status === "active" ? "badge-active" : status === "trial" ? "badge-trial" : "badge-locked";

  return (
    <main className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Kelola Tenant</h1>
        <p className="text-sm text-ink-400">Semua toko yang terdaftar di Antara Tech.</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        ) : tenants.length === 0 ? (
          <p className="text-center py-10 text-ink-400">Belum ada tenant terdaftar.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-100">
                <th className="pb-3 font-medium">Nama Toko</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Trial Berakhir</th>
                <th className="pb-3 font-medium">Terdaftar</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 font-medium">{t.name}</td>
                  <td className="py-3">
                    <span className={badgeClass(t.status)}>{t.status}</span>
                  </td>
                  <td className="py-3 text-ink-500">
                    {t.trial_ends_at
                      ? new Date(t.trial_ends_at).toLocaleString("id-ID")
                      : "—"}
                  </td>
                  <td className="py-3 text-ink-400">
                    {new Date(t.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => toggleLock(t)}
                      className="text-xs font-medium text-brand-500 hover:underline"
                    >
                      {t.status === "locked" ? "Buka Kunci" : "Kunci Akses"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
