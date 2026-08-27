"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LupaPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-ink-50 dark:bg-[#14161a]">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-brand-400/25 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="card">
          <h1 className="text-2xl font-display font-bold mb-1">Lupa Password?</h1>
          <p className="mb-6 text-sm text-ink-400">
            Masukkan email kamu, kami kirim link buat reset password.
          </p>

          {sent ? (
            <div className="rounded-xl2 bg-teal-500/10 px-4 py-4 text-sm text-teal-500">
              Link reset password sudah dikirim ke <strong>{email}</strong>. Cek inbox atau folder
              spam ya.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@tokokamu.com"
              />

              {error && (
                <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-ink-400">
          <Link href="/login" className="text-brand-500 font-semibold hover:underline">
            ← Kembali ke Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
