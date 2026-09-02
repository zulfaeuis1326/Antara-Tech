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
  const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=6c4ce0,3a8bfd,1fb89a,ffab3d,ff6f91`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Avatar"
      width={size}
      height={size}
      className={`rounded-full bg-ink-100 dark:bg-white/10 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
