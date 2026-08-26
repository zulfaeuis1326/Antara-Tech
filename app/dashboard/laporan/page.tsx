"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LaporanPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTrx, setTotalTrx] = useState(0);
  const [byMethod, setByMethod] = useState<{ method: string; total: number }[]>([]);

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

      if (!profile?.tenant_id) {
        setLoading(false);
        return;
      }

      const { data: trx } = await supabase
        .from("transactions")
        .select("total_amount, payment_method")
        .eq("tenant_id", profile.tenant_id);

      const rows = trx ?? [];
      setTotalTrx(rows.length);
      setTotalRevenue(rows.reduce((sum, r: any) => sum + (r.total_amount ?? 0), 0));

      const grouped: Record<string, number> = {};
      rows.forEach((r: any) => {
        const key = r.payment_method ?? "lainnya";
        grouped[key] = (grouped[key] ?? 0) + (r.total_amount ?? 0);
      });
      setByMethod(Object.entries(grouped).map(([method, total]) => ({ method, total })));

      setLoading(false);
    })();
  }, []);

  return (
    <main className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Laporan Penjualan</h1>
        <p className="text-sm text-ink-400">Ringkasan seluruh transaksi tokomu.</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="card bg-grad-purple text-white">
              <p className="text-sm text-white/80">Total Pendapatan</p>
              <p className="font-display text-3xl font-extrabold mt-2">
                Rp{totalRevenue.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="card bg-grad-blue text-white">
              <p className="text-sm text-white/80">Total Transaksi</p>
              <p className="font-display text-3xl font-extrabold mt-2">{totalTrx}</p>
            </div>
            <div className="card bg-grad-teal text-white">
              <p className="text-sm text-white/85">Rata-rata / Transaksi</p>
              <p className="font-display text-3xl font-extrabold mt-2">
                Rp{totalTrx > 0 ? Math.round(totalRevenue / totalTrx).toLocaleString("id-ID") : 0}
              </p>
            </div>
          </div>

          <div className="card">
            <p className="text-sm text-ink-400 mb-4 font-medium">Pendapatan per Metode Bayar</p>
            {byMethod.length === 0 ? (
              <p className="text-ink-400 text-sm">Belum ada transaksi.</p>
            ) : (
              <div className="space-y-3">
                {byMethod.map((m) => (
                  <div key={m.method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{m.method}</span>
                      <span className="text-ink-400">Rp{m.total.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-grad-purple rounded-full"
                        style={{ width: `${(m.total / totalRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
