"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/TenantContext";

type Shift = {
  id: string;
  opening_cash: number;
  closing_cash: number | null;
  status: string;
  opened_at: string;
};

export default function ShiftPage() {
  const supabase = createClient();
  const { tenantId, userId, outletId } = useTenant();
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [systemTotal, setSystemTotal] = useState(0);

  async function loadActiveShift(tid: string, uid: string) {
    const { data } = await supabase
      .from("shifts")
      .select("*")
      .eq("tenant_id", tid)
      .eq("user_id", uid)
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setActiveShift(data);

    if (data) {
      const { data: trx } = await supabase
        .from("transactions")
        .select("total_amount")
        .eq("shift_id", data.id);
      setSystemTotal((trx ?? []).reduce((s: number, t: any) => s + (t.total_amount ?? 0), 0));
    }

    setLoading(false);
  }

  useEffect(() => {
    if (tenantId && userId) {
      loadActiveShift(tenantId, userId);
    } else {
      setLoading(false);
    }
  }, [tenantId, userId]);

  async function handleOpenShift(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId || !userId) return;
    await supabase.from("shifts").insert({
      tenant_id: tenantId,
      outlet_id: outletId,
      user_id: userId,
      opening_cash: Number(openingCash),
      status: "open",
    });
    setOpeningCash("");
    loadActiveShift(tenantId, userId);
  }

  async function handleCloseShift(e: React.FormEvent) {
    e.preventDefault();
    if (!activeShift || !tenantId || !userId) return;
    await supabase
      .from("shifts")
      .update({
        closing_cash: Number(closingCash),
        system_total: systemTotal,
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", activeShift.id);
    setClosingCash("");
    loadActiveShift(tenantId, userId);
  }

  if (loading) {
    return (
      <main className="p-6 md:p-10">
        <div className="skeleton h-40 w-full max-w-md" />
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Shift Kasir</h1>
        <p className="text-sm text-ink-400">Buka shift sebelum mulai transaksi, tutup saat selesai.</p>
      </div>

      <div className="card max-w-md">
        {!activeShift ? (
          <>
            <p className="font-medium mb-4">Buka Shift Baru</p>
            <form onSubmit={handleOpenShift} className="space-y-3">
              <input
                required
                type="number"
                placeholder="Modal awal (Rp)"
                className="input-field"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
              />
              <button type="submit" className="btn-primary w-full">
                Buka Shift
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="font-medium mb-1">Shift Sedang Berjalan</p>
            <p className="text-xs text-ink-400 mb-4">
              Dibuka {new Date(activeShift.opened_at).toLocaleString("id-ID")}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-ink-50 dark:bg-white/5 rounded-xl2 p-3">
                <p className="text-ink-400 text-xs">Modal Awal</p>
                <p className="font-display font-bold">
                  Rp{activeShift.opening_cash.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-ink-50 dark:bg-white/5 rounded-xl2 p-3">
                <p className="text-ink-400 text-xs">Total Transaksi Sistem</p>
                <p className="font-display font-bold text-brand-500">
                  Rp{systemTotal.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-3">
              <input
                required
                type="number"
                placeholder="Uang fisik saat tutup (Rp)"
                className="input-field"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
              />
              <button type="submit" className="btn-danger w-full">
                Tutup Shift
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
