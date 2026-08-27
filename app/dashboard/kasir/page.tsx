"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Kasir = { id: string; name: string; outlet_id: string | null };
type Outlet = { id: string; name: string };

export default function KasirPage() {
  const supabase = createClient();
  const [kasirList, setKasirList] = useState<Kasir[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", outlet_id: "" });

  async function load(tid: string) {
    const [{ data: kasir }, { data: outletData }] = await Promise.all([
      supabase.from("app_users").select("id, name, outlet_id").eq("tenant_id", tid).eq("role", "kasir"),
      supabase.from("outlets").select("id, name").eq("tenant_id", tid),
    ]);
    setKasirList(kasir ?? []);
    setOutlets(outletData ?? []);
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
    setSaving(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error: fnError } = await supabase.functions.invoke("create-staff", {
      body: {
        name: form.name,
        email: form.email,
        password: form.password,
        outlet_id: form.outlet_id || null,
      },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    setSaving(false);

    if (fnError || data?.error) {
      setError(data?.error ?? fnError?.message ?? "Gagal menambah kasir.");
      return;
    }

    setForm({ name: "", email: "", password: "", outlet_id: "" });
    setShowForm(false);
    if (tenantId) load(tenantId);
  }

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Kasir</h1>
          <p className="text-sm text-ink-400">Kasir hanya bisa akses cabang tempatnya terdaftar.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Tambah Kasir
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="skeleton h-12 w-full" />
        ) : kasirList.length === 0 ? (
          <p className="text-center py-10 text-ink-400">Belum ada akun kasir.</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-100 dark:border-white/10">
                <th className="pb-3 font-medium">Nama</th>
                <th className="pb-3 font-medium">Cabang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50 dark:divide-white/5">
              {kasirList.map((k) => (
                <tr key={k.id}>
                  <td className="py-3 font-medium">{k.name}</td>
                  <td className="py-3 text-ink-500">
                    {outlets.find((o) => o.id === k.outlet_id)?.name ?? "Belum ditempatkan"}
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
            <h2 className="font-display text-lg font-bold mb-4">Tambah Kasir</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <input
                required
                placeholder="Nama kasir"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Email login kasir"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                required
                type="password"
                minLength={6}
                placeholder="Password (min. 6 karakter)"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <select
                className="input-field"
                value={form.outlet_id}
                onChange={(e) => setForm({ ...form, outlet_id: e.target.value })}
              >
                <option value="">Pilih cabang (opsional)</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>

              {error && (
                <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">{error}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? "Menyimpan..." : "Simpan"}
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
