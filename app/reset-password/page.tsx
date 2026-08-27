"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-ink-50 dark:bg-[#14161a]">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-teal-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-sm card">
        <h1 className="text-2xl font-display font-bold mb-1">Buat Password Baru</h1>
        <p className="mb-6 text-sm text-ink-400">Password baru minimal 6 karakter.</p>

        {done ? (
          <div className="rounded-xl2 bg-teal-500/10 px-4 py-4 text-sm text-teal-500">
            Password berhasil diubah! Mengalihkan ke halaman masuk...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password baru"
            />

            {error && (
              <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Menyimpan..." : "Simpan Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
