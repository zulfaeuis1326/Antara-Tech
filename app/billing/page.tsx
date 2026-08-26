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

    const { data, error } = await supabase.functions.invoke("create-invoice", {
      body: { tenant_id: profile.tenant_id, package_id: pkg.id },
    });

    setLoadingId(null);

    if (error) {
      alert("Gagal membuat invoice pembayaran. Coba lagi.");
      return;
    }

    if (data?.invoice_url) {
      window.location.href = data.invoice_url;
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-semibold">Pilih Paket Langganan</h1>
        <p className="mt-2 text-white/50">
          Lanjutkan pakai Antara Tech tanpa gangguan untuk tokomu.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card flex flex-col">
            <p className="text-sm text-white/50">{pkg.name}</p>
            <p className="mt-2 text-3xl font-bold text-brand-500">
              Rp{pkg.price.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-white/30">/ {pkg.duration_days} hari</p>

            <button
              onClick={() => handlePilihPaket(pkg)}
              disabled={loadingId === pkg.id}
              className="btn-primary mt-6"
            >
              {loadingId === pkg.id ? "Memproses..." : "Pilih Paket"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
