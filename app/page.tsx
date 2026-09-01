import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="absolute inset-0 -z-10 bg-ink-50 dark:bg-[#14161a]">
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 rounded-full bg-gold-500/20 blur-3xl" />
      </div>

      <div className="w-24 h-24 flex items-center justify-center mb-4">
        <Image src="/logo.png" alt="NotaKu" width={96} height={96} className="object-contain drop-shadow-lg" />
      </div>

      <div className="mb-4 inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-500">
        SaaS Kasir untuk Kedai & Toko
      </div>

      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink-900 dark:text-white md:text-6xl">
        Nota
        <span className="bg-gradient-to-br from-brand-400 to-brand-600 bg-clip-text text-transparent">
          Ku
        </span>
      </h1>
      <p className="mt-3 text-lg text-ink-400">Catat Transaksi, Kelola Toko</p>
      <p className="mt-6 max-w-md text-ink-500">
        Kelola transaksi, stok, dan laporan tokomu dari satu aplikasi modern.
        Coba gratis 1 hari, tanpa ribet.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/daftar" className="btn-primary">
          Mulai Trial Gratis
        </Link>
        <Link href="/login" className="btn-secondary">
          Masuk
        </Link>
      </div>

      <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card bg-grad-purple !p-4 text-white">
          <p className="text-2xl">🧾</p>
          <p className="mt-1 text-xs font-medium">Transaksi Cepat</p>
        </div>
        <div className="card bg-grad-blue !p-4 text-white">
          <p className="text-2xl">📦</p>
          <p className="mt-1 text-xs font-medium">Kelola Stok</p>
        </div>
        <div className="card bg-grad-gold !p-4 text-white">
          <p className="text-2xl">📊</p>
          <p className="mt-1 text-xs font-medium">Laporan Real-time</p>
        </div>
        <div className="card bg-grad-teal !p-4 text-white">
          <p className="text-2xl">🏬</p>
          <p className="mt-1 text-xs font-medium">Multi-Cabang</p>
        </div>
      </div>

      <p className="mt-14 text-xs text-ink-400">
        NotaKu — dikembangkan oleh <span className="font-medium">Antara Tech</span>
      </p>
    </main>
  );
}
