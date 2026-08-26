"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/dashboard/tenant", label: "Tenant", icon: "🏬", superadminOnly: true },
  { href: "/dashboard/produk", label: "Produk", icon: "📦" },
  { href: "/dashboard/transaksi", label: "Transaksi", icon: "🧾" },
  { href: "/dashboard/laporan", label: "Laporan", icon: "📊" },
  { href: "/billing", label: "Langganan", icon: "💳", hideForSuperadmin: true },
];

export default function Sidebar({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const items = NAV.filter((item) => {
    if (item.superadminOnly && role !== "superadmin") return false;
    if (item.hideForSuperadmin && role === "superadmin") return false;
    return true;
  });

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between bg-white min-h-screen p-5 shadow-[2px_0_20px_-8px_rgba(30,30,60,0.08)]">
      <div>
        <div className="flex items-center gap-2 mb-10 px-1">
          <div className="w-10 h-10 rounded-2xl bg-grad-purple flex items-center justify-center font-display font-bold text-lg text-white">
            A
          </div>
          <div>
            <p className="font-display font-bold leading-none text-ink-900">Antara Tech</p>
            <p className="text-[10px] text-ink-400 tracking-wide">YOUR FUTURE PARTNER</p>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-brand-500 text-white font-medium shadow-md shadow-brand-500/20"
                    : "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-ink-500 hover:bg-ink-50"
                }
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <div className="card !p-3 flex items-center gap-3 !shadow-none border border-ink-100 mb-2">
          <div className="w-8 h-8 rounded-full bg-grad-teal flex items-center justify-center text-xs font-bold text-white">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-xs">
            <p className="font-medium">{name}</p>
            <p className="text-ink-400 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-xs text-ink-400 hover:text-pink-500 px-3 py-2"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
