import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("app_users")
    .select("*, tenants(name)")
    .eq("id", user.id)
    .single();

  const isSuperadmin = profile?.role === "superadmin";
  const tenantId = profile?.tenant_id;

  const [
    tenantCountRes,
    activeSubRes,
    productCountRes,
    todayTxRes,
    recentTxRes,
    attentionRes,
  ] = await Promise.all([
    isSuperadmin
      ? supabase.from("tenants").select("*", { count: "exact", head: true })
      : Promise.resolve({ count: null } as any),
    isSuperadmin
      ? supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active")
      : Promise.resolve({ count: null } as any),
    !isSuperadmin
      ? supabase.from("products").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId)
      : Promise.resolve({ count: null } as any),
    !isSuperadmin
      ? supabase
          .from("transactions")
          .select("total_amount")
          .eq("tenant_id", tenantId)
          .gte("created_at", new Date().toISOString().slice(0, 10))
      : Promise.resolve({ data: [] } as any),
    !isSuperadmin
      ? supabase
          .from("transactions")
          .select("id, total_amount, payment_method, created_at")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] } as any),
    isSuperadmin
      ? Promise.all([
          supabase
            .from("tenants")
            .select("*", { count: "exact", head: true })
            .eq("status", "trial")
            .lt("trial_ends_at", new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from("tenants").select("*", { count: "exact", head: true }).eq("status", "locked"),
          supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("status", "active")
            .lt("end_date", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()),
        ])
      : Promise.resolve(null),
  ]);

  const trialEndingSoon = attentionRes?.[0]?.count ?? 0;
  const lockedCount = attentionRes?.[1]?.count ?? 0;
  const subEndingSoon = attentionRes?.[2]?.count ?? 0;
  const totalNeedAttention = trialEndingSoon + lockedCount + subEndingSoon;

  const todayRevenue = (todayTxRes.data ?? []).reduce(
    (sum: number, t: any) => sum + (t.total_amount ?? 0),
    0
  );

  return (
    <main className="p-6 md:p-10">
      <div className="mb-6">
        <p className="text-sm text-ink-400">Selamat datang kembali,</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          {isSuperadmin ? "Superadmin 👋" : profile?.tenants?.name ?? "Toko Kamu"}
        </h1>
      </div>

      {/* Kartu utama, gaya "balance card" */}
      <div className="card bg-grad-purple text-white mb-5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-16 h-16 rounded-full bg-white/10" />
        <p className="text-sm text-white/80 relative">
          {isSuperadmin ? "Total Tenant Terdaftar" : "Pendapatan Hari Ini"}
        </p>
        <p className="font-display mt-2 text-4xl md:text-5xl font-extrabold relative">
          {isSuperadmin ? tenantCountRes.count ?? 0 : `Rp${todayRevenue.toLocaleString("id-ID")}`}
        </p>
        <div className="flex gap-4 mt-4 relative text-xs text-white/70">
          {isSuperadmin ? (
            <span>{activeSubRes.count ?? 0} langganan aktif</span>
          ) : (
            <span>{productCountRes.count ?? 0} produk terdaftar</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ringkasan / notifikasi */}
        <div className="card">
          <p className="text-sm text-ink-400 mb-3 font-medium">
            {isSuperadmin ? "Perlu Ditindaklanjuti" : "Tips Hari Ini"}
          </p>
          {isSuperadmin ? (
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between bg-ink-50 dark:bg-white/5 rounded-2xl px-3 py-2.5">
                <span className="text-ink-500">Trial akan habis (≤2 hari)</span>
                <span className={trialEndingSoon > 0 ? "badge-trial" : "badge-active"}>
                  {trialEndingSoon} tenant
                </span>
              </li>
              <li className="flex items-center justify-between bg-ink-50 dark:bg-white/5 rounded-2xl px-3 py-2.5">
                <span className="text-ink-500">Akun terkunci</span>
                <span className={lockedCount > 0 ? "badge-locked" : "badge-active"}>
                  {lockedCount} tenant
                </span>
              </li>
              <li className="flex items-center justify-between bg-ink-50 dark:bg-white/5 rounded-2xl px-3 py-2.5">
                <span className="text-ink-500">Langganan akan habis (≤3 hari)</span>
                <span className={subEndingSoon > 0 ? "badge-trial" : "badge-active"}>
                  {subEndingSoon} tenant
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-ink-500 bg-ink-50 dark:bg-white/5 rounded-2xl px-4 py-3">
              💡 Cek menu Produk untuk pastikan stok selalu update sebelum buka toko.
            </p>
          )}
        </div>

        {/* Transaksi terbaru, gaya list dengan ikon + jumlah berwarna */}
        <div className="card !p-0 overflow-hidden">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <p className="text-sm text-ink-400 font-medium">
              {isSuperadmin ? "Total Ringkasan" : "Transaksi Terbaru"}
            </p>
            {!isSuperadmin && (
              <Link href="/dashboard/laporan" className="text-[11px] text-brand-500 font-medium">
                Lihat semua
              </Link>
            )}
          </div>
          {isSuperadmin ? (
            <p className="text-sm text-ink-400 px-5 pb-4">
              {totalNeedAttention === 0
                ? "Semua tenant dalam kondisi aman. 🎉"
                : `${totalNeedAttention} tenant butuh perhatian kamu.`}
            </p>
          ) : recentTxRes.data && recentTxRes.data.length > 0 ? (
            <div>
              {recentTxRes.data.map((t: any) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-5 py-3 border-t border-ink-50 dark:border-white/5"
                >
                  <span className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-500 flex items-center justify-center text-base shrink-0">
                    {t.payment_method === "qris" ? "📱" : "💵"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{t.payment_method}</p>
                    <p className="text-[11px] text-ink-400">
                      {new Date(t.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-teal-500 shrink-0">
                    +Rp{(t.total_amount ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-400 px-5 pb-4">Belum ada transaksi.</p>
          )}
        </div>
      </div>
    </main>
  );
}
