"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Product = { id: string; name: string; price: number; stock: number; category_id: string | null };
type Category = { id: string; name: string };
type CartItem = Product & { qty: number };

export default function TransaksiPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [payment, setPayment] = useState<"cash" | "qris">("cash");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [qrisImageUrl, setQrisImageUrl] = useState<string | null>(null);
  const [showQrisScreen, setShowQrisScreen] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("app_users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (profile?.tenant_id) {
        setTenantId(profile.tenant_id);

        const { data } = await supabase
          .from("products")
          .select("id, name, price, stock, category_id")
          .eq("tenant_id", profile.tenant_id)
          .order("name");
        setProducts(data ?? []);

        const { data: cats } = await supabase
          .from("categories")
          .select("id, name")
          .eq("tenant_id", profile.tenant_id)
          .order("name");
        setCategories(cats ?? []);

        const { data: tenant } = await supabase
          .from("tenants")
          .select("qris_image_url")
          .eq("id", profile.tenant_id)
          .single();
        setQrisImageUrl(tenant?.qris_image_url ?? null);
      }
    })();
  }, []);

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id);
      if (existing) {
        return prev.map((c) => (c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0)
    );
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (activeCategory === "all") return true;
      if (activeCategory === "none") return !p.category_id;
      return p.category_id === activeCategory;
    });

  async function refreshProducts() {
    if (!tenantId) return;
    const { data } = await supabase
      .from("products")
      .select("id, name, price, stock, category_id")
      .eq("tenant_id", tenantId)
      .order("name");
    setProducts(data ?? []);
  }

  async function saveTransaction(paymentMethod: "cash" | "qris") {
    if (!tenantId) return false;

    const { data: trx, error } = await supabase
      .from("transactions")
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        total_amount: total,
        payment_method: paymentMethod,
        status: "completed",
      })
      .select()
      .single();

    if (error || !trx) {
      alert("Gagal menyimpan transaksi.");
      return false;
    }

    const items = cart.map((c) => ({
      transaction_id: trx.id,
      product_id: c.id,
      qty: c.qty,
      price_at_sale: c.price,
      subtotal: c.price * c.qty,
    }));
    await supabase.from("transaction_items").insert(items);
    return true;
  }

  async function handleCheckoutCash() {
    if (cart.length === 0) return;
    setSaving(true);
    const ok = await saveTransaction("cash");
    setSaving(false);
    if (ok) {
      setCart([]);
      alert("Transaksi berhasil disimpan! Stok otomatis diperbarui.");
      refreshProducts();
    }
  }

  function handleCheckout() {
    if (payment === "cash") {
      handleCheckoutCash();
    } else {
      if (!qrisImageUrl) {
        alert(
          "Kamu belum upload foto QRIS toko. Buka menu Pengaturan untuk upload dulu, biar pembayaran langsung masuk ke rekening/e-wallet kamu sendiri."
        );
        return;
      }
      setShowQrisScreen(true);
    }
  }

  async function handleConfirmQrisPaid() {
    setSaving(true);
    const ok = await saveTransaction("qris");
    setSaving(false);
    if (ok) {
      setCart([]);
      setShowQrisScreen(false);
      alert("Transaksi QRIS dicatat. Stok otomatis diperbarui.");
      refreshProducts();
    }
  }

  return (
    <main className="p-6 md:p-10 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="font-display text-2xl font-bold mb-1">Transaksi Baru</h1>
        <p className="text-sm text-ink-400 mb-4">Pilih produk untuk ditambahkan ke keranjang.</p>

        <input
          placeholder="Cari produk..."
          className="input-field mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {categories.length > 0 && (
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
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className="card text-left disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-brand-500 font-display font-bold mt-1">
                Rp{p.price.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-ink-400 mt-1">Stok: {p.stock}</p>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <p className="col-span-full text-center py-10 text-ink-400">
              Produk tidak ditemukan.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="card sticky top-6">
          {showQrisScreen ? (
            <div className="text-center">
              <h2 className="font-display font-bold mb-2">Scan QRIS</h2>
              <p className="text-sm text-ink-400 mb-4">
                Total <strong>Rp{total.toLocaleString("id-ID")}</strong>. Tunjukkan QR ini ke
                pembeli.
              </p>
              {qrisImageUrl && (
                <img src={qrisImageUrl} alt="QRIS Toko" className="mx-auto rounded-xl2 mb-4 max-w-[240px]" />
              )}
              <p className="text-xs text-ink-400 mb-4">
                Setelah pembeli scan & bayar, cek notifikasi masuk di HP kamu, baru tekan tombol
                di bawah.
              </p>
              <button
                onClick={handleConfirmQrisPaid}
                disabled={saving}
                className="btn-primary w-full mb-2"
              >
                {saving ? "Menyimpan..." : "Sudah Dibayar, Selesaikan"}
              </button>
              <button
                onClick={() => setShowQrisScreen(false)}
                className="text-xs text-ink-400 hover:text-pink-500"
              >
                Batal & kembali ke keranjang
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold mb-4">Keranjang</h2>
              {cart.length === 0 ? (
                <p className="text-sm text-ink-400">Keranjang masih kosong.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {cart.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-ink-400 text-xs">
                          Rp{c.price.toLocaleString("id-ID")} x {c.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(c.id, -1)}
                          className="w-6 h-6 rounded-full bg-ink-100 text-ink-500"
                        >
                          −
                        </button>
                        <span>{c.qty}</span>
                        <button
                          onClick={() => updateQty(c.id, 1)}
                          className="w-6 h-6 rounded-full bg-brand-500 text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-ink-100 dark:border-white/10 pt-4 mb-4">
                <div className="flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span className="text-brand-500">Rp{total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setPayment("cash")}
                  className={payment === "cash" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => setPayment("qris")}
                  className={payment === "qris" ? "btn-primary flex-1" : "btn-secondary flex-1"}
                >
                  📱 QRIS
                </button>
              </div>

              {payment === "qris" && !qrisImageUrl && (
                <p className="text-xs text-gold-500 mb-3">
                  Belum ada QRIS toko.{" "}
                  <Link href="/dashboard/pengaturan" className="underline">
                    Upload dulu di Pengaturan
                  </Link>
                  .
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || saving}
                className="btn-primary w-full disabled:opacity-40"
              >
                {saving ? "Memproses..." : "Selesaikan Transaksi"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
