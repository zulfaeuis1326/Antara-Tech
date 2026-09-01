import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { TenantProvider } from "@/lib/TenantContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("app_users")
    .select("*, tenants(status, name)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  if (profile.role !== "superadmin") {
    const { data: settings } = await supabase
      .from("app_settings")
      .select("maintenance_mode")
      .single();
    if (settings?.maintenance_mode) {
      redirect("/maintenance");
    }
  }

  const tenantStatus = (profile as any).tenants?.status ?? null;
  const tenantName = (profile as any).tenants?.name ?? null;

  if (profile.role !== "superadmin" && tenantStatus === "locked") {
    redirect("/billing?locked=1");
  }

  return (
    <TenantProvider
      value={{
        userId: user.id,
        role: profile.role,
        name: profile.name ?? "Pengguna",
        tenantId: profile.tenant_id ?? null,
        tenantName,
        tenantStatus,
        outletId: profile.outlet_id ?? null,
      }}
    >
      <div className="md:flex min-h-screen">
        <Sidebar role={profile.role} name={profile.name ?? "Pengguna"} />
        <div className="flex-1 min-w-0">
          <MobileNav role={profile.role} name={profile.name ?? "Pengguna"} />
          {children}
        </div>
      </div>
    </TenantProvider>
  );
}
