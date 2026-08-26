"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DaftarPage() {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState({
    tokoName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authErr || !authData.user) {
      setError(authErr?.message ?? "Gagal mendaftar.");
      setLoading(false);
      return;
    }

    const trialEnds = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .insert({
        name: form.tokoName,
        phone: form.phone || null,
        status: "trial",
        subscription_plan: "none",
        trial_ends_at: trialEnds,
      })
      .select()
      .single();

    if (tenantErr || !tenant) {
      setError("Gagal membuat data toko: " + tenantErr?.message);
      setLoading(false);
      return;
    }

    const { error: profileErr } = await supabase.from("app_users").insert({
      id: authData.user.id,
      name: form.ownerName,
      role: "owner",
      tenant_id: tenant.id,
    });

    setLoading(false);

    if (profileErr) {
      setError("Gagal menyiapkan akun owner: " + profileErr.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="card w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold mb-1">Daftar Toko Baru</h1>
        <p className="text-sm text-ink-400 mb-6">
          Trial gratis 1 hari, akses penuh semua fitur.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nama toko"
            className="input-field"
            value={form.tokoName}
            onChange={(e) => setForm({ ...form, tokoName: e.target.value })}
          />
          <input
            required
            placeholder="Nama kamu (pemilik)"
            className="input-field"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          />
          <input
            required
            type="email"
            placeholder="Email"
            className="input-field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Nomor HP"
            className="input-field"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Password (min. 6 karakter)"
            className="input-field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && (
            <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Memproses..." : "Mulai Trial Gratis"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-brand-500 font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
