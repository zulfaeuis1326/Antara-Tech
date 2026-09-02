"use client";

import { useState } from "react";

// Avatar keren yang di-generate otomatis pakai DiceBear — unik tiap user
// berdasarkan ID mereka, tanpa perlu fitur upload foto (hemat biaya storage).

export default function Avatar({
  seed,
  size = 32,
  className = "",
}: {
  seed: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const url = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=6c4ce0,3a8bfd,1fb89a,ffab3d,ff6f91`;

  if (failed) {
    // Fallback kalau gambar gagal dimuat (mis. lagi offline) — tampilkan inisial simpel.
    return (
      <div
        className={`rounded-full bg-grad-teal flex items-center justify-center text-white font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {seed.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Avatar"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`rounded-full bg-ink-100 dark:bg-white/10 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
