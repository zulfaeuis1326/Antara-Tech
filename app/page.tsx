import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 inline-block rounded-full bg-purple/10 px-4 py-1.5 text-sm font-medium text-purple">
        SaaS Kasir untuk Kedai & Toko
      </div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-6xl">
        Antara{" "}
        <span className="bg-gradient-to-br from-purple-light to-purple bg-clip-text text-transparent">
          Tech
        </span>
      </h1>
      <p className="mt-3 text-lg text-muted">your future partner</p>
      <p className="mt-6 max-w-md text-ink/60">
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

      <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card !bg-gradient-to-br !from-purple-light !to-purple !p-4 text-white">
          <p className="text-2xl">🧾</p>
          <p className="mt-1 text-xs font-medium">Transaksi Cepat</p>
        </div>
        <div className="card !bg-gradient-to-br !from-blue-light !to-blue !p-4 text-white">
          <p className="text-2xl">📦</p>
          <p className="mt-1 text-xs font-medium">Kelola Stok</p>
        </div>
        <div className="card !bg-gradient-to-br !from-gold-light !to-gold !p-4 text-white">
          <p className="text-2xl">📊</p>
          <p className="mt-1 text-xs font-medium">Laporan Real-time</p>
        </div>
        <div className="card !bg-gradient-to-br !from-teal-light !to-teal !p-4 text-white">
          <p className="text-2xl">🏬</p>
          <p className="mt-1 text-xs font-medium">Multi-Cabang</p>
        </div>
      </div>
    </main>
  );
}
