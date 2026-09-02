"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/ProfileMenu";
import { NAV } from "@/lib/nav-config";

export default function Sidebar({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between bg-white dark:bg-ink-900 min-h-screen p-5 shadow-[2px_0_20px_-8px_rgba(30,30,60,0.08)] dark:shadow-none dark:border-r dark:border-white/5 sticky top-0 no-print">
      <div>
        <div className="flex items-center justify-between mb-10 px-1">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 flex items-center justify-center">
              <Image src="/logo.png" alt="NotaKu" width={44} height={44} className="object-contain" />
            </div>
            <div>
              <p className="font-display font-bold leading-none text-ink-900 dark:text-white">NotaKu</p>
              <p className="text-[10px] text-ink-400 tracking-wide">oleh Antara Tech</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeToggle />
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
                    : "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-ink-500 dark:text-white/60 hover:bg-ink-50 dark:hover:bg-white/5"
                }
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <ProfileMenu />
      </div>
    </aside>
  );
}
