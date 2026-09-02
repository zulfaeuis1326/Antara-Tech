"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import { useTenant } from "@/lib/TenantContext";

export default function ProfileMenu() {
  const router = useRouter();
  const supabase = createClient();
  const { userId, name, role, tenantName } = useTenant();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.removeItem("notaku_has_used_app");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full card !p-3 flex items-center gap-3 !shadow-none border border-ink-100 dark:border-white/10 hover:border-brand-500/40 transition-colors"
      >
        <Avatar seed={userId} size={32} />
        <div className="text-xs text-left">
          <p className="font-medium dark:text-white">{name}</p>
          <p className="text-ink-400 capitalize">{role}</p>
        </div>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-full card !p-0 overflow-hidden z-50 shadow-xl">
          <div className="px-4 py-3 border-b border-ink-100 dark:border-white/10 flex items-center gap-3">
            <Avatar seed={userId} size={40} />
            <div className="text-xs">
              <p className="font-medium dark:text-white">{name}</p>
              <p className="text-ink-400 capitalize">
                {role} {tenantName ? `• ${tenantName}` : ""}
              </p>
            </div>
          </div>
          {role !== "superadmin" && (
            <Link
              href="/dashboard/pengaturan"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-500 dark:text-white/70 hover:bg-ink-50 dark:hover:bg-white/5"
            >
              ⚙️ Pengaturan
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-pink-500 hover:bg-pink-500/5 text-left"
          >
            🚪 Keluar
          </button>
        </div>
      )}
    </div>
  );
}
