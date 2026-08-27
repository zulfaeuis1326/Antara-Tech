"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Outlet = { id: string; name: string; address: string | null; is_active: boolean };

export default function OutletPage() {
  const supabase = createClient();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "" });

  async function load(tid: string) {
    const { data } = await supabase.from("outlets").select("*").eq("tenant_id", tid).order("name");
    setOutlets(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("app_users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();
      if (profile?.tenant_id) {
        setTenantId(profile.tenant_id);
        load(profile.tenant_id);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    await supabase.from("outlets").insert({
      tenant_id: tenantId,
      name: form.name,
      address: form.address || null,
    });
    setForm({ name: "", address: "" });
    setShowForm(false);
    load(tenantId);
  }

  async function toggleActive(o: Outlet) {
    if (!tenantId) return;
    await supabase.from("outlets").update({ is_active: !o.is_active }).eq("id", o.id);
    load(tenantId);
  }

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Cabang</h1>
          <p className="text-sm text-ink-400">Setiap cabang punya stok & laporan sendiri.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Tambah Cabang
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="skeleton h-12 w-full" />
        ) : outlets.length === 0 ? (
          <p className="text-center py-10 text-ink-400">Belum ada cabang. Tambahkan cabang pertamamu.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-100 dark:border-white/10">
                <th className="pb-3 font-medium">Nama Cabang</th>
                <th className="pb-3 font-medium">Alamat</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50 dark:divide-white/5">
              {outlets.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 font-medium">{o.name}</td>
                  <td className="py-3 text-ink-500">{o.address ?? "—"}</td>
                  <td className="py-3">
                    <span className={o.is_active ? "badge-active" : "badge-locked"}>
                      {o.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => toggleActive(o)}
                      className="text-xs font-medium text-brand-500 hover:underline"
                    >
                      {o.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="card w-full max-w-sm">
            <h2 className="font-display text-lg font-bold mb-4">Tambah Cabang</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                required
                placeholder="Nama cabang"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                placeholder="Alamat (opsional)"
                className="input-field"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Simpan
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
