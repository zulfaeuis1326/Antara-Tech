"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/TenantContext";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  category_id: string | null;
};

export default function ProdukPage() {
  const supabase = createClient();
  const { tenantId } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    unit: "pcs",
    category_id: "",
  });

  async function loadAll(tid: string) {
    const [{ data: prod }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").eq("tenant_id", tid).order("name"),
      supabase.from("categories").select("*").eq("tenant_id", tid).order("name"),
    ]);
    setProducts(prod ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (tenantId) {
      loadAll(tenantId);
    } else {
      setLoading(false);
    }
  }, [tenantId]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", price: "", stock: "", unit: "pcs", category_id: "" });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      unit: p.unit,
      category_id: p.category_id ?? "",
    });
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
      category_id: form.category_id || null,
      tenant_id: tenantId,
    };

    if (editing) {
      await supabase.from("products").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("products").insert(payload);
    }

    setShowForm(false);
    loadAll(tenantId);
  }

  async function handleDelete(id: string) {
    if (!tenantId) return;
    if (!confirm("Hapus produk ini?")) return;
    await supabase.from("products").delete().eq("id", id);
    loadAll(tenantId);
  }

  async function handleAddCategory() {
    if (!tenantId || !newCategoryName.trim()) return;
    setAddingCategory(true);
    const { data } = await supabase
      .from("categories")
      .insert({ tenant_id: tenantId, name: newCategoryName.trim() })
      .select()
      .single();
    setAddingCategory(false);
    setNewCategoryName("");
    if (data) {
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm((f) => ({ ...f, category_id: data.id }));
    }
  }

  async function handleDeleteCategory(catId: string) {
    if (!tenantId) return;
    if (!confirm("Hapus kategori ini? Produk di dalamnya akan pindah ke 'Lainnya', tidak terhapus."))
      return;
    await supabase.from("categories").delete().eq("id", catId);
    if (activeCategory === catId) setActiveCategory("all");
    loadAll(tenantId);
  }

  const categoryName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? "Lainnya" : "Lainnya";

  const filteredProducts =
    activeCategory === "all"
      ? products
      : activeCategory === "none"
      ? products.filter((p) => !p.category_id)
      : products.filter((p) => p.category_id === activeCategory);

  return (
    <main className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Produk</h1>
          <p className="text-sm text-ink-400">Atur produk, stok, dan kategori tokomu.</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Tambah Produk
        </button>
      </div>

      {/* Filter kategori */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={
            activeCategory === "all"
              ? "shrink-0 rounded-full bg-brand-500 text-white text-xs font-medium px-4 py-2"
              : "shrink-0 rounded-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-white/10 text-ink-500 text-xs font-medium px-4 py-2"
          }
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={
              activeCategory === c.id
                ? "shrink-0 rounded-full bg-brand-500 text-white text-xs font-medium px-4 py-2"
                : "shrink-0 rounded-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-white/10 text-ink-500 text-xs font-medium px-4 py-2"
            }
          >
            {c.name}
          </button>
        ))}
        <button
          onClick={() => setActiveCategory("none")}
          className={
            activeCategory === "none"
              ? "shrink-0 rounded-full bg-brand-500 text-white text-xs font-medium px-4 py-2"
              : "shrink-0 rounded-full bg-white dark:bg-ink-800 border border-ink-100 dark:border-white/10 text-ink-500 text-xs font-medium px-4 py-2"
          }
        >
          Lainnya
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center py-10 text-ink-400">
            {products.length === 0
              ? 'Belum ada produk. Klik "Tambah Produk" untuk mulai.'
              : "Tidak ada produk di kategori ini."}
          </p>
        ) : (
          <>
            {/* Mobile: kartu */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map((p) => (
                <div key={p.id} className="rounded-xl2 border border-ink-100 dark:border-white/10 p-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium">{p.name}</p>
                    <span className={p.stock <= 5 ? "badge-locked" : "badge-active"}>
                      Stok {p.stock}
                    </span>
                  </div>
                  <p className="text-xs text-ink-400 mb-1">{categoryName(p.category_id)}</p>
                  <p className="text-brand-500 font-display font-bold mb-3">
                    Rp{p.price.toLocaleString("id-ID")} / {p.unit}
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-xs font-medium text-brand-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs font-medium text-pink-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: tabel */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-ink-400 border-b border-ink-100 dark:border-white/10">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">Kategori</th>
                    <th className="pb-3 font-medium">Harga</th>
                    <th className="pb-3 font-medium">Stok</th>
                    <th className="pb-3 font-medium">Satuan</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50 dark:divide-white/5">
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-ink-500">{categoryName(p.category_id)}</td>
                      <td className="py-3 text-ink-500">Rp{p.price.toLocaleString("id-ID")}</td>
                      <td className="py-3">
                        <span className={p.stock <= 5 ? "badge-locked" : "badge-active"}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 text-ink-500">{p.unit}</td>
                      <td className="py-3 text-right space-x-3 whitespace-nowrap">
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
            </div>
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50 overflow-y-auto">
          <div className="card w-full max-w-sm my-8">
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

              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">Kategori</label>
                <select
                  className="input-field"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  <option value="">Lainnya (tanpa kategori)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 mt-2">
                  <input
                    placeholder="Kategori baru, cth: Snack"
                    className="input-field !py-2 text-sm"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingCategory || !newCategoryName.trim()}
                    className="btn-secondary !py-2 text-sm shrink-0"
                  >
                    + Buat
                  </button>
                </div>
              </div>

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

            {categories.length > 0 && (
              <div className="mt-5 pt-4 border-t border-ink-100 dark:border-white/10">
                <p className="text-xs font-medium text-ink-500 mb-2">Kelola kategori</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 dark:bg-white/5 px-3 py-1 text-xs"
                    >
                      {c.name}
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id)}
                        className="text-pink-500"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
