import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 inline-block rounded-full bg-brand-500/10 px-4 py-1 text-sm font-medium text-brand-400">
        SaaS Kasir untuk Kedai & Toko
      </div>
      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
        Antara <span className="text-brand-500">Tech</span>
      </h1>
      <p className="mt-3 text-lg text-white/50">your future partner</p>
      <p className="mt-6 max-w-md text-white/60">
        Kelola transaksi, stok, dan laporan tokomu dari satu aplikasi modern.
        Coba gratis 1 hari, tanpa ribet.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/login" className="btn-primary">
          Mulai Trial Gratis
        </Link>
        <Link href="/login" className="btn-secondary">
          Masuk
        </Link>
      </div>
    </main>
  );
}
