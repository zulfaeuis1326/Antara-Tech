import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const [tenantCountRes, activeSubRes, notifRes, productCountRes, todayTxRes, attentionRes] =
    await Promise.all([
      isSuperadmin
        ? supabase.from("tenants").select("*", { count: "exact", head: true })
        : Promise.resolve({ count: null } as any),
      isSuperadmin
        ? supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active")
        : Promise.resolve({ count: null } as any),
      isSuperadmin
        ? Promise.resolve({ data: [] } as any)
        : supabase
            .from("notifications")
            .select("*")
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false })
            .limit(5),
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
      // Ringkasan buat superadmin: berapa tenant yang butuh perhatian
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-ink-400">Selamat datang kembali,</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {isSuperadmin ? "Superadmin 👋" : profile?.tenants?.name ?? "Toko Kamu"}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-grad-purple text-white sm:col-span-2">
          <p className="text-sm text-white/80">
            {isSuperadmin ? "Total Tenant Terdaftar" : "Total Produk"}
          </p>
          <p className="font-display mt-2 text-5xl font-extrabold">
            {isSuperadmin ? tenantCountRes.count ?? 0 : productCountRes.count ?? 0}
          </p>
        </div>

        <div className="card bg-grad-blue text-white">
          <p className="text-sm text-white/80">
            {isSuperadmin ? "Langganan Aktif" : "Status Toko"}
          </p>
          <p className="font-display mt-2 text-3xl font-extrabold">
            {isSuperadmin ? activeSubRes.count ?? 0 : "Aktif"}
          </p>
        </div>

        <div className="card bg-grad-gold text-white">
          <p className="text-sm text-white/85">
            {isSuperadmin ? "Perlu Perhatian" : "Pendapatan Hari Ini"}
          </p>
          <p className="font-display mt-2 text-2xl font-extrabold">
            {isSuperadmin ? totalNeedAttention : `Rp${todayRevenue.toLocaleString("id-ID")}`}
          </p>
        </div>

        <div className="card md:col-span-2">
          <p className="text-sm text-ink-400 mb-3 font-medium">
            {isSuperadmin ? "Ringkasan yang Perlu Ditindaklanjuti" : "Notifikasi Terbaru"}
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
            <ul className="space-y-2 text-sm">
              {notifRes.data && notifRes.data.length > 0 ? (
                notifRes.data.map((n: any) => (
                  <li key={n.id} className="bg-ink-50 dark:bg-white/5 rounded-2xl px-3 py-2.5 text-ink-500">
                    {n.message}
                  </li>
                ))
              ) : (
                <li className="text-ink-400">Belum ada notifikasi.</li>
              )}
            </ul>
          )}
        </div>

        <div className="card bg-grad-pink text-white md:col-span-2">
          <p className="text-sm text-white/85 mb-2 font-medium">Tips Hari Ini</p>
          <p className="text-sm text-white/90">
            {isSuperadmin
              ? "Pantau tenant yang trial-nya hampir habis di menu Tenant untuk follow-up manual."
              : "Cek menu Produk untuk pastikan stok selalu update sebelum buka toko."}
          </p>
        </div>
      </div>
    </main>
  );
}
