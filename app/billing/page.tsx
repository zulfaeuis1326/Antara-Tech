"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Pkg = {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: Record<string, unknown>;
};

const CARD_GRADIENTS = ["bg-grad-gold", "bg-grad-purple", "bg-grad-teal"];

export default function BillingPage() {
  const supabase = createClient();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true })
      .then(({ data }) => setPackages(data ?? []));
  }, [supabase]);

  async function handlePilihPaket(pkg: Pkg) {
    setLoadingId(pkg.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("app_users")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) {
      setLoadingId(null);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase.functions.invoke("create-invoice", {
      body: { tenant_id: profile.tenant_id, package_id: pkg.id },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    setLoadingId(null);

    if (error || data?.error) {
      alert("Gagal membuat invoice pembayaran. Coba lagi.");
      return;
    }

    if (data?.invoice_url) {
      window.location.href = data.invoice_url;
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-ink-50 dark:bg-[#14161a]">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white">
          Pilih Paket Langganan
        </h1>
        <p className="mt-2 text-ink-400">
          Lanjutkan pakai Antara Tech tanpa gangguan untuk tokomu.
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
          <div className="skeleton h-56" />
          <div className="skeleton h-56" />
          <div className="skeleton h-56" />
        </div>
      ) : (
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`card flex flex-col text-white ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`}
            >
              <p className="text-sm text-white/85 font-medium">{pkg.name}</p>
              <p className="font-display mt-2 text-3xl font-extrabold">
                Rp{pkg.price.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-white/75">/ {pkg.duration_days} hari</p>

              {Array.isArray((pkg.features as any)?.list) && (pkg.features as any).list.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-white/90">
                  {(pkg.features as any).list.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => handlePilihPaket(pkg)}
                disabled={loadingId === pkg.id}
                className="mt-6 rounded-xl2 bg-white px-5 py-2.5 font-medium text-ink-900 transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-60"
              >
                {loadingId === pkg.id ? "Memproses..." : "Pilih Paket"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
