"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Pkg = {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  max_outlets: number | null;
  max_kasir: number | null;
  is_active: boolean;
  features: { list?: string[] } | null;
};

export default function PaketPage() {
  const supabase = createClient();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration_days: "30",
    max_outlets: "",
    max_kasir: "",
    features: "",
  });

  async function load() {
    const { data } = await supabase.from("packages").select("*").order("price");
    setPackages(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", price: "", duration_days: "30", max_outlets: "", max_kasir: "", features: "" });
    setShowForm(true);
  }

  function openEdit(p: Pkg) {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      duration_days: String(p.duration_days),
      max_outlets: p.max_outlets != null ? String(p.max_outlets) : "",
      max_kasir: p.max_kasir != null ? String(p.max_kasir) : "",
      features: (p.features?.list ?? []).join("\n"),
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const featureList = form.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      price: Number(form.price),
      duration_days: Number(form.duration_days),
      max_outlets: form.max_outlets ? Number(form.max_outlets) : null,
      max_kasir: form.max_kasir ? Number(form.max_kasir) : null,
      features: { list: featureList },
    };

    if (editing) {
      await supabase.from("packages").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("packages").insert({ ...payload, is_active: true });
    }

    setSaving(false);
    setShowForm(false);
    load();
  }

  async function toggleActive(p: Pkg) {
    await supabase.from("packages").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  }

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Paket</h1>
          <p className="text-sm text-ink-400">
            Atur harga & fitur langganan. Perubahan langsung berlaku di halaman pilih paket.
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Tambah Paket
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="skeleton h-40" />
          <div className="skeleton h-40" />
          <div className="skeleton h-40" />
        </div>
      ) : packages.length === 0 ? (
        <div className="card text-center py-10 text-ink-400">Belum ada paket.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {packages.map((p) => (
            <div key={p.id} className="card flex flex-col">
              <div className="flex items-start justify-between">
                <p className="font-display font-bold text-lg">{p.name}</p>
                <span className={p.is_active ? "badge-active" : "badge-locked"}>
                  {p.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="mt-2 text-3xl font-display font-extrabold text-brand-500">
                Rp{p.price.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-ink-400 mb-4">Masa aktif: {p.duration_days} hari</p>

              <div className="text-sm text-ink-500 space-y-1 mb-3">
                <p>Cabang: {p.max_outlets ?? "Unlimited"}</p>
                <p>Kasir: {p.max_kasir ?? "Unlimited"}</p>
              </div>

              {(p.features?.list ?? []).length > 0 && (
                <ul className="text-sm text-ink-500 space-y-1 mb-4">
                  {p.features!.list!.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-500 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex gap-2 pt-2">
                <button onClick={() => openEdit(p)} className="btn-secondary flex-1 !py-2 text-sm">
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(p)}
                  className="btn-secondary flex-1 !py-2 text-sm"
                >
                  {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="card w-full max-w-sm my-8">
            <h2 className="font-display text-lg font-bold mb-4">
              {editing ? "Edit Paket" : "Tambah Paket"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">Nama Paket</label>
                <input
                  required
                  placeholder="cth: Starter, Pro, Business"
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">Harga (Rp)</label>
                <input
                  required
                  type="number"
                  placeholder="cth: 99000"
                  className="input-field"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">
                  Masa Aktif (hari)
                </label>
                <input
                  required
                  type="number"
                  placeholder="cth: 30 untuk sebulan"
                  className="input-field"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">
                  Maks. Jumlah Cabang
                </label>
                <input
                  type="number"
                  placeholder="Kosongkan jika tanpa batas (unlimited)"
                  className="input-field"
                  value={form.max_outlets}
                  onChange={(e) => setForm({ ...form, max_outlets: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">
                  Maks. Jumlah Kasir
                </label>
                <input
                  type="number"
                  placeholder="Kosongkan jika tanpa batas (unlimited)"
                  className="input-field"
                  value={form.max_kasir}
                  onChange={(e) => setForm({ ...form, max_kasir: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">
                  Daftar Fitur (1 baris = 1 fitur)
                </label>
                <textarea
                  rows={5}
                  placeholder={"cth:\nLaporan penjualan basic\nCash + QRIS\nNotifikasi stok menipis"}
                  className="input-field resize-none"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-ink-400">
                  Ini yang akan tampil sebagai daftar centang ke pengguna di halaman pilih paket.
                </p>
              </div>

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
