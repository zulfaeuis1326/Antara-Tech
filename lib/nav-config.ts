export type NavItem = {
  href: string;
  label: string;
  icon: string;
  roles: string[];
};

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "▦", roles: ["superadmin", "owner", "kasir"] },
  { href: "/dashboard/tenant", label: "Tenant", icon: "🏬", roles: ["superadmin"] },
  { href: "/dashboard/paket", label: "Paket", icon: "🏷️", roles: ["superadmin"] },
  { href: "/dashboard/audit-log", label: "Audit Log", icon: "🛡️", roles: ["superadmin"] },
  { href: "/dashboard/outlet", label: "Cabang", icon: "🏪", roles: ["owner"] },
  { href: "/dashboard/kasir", label: "Kasir", icon: "👥", roles: ["owner"] },
  { href: "/dashboard/produk", label: "Produk", icon: "📦", roles: ["owner", "kasir"] },
  { href: "/dashboard/shift", label: "Shift", icon: "⏱️", roles: ["kasir"] },
  { href: "/dashboard/transaksi", label: "Transaksi", icon: "🧾", roles: ["owner", "kasir"] },
  { href: "/dashboard/laporan", label: "Laporan", icon: "📊", roles: ["owner"] },
  { href: "/dashboard/pengaturan", label: "Pengaturan", icon: "⚙️", roles: ["owner"] },
  { href: "/billing", label: "Langganan", icon: "💳", roles: ["owner"] },
];
