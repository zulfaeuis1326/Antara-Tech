"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import ProfileMenu from "@/components/ProfileMenu";
import { NAV } from "@/lib/nav-config";

export default function MobileNav({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
            className="w-9 h-9 rounded-xl2 bg-ink-50 dark:bg-white/10 flex items-center justify-center text-lg mr-1"
          >
            ☰
          </button>
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src="/logo.png" alt="NotaKu" width={40} height={40} className="object-contain" />
          </div>
          <p className="font-display font-bold text-ink-900 dark:text-white">NotaKu</p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-white dark:bg-ink-900 h-full p-5 flex flex-col justify-between shadow-2xl animate-[slideIn_.2s_ease]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Image src="/logo.png" alt="NotaKu" width={40} height={40} className="object-contain" />
                  </div>
                  <p className="font-display font-bold text-ink-900 dark:text-white">NotaKu</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Tutup menu"
                  className="w-8 h-8 rounded-full bg-ink-50 dark:bg-white/10 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1 text-sm">
                {items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={
                        active
                          ? "flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-brand-500 text-white font-medium"
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
          </div>
        </div>
      )}
    </div>
  );
}
