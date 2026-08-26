import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("app_users")
    .select("*, tenants(status)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Blokir akses kalau tenant terkunci (langganan habis) — kecuali superadmin
  const tenantStatus = (profile as any).tenants?.status;
  if (profile.role !== "superadmin" && tenantStatus === "locked") {
    redirect("/billing?locked=1");
  }

  return (
    <div className="flex">
      <Sidebar role={profile.role} name={profile.name ?? "Pengguna"} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
