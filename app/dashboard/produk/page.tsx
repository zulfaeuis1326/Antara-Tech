"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
};

export default function ProdukPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", price: "", stock: "", unit: "pcs" });

  async function loadProducts(tid: string) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("tenant_id", tid)
      .order("name");
    setProducts(data ?? []);
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
        loadProducts(profile.tenant_id);
      } else {
        setLoading(false);
      }
    })();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", price: "", stock: "", unit: "pcs" });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock), unit: p.unit });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;

    const payload = {
      name: form.name,
      price: Number(form.price),
      stock: Number(form.stock),
      unit: form.unit,
      tenant_id: tenantId,
    };

    if (editing) {
      await supabase.from("products").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setShowForm(false);
    loadProducts(tenantId);
  }

  async function handleDelete(id: string) {
    if (!tenantId) return;
    if (!confirm("Hapus produk ini?")) return;
    await supabase.from("products").delete().eq("id", id);
    loadProducts(tenantId);
  }

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Produk</h1>
          <p className="text-sm text-ink-400">Atur produk dan stok tokomu.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Tambah Produk
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-10 text-ink-400">
            Belum ada produk. Klik &quot;Tambah Produk&quot; untuk mulai.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-400 border-b border-ink-100">
                <th className="pb-3 font-medium">Nama</th>
                <th className="pb-3 font-medium">Harga</th>
                <th className="pb-3 font-medium">Stok</th>
                <th className="pb-3 font-medium">Satuan</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="py-3 text-ink-500">Rp{p.price.toLocaleString("id-ID")}</td>
                  <td className="py-3">
                    <span className={p.stock <= 5 ? "badge-locked" : "badge-active"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 text-ink-500">{p.unit}</td>
                  <td className="py-3 text-right space-x-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-brand-500 text-xs font-medium hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-pink-500 text-xs font-medium hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="card w-full max-w-sm">
            <h2 className="font-display text-lg font-bold mb-4">
              {editing ? "Edit Produk" : "Tambah Produk"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                required
                placeholder="Nama produk"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required
                type="number"
                placeholder="Harga (Rp)"
                className="input-field"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                required
                type="number"
                placeholder="Stok"
                className="input-field"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
              <input
                placeholder="Satuan (pcs, kg, gelas...)"
                className="input-field"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  Simpan
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
