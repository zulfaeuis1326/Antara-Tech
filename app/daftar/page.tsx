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
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-ink-50 dark:bg-[#14161a]">
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-gold-500/25 blur-3xl" />
        <div className="absolute top-1/2 -left-16 w-80 h-80 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-grad-purple flex items-center justify-center font-display font-bold text-2xl text-white shadow-lg shadow-brand-500/30 mb-3">
            A
          </div>
          <p className="font-display font-bold text-lg">Antara Tech</p>
          <span className="mt-1 inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-500">
            🎉 Trial gratis 1 hari
          </span>
        </div>

        <div className="card">
          <h1 className="font-display text-2xl font-bold mb-1">Daftar Toko Baru</h1>
          <p className="text-sm text-ink-400 mb-6">
            Akses penuh semua fitur, tanpa kartu kredit.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Nama Toko</label>
              <input
                required
                placeholder="cth: Kedai Senja"
                className="input-field"
                value={form.tokoName}
                onChange={(e) => setForm({ ...form, tokoName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Nama Kamu</label>
              <input
                required
                placeholder="Nama pemilik toko"
                className="input-field"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Email</label>
              <input
                required
                type="email"
                placeholder="nama@tokokamu.com"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Nomor HP</label>
              <input
                placeholder="08xxxxxxxxxx"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Password</label>
              <input
                required
                type="password"
                minLength={6}
                placeholder="Min. 6 karakter"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Memproses..." : "Mulai Trial Gratis 🚀"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-ink-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-brand-500 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
