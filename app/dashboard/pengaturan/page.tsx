"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/TenantContext";

export default function PengaturanPage() {
  const supabase = createClient();
  const { tenantId, tenantName } = useTenant();
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("qris_image_url")
        .eq("id", tenantId)
        .single();
      setQrisUrl(tenant?.qris_image_url ?? null);
      setLoading(false);
    })();
  }, [tenantId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${tenantId}/qris.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("store-assets")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setUploading(false);
      alert("Gagal upload: " + uploadErr.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("store-assets").getPublicUrl(path);
    const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    await supabase.from("tenants").update({ qris_image_url: url }).eq("id", tenantId);

    setQrisUrl(url);
    setUploading(false);
  }

  async function handleRemove() {
    if (!tenantId) return;
    if (!confirm("Hapus foto QRIS ini?")) return;
    await supabase.from("tenants").update({ qris_image_url: null }).eq("id", tenantId);
    setQrisUrl(null);
  }

  if (loading) {
    return (
      <main className="p-6 md:p-10">
        <div className="skeleton h-64 w-full max-w-md" />
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Pengaturan Toko</h1>
        <p className="text-sm text-ink-400">{tenantName}</p>
      </div>

      <div className="card max-w-md">
        <h2 className="font-display font-bold mb-1">QRIS Toko</h2>
        <p className="text-sm text-ink-400 mb-4">
          Upload foto QRIS milikmu sendiri (dari DANA, OVO, BCA, atau bank lain). Ini yang akan
          ditampilkan ke pembeli saat memilih bayar QRIS — uang masuk{" "}
          <strong>langsung ke rekening/e-wallet kamu</strong>, bukan lewat NotaKu.
        </p>

        {qrisUrl ? (
          <div className="text-center">
            <img src={qrisUrl} alt="QRIS Toko" className="mx-auto rounded-xl2 mb-4 max-w-[240px]" />
            <div className="flex gap-2">
              <label className="btn-secondary flex-1 cursor-pointer">
                {uploading ? "Mengunggah..." : "Ganti Foto"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
              <button onClick={handleRemove} className="btn-danger flex-1">
                Hapus
              </button>
            </div>
          </div>
        ) : (
          <label className="btn-primary w-full cursor-pointer block text-center">
            {uploading ? "Mengunggah..." : "Upload Foto QRIS"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>
    </main>
  );
}
