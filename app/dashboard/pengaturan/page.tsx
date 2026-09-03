"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/lib/TenantContext";

export default function PengaturanPage() {
  const supabase = createClient();
  const { tenantId } = useTenant();

  // Info toko
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  // QRIS
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
        .select("name, phone, business_type, qris_image_url")
        .eq("id", tenantId)
        .single();
      setStoreName(tenant?.name ?? "");
      setPhone(tenant?.phone ?? "");
      setBusinessType(tenant?.business_type ?? "");
      setQrisUrl(tenant?.qris_image_url ?? null);
      setLoading(false);
    })();
  }, [tenantId]);

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setSavingInfo(true);
    setInfoSaved(false);

    await supabase
      .from("tenants")
      .update({ name: storeName, phone: phone || null, business_type: businessType || null })
      .eq("id", tenantId);

    setSavingInfo(false);
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
  }

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
      <main className="p-6 md:p-10 space-y-4">
        <div className="skeleton h-40 w-full max-w-md" />
        <div className="skeleton h-64 w-full max-w-md" />
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-ink-400">Kelola info toko dan metode pembayaran.</p>
      </div>

      {/* Info Toko */}
      <div className="card max-w-md">
        <h2 className="font-display font-bold mb-1">Info Toko</h2>
        <p className="text-sm text-ink-400 mb-4">Data dasar tokomu.</p>

        <form onSubmit={handleSaveInfo} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">Nama Toko</label>
            <input
              required
              className="input-field"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">Nomor HP</label>
            <input
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">Jenis Usaha</label>
            <input
              className="input-field"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="cth: Kedai Kopi, Toko Sembako"
            />
          </div>

          {infoSaved && (
            <p className="rounded-xl2 bg-teal-500/10 px-3 py-2 text-sm text-teal-500">
              Tersimpan!
            </p>
          )}

          <button type="submit" disabled={savingInfo} className="btn-primary w-full">
            {savingInfo ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* QRIS Toko */}
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
