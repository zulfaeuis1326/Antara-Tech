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

  // Statistik ringkas — superadmin lihat semua tenant, owner/kasir lihat tokonya sendiri
  const [{ count: tenantCount }, { count: activeSubCount }, { data: recentNotifs }] =
    await Promise.all([
      isSuperadmin
        ? supabase.from("tenants").select("*", { count: "exact", head: true })
        : Promise.resolve({ count: null } as any),
      isSuperadmin
        ? supabase
            .from("subscriptions")
            .select("*", { count: "exact", head: true })
            .eq("status", "active")
        : Promise.resolve({ count: null } as any),
      supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/40">Selamat datang kembali,</p>
          <h1 className="text-2xl font-semibold">
            {isSuperadmin ? "Superadmin" : profile?.tenants?.name ?? "Toko Kamu"}
          </h1>
        </div>
        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">
          {profile?.role ?? "..."}
        </span>
      </header>

      {/* Bento grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
        <div className="card md:col-span-2 md:row-span-2 flex flex-col justify-between">
          <div>
            <p className="text-sm text-white/50">
              {isSuperadmin ? "Total Tenant Terdaftar" : "Ringkasan Hari Ini"}
            </p>
            <p className="mt-2 text-5xl font-bold text-brand-500">
              {isSuperadmin ? tenantCount ?? 0 : "—"}
            </p>
          </div>
          <p className="mt-4 text-xs text-white/30">Diperbarui real-time dari database.</p>
        </div>

        <div className="card">
          <p className="text-sm text-white/50">
            {isSuperadmin ? "Langganan Aktif" : "Stok Menipis"}
          </p>
          <p className="mt-2 text-3xl font-semibold text-teal-500">
            {isSuperadmin ? activeSubCount ?? 0 : "—"}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-white/50">Notifikasi Terbaru</p>
          <p className="mt-2 text-3xl font-semibold">{recentNotifs?.length ?? 0}</p>
        </div>

        <div className="card md:col-span-2">
          <p className="mb-3 text-sm text-white/50">Aktivitas Terbaru</p>
          <ul className="space-y-2">
            {recentNotifs && recentNotifs.length > 0 ? (
              recentNotifs.map((n: any) => (
                <li
                  key={n.id}
                  className="rounded-xl2 bg-ink-900 px-3 py-2 text-sm text-white/70"
                >
                  {n.message}
                </li>
              ))
            ) : (
              <li className="text-sm text-white/30">Belum ada aktivitas.</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
