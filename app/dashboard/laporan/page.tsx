"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/TenantContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DayPoint = { date: string; label: string; total: number };
type TopProduct = { name: string; qty: number; revenue: number };

export default function LaporanPage() {
  const supabase = createClient();
  const { tenantId } = useTenant();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTrx, setTotalTrx] = useState(0);
  const [byMethod, setByMethod] = useState<{ method: string; total: number }[]>([]);
  const [trend, setTrend] = useState<DayPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 13); // 14 hari terakhir termasuk hari ini

      const [{ data: trx }, { data: itemsData }] = await Promise.all([
        supabase
          .from("transactions")
          .select("total_amount, payment_method, created_at")
          .eq("tenant_id", tenantId),
        supabase
          .from("transaction_items")
          .select("qty, subtotal, product_id, products(name), transactions!inner(tenant_id)")
          .eq("transactions.tenant_id", tenantId),
      ]);

      const rows = trx ?? [];
      setTotalTrx(rows.length);
      setTotalRevenue(rows.reduce((sum, r: any) => sum + (r.total_amount ?? 0), 0));

      const grouped: Record<string, number> = {};
      rows.forEach((r: any) => {
        const key = r.payment_method ?? "lainnya";
        grouped[key] = (grouped[key] ?? 0) + (r.total_amount ?? 0);
      });
      setByMethod(Object.entries(grouped).map(([method, total]) => ({ method, total })));

      // Tren 14 hari terakhir
      const dayMap: Record<string, number> = {};
      for (let i = 0; i < 14; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }
      rows.forEach((r: any) => {
        const key = (r.created_at ?? "").slice(0, 10);
        if (key in dayMap) dayMap[key] += r.total_amount ?? 0;
      });
      setTrend(
        Object.entries(dayMap).map(([date, total]) => ({
          date,
          label: new Date(date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
          total,
        }))
      );

      // Produk terlaris
      const prodMap: Record<string, TopProduct> = {};
      (itemsData ?? []).forEach((it: any) => {
        const pname = it.products?.name ?? "Produk dihapus";
        if (!prodMap[pname]) prodMap[pname] = { name: pname, qty: 0, revenue: 0 };
        prodMap[pname].qty += it.qty ?? 0;
        prodMap[pname].revenue += it.subtotal ?? 0;
      });
      setTopProducts(
        Object.values(prodMap)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5)
      );

      setLoading(false);
    })();
  }, [tenantId]);

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

          <div className="card mb-6">
            <p className="text-sm text-ink-400 mb-4 font-medium">Tren Pendapatan 14 Hari Terakhir</p>
            {trend.every((d) => d.total === 0) ? (
              <p className="text-ink-400 text-sm text-center py-10">Belum ada transaksi.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6c4ce0" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6c4ce0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e3f5" />
                  <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
                  />
                  <Tooltip
                    formatter={(v: number) => [`Rp${v.toLocaleString("id-ID")}`, "Pendapatan"]}
                    contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6c4ce0"
                    strokeWidth={2.5}
                    fill="url(#revGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
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

            <div className="card">
              <p className="text-sm text-ink-400 mb-4 font-medium">🏆 Produk Terlaris</p>
              {topProducts.length === 0 ? (
                <p className="text-ink-400 text-sm">Belum ada data penjualan produk.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-grad-gold text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-ink-400">{p.qty} terjual</p>
                      </div>
                      <p className="text-sm font-medium text-brand-500 shrink-0">
                        Rp{p.revenue.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
