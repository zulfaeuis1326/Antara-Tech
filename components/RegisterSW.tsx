"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Diam saja kalau gagal — bukan fitur kritis, jangan ganggu pengalaman utama.
      });
    }
  }, []);

  return null;
}
