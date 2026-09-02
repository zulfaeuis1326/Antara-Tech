"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginHpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalizePhone(p: string) {
    const digits = p.replace(/\D/g, "");
    if (digits.startsWith("0")) return "+62" + digits.slice(1);
    if (digits.startsWith("62")) return "+" + digits;
    if (digits.startsWith("+")) return digits;
    return "+62" + digits;
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token: otp,
      type: "sms",
    });

    setLoading(false);
    if (error) {
      setError("Kode OTP salah atau kedaluwarsa.");
      return;
    }
    localStorage.setItem("notaku_has_used_app", "true");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 py-10">
      <div className="absolute inset-0 -z-10 bg-ink-50 dark:bg-[#14161a]">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-brand-400/25 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-20 h-20 flex items-center justify-center mb-2">
            <Image src="/logo.png" alt="NotaKu" width={80} height={80} className="object-contain drop-shadow-lg" />
          </div>
          <p className="font-display font-bold text-lg">NotaKu</p>
          <p className="text-xs text-ink-400 tracking-wide">by NotaKu</p>
        </div>

        <div className="card">
          <h1 className="text-2xl font-display font-bold mb-1">Masuk dengan HP</h1>
          <p className="mb-6 text-sm text-ink-400">
            {step === "phone"
              ? "Masukkan nomor HP terdaftar, kami kirim kode OTP."
              : `Kode OTP dikirim ke ${normalizePhone(phone)}`}
          </p>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input
                type="tel"
                required
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />

              {error && (
                <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Mengirim..." : "Kirim Kode OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                className="input-field text-center text-2xl tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="······"
              />

              {error && (
                <p className="rounded-xl2 bg-pink-500/10 px-3 py-2 text-sm text-pink-500">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs text-ink-400 hover:text-brand-500 w-full text-center"
              >
                Ganti nomor HP
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-ink-400">
          <Link href="/login" className="text-brand-500 font-semibold hover:underline">
            ← Masuk pakai email
          </Link>
        </p>
      </div>
    </main>
  );
}
