"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Tenant = {
  id: string;
  name: string;
  status: string;
  trial_ends_at: string | null;
  created_at: string;
  phone: string | null;
  business_type: string | null;
};

export default function TenantPage() {
  const supabase = createClient();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", business_type: "" });
  const [search, setSearch] = useState("");

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

  async function handleDelete(t: Tenant) {
    if (!confirm(`Hapus tenant "${t.name}" secara permanen? Semua data toko ini akan ikut terhapus.`)) return;
    await supabase.from("tenants").delete().eq("id", t.id);
    load();
  }

  async function handleDelete(t: Tenant) {
    const confirmed = confirm(
      `Hapus "${t.name}" secara permanen? Semua data toko ini (produk, transaksi, kasir, cabang, riwayat) akan ikut terhapus dan TIDAK BISA dikembalikan.`
    );
    if (!confirmed) return;
    await supabase.from("tenants").delete().eq("id", t.id);
    load();
  }

  async function handleAddTenant(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const trialEnds = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from("tenants").insert({
      name: form.name,
      phone: form.phone || null,
      business_type: form.business_type || null,
      status: "trial",
      subscription_plan: "none",
      trial_ends_at: trialEnds,
    });

    setSaving(false);

    if (error) {
      alert("Gagal menambah tenant: " + error.message);
      return;
    }

    setForm({ name: "", phone: "", business_type: "" });
    setShowForm(false);
    load();
  }

  const badgeClass = (status: string) =>
    status === "active" ? "badge-active" : status === "trial" ? "badge-trial" : "badge-locked";

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Tenant</h1>
          <p className="text-sm text-ink-400">Semua toko yang terdaftar di Antara Tech.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Tambah Tenant
        </button>
      </div>

      <div className="card">
        <input
          placeholder="Cari nama toko..."
          className="input-field mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        ) : filteredTenants.length === 0 ? (
          <p className="text-center py-10 text-ink-400">
            {tenants.length === 0 ? "Belum ada tenant terdaftar." : "Tidak ditemukan."}
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-100 dark:border-white/10">
                <th className="pb-3 font-medium">Nama Toko</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Trial Berakhir</th>
                <th className="pb-3 font-medium">Terdaftar</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50 dark:divide-white/5">
              {filteredTenants.map((t) => (
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
                  <td className="py-3 text-right space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => toggleLock(t)}
                      className="text-xs font-medium text-brand-500 hover:underline"
                    >
                      {t.status === "locked" ? "Buka Kunci" : "Kunci"}
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="text-xs font-medium text-pink-500 hover:underline"
                    >
                      Hapus
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
            <h2 className="font-display text-lg font-bold mb-1">Tambah Tenant</h2>
            <p className="text-xs text-ink-400 mb-4">
              Tenant otomatis dapat trial 1 hari. Owner toko login belakangan pakai akun terpisah yang dihubungkan ke tenant ini.
            </p>
            <form onSubmit={handleAddTenant} className="space-y-3">
              <input
                required
                placeholder="Nama toko"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                placeholder="Nomor HP (opsional)"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                placeholder="Jenis usaha (opsional)"
                className="input-field"
                value={form.business_type}
                onChange={(e) => setForm({ ...form, business_type: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
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
