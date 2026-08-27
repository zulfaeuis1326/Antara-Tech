"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦", roles: ["superadmin", "owner", "kasir"] },
  { href: "/dashboard/tenant", label: "Tenant", icon: "🏬", roles: ["superadmin"] },
  { href: "/dashboard/outlet", label: "Cabang", icon: "🏪", roles: ["owner"] },
  { href: "/dashboard/kasir", label: "Kasir", icon: "👥", roles: ["owner"] },
  { href: "/dashboard/produk", label: "Produk", icon: "📦", roles: ["owner", "kasir"] },
  { href: "/dashboard/shift", label: "Shift", icon: "⏱️", roles: ["kasir"] },
  { href: "/dashboard/transaksi", label: "Transaksi", icon: "🧾", roles: ["owner", "kasir"] },
  { href: "/dashboard/laporan", label: "Laporan", icon: "📊", roles: ["owner"] },
  { href: "/billing", label: "Langganan", icon: "💳", roles: ["owner"] },
];

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: typeof NAV;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1 text-sm">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              active
                ? "flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-brand-500 text-white font-medium shadow-md shadow-brand-500/20"
                : "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-ink-500 dark:text-white/60 hover:bg-ink-50 dark:hover:bg-white/5"
            }
          >
            <span>{item.icon}</span> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Top bar mobile */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-ink-900 px-4 py-3 sticky top-0 z-40 shadow-sm dark:border-b dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-grad-purple flex items-center justify-center font-display font-bold text-sm text-white">
            A
          </div>
          <p className="font-display font-bold text-ink-900 dark:text-white">Antara Tech</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
            className="w-9 h-9 rounded-xl bg-ink-50 dark:bg-white/10 flex items-center justify-center text-lg"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-white dark:bg-ink-900 h-full p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <p className="font-display font-bold text-ink-900 dark:text-white">Menu</p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-xl bg-ink-50 dark:bg-white/10 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div>
              <div className="card !p-3 flex items-center gap-3 !shadow-none border border-ink-100 dark:border-white/10 mb-2">
                <div className="w-8 h-8 rounded-full bg-grad-teal flex items-center justify-center text-xs font-bold text-white">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-xs">
                  <p className="font-medium dark:text-white">{name}</p>
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
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-white dark:bg-ink-900 min-h-screen p-5 shadow-[2px_0_20px_-8px_rgba(30,30,60,0.08)] dark:shadow-none dark:border-r dark:border-white/5">
        <div>
          <div className="flex items-center justify-between mb-10 px-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-grad-purple flex items-center justify-center font-display font-bold text-lg text-white">
                A
              </div>
              <div>
                <p className="font-display font-bold leading-none text-ink-900 dark:text-white">Antara Tech</p>
                <p className="text-[10px] text-ink-400 tracking-wide">YOUR FUTURE PARTNER</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <NavLinks items={items} pathname={pathname} />
        </div>

        <div>
          <div className="card !p-3 flex items-center gap-3 !shadow-none border border-ink-100 dark:border-white/10 mb-2">
            <div className="w-8 h-8 rounded-full bg-grad-teal flex items-center justify-center text-xs font-bold text-white">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-xs">
              <p className="font-medium dark:text-white">{name}</p>
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
    </>
  );
}
