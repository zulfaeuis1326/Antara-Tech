import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antara Tech — Your Future Partner",
  description: "Aplikasi Kasir (POS) modern untuk kedai dan toko kamu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body>{children}</body>
    </html>
  );
}
