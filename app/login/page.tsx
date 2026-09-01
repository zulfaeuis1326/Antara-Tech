"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  // Preload halaman dashboard dari awal, biar begitu login sukses,
  // pindah halamannya instan (JS sudah ada di browser, tinggal render).
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Cek rate limit CUMA kalau sebelumnya udah pernah gagal di sesi ini —
    // biar percobaan pertama (kasus paling umum: password langsung benar)
    // tidak kena network round-trip tambahan yang bikin lambat.
    if (hasFailedOnce) {
      const { data: blocked } = await supabase.rpc("is_login_blocked", { p_email: email });
      if (blocked) {
        setLoading(false);
        setError("Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.");
        return;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    // Catat percobaan login (berhasil/gagal) untuk rate limiting — tidak perlu ditunggu (fire-and-forget)
    supabase.from("login_attempts").insert({ email, success: !error });

    if (error) {
      setHasFailedOnce(true);
      setLoading(false);
      setError("Email atau password salah. Coba lagi ya.");
      return;
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 500);
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-10">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 -z-10 bg-ink-50 dark:bg-[#14161a]">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-brand-400/30 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-gold-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-20 h-20 flex items-center justify-center mb-2">
            <Image src="/logo.png" alt="NotaKu" width={80} height={80} className="object-contain drop-shadow-lg" />
          </div>
          <p className="font-display font-bold text-lg">NotaKu</p>
          <p className="text-xs text-ink-400 tracking-wide">by Antara Tech</p>
        </div>

        <div className="card backdrop-blur relative overflow-hidden">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 animate-[fadeIn_0.2s_ease]">
              <div className="w-16 h-16 rounded-full bg-teal-500/15 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-teal-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    style={{
                      strokeDasharray: 24,
                      strokeDashoffset: 0,
                      animation: "checkmark 0.4s ease forwards",
                    }}
                  />
                </svg>
              </div>
              <p className="font-display font-bold text-lg">Berhasil Masuk!</p>
              <p className="text-sm text-ink-400 mt-1">Mengarahkan ke dashboard...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold mb-1">Selamat Datang 👋</h1>
              <p className="mb-6 text-sm text-ink-400">Masuk untuk lanjut kelola tokomu.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-ink-500 font-medium">Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@tokokamu.com"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-ink-500 font-medium">Password</label>
                    <Link href="/lupa-password" className="text-xs text-brand-500 hover:underline">
                      Lupa password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-ink-400">
                <Link href="/login-hp" className="text-brand-500 hover:underline">
                  Masuk pakai nomor HP →
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-ink-400">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-brand-500 font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </main>
  );
}
