"use client";

import { createContext, useContext } from "react";

export type TenantContextValue = {
  userId: string;
  role: string;
  name: string;
  tenantId: string | null;
  tenantName: string | null;
  tenantStatus: string | null;
  outletId: string | null;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  value,
  children,
}: {
  value: TenantContextValue;
  children: React.ReactNode;
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

// Dipakai di semua halaman dashboard, gantikan pola lama:
// auth.getUser() + query app_users berulang tiap halaman dibuka.
export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant harus dipakai di dalam TenantProvider");
  return ctx;
}
