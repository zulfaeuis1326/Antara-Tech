"use client";

import Script from "next/script";

// Live chat pakai Tawk.to (gratis selamanya, tanpa perlu backend sendiri).
// Cara aktifin:
// 1. Daftar gratis di https://www.tawk.to
// 2. Buat 1 "Property" baru, nanti dikasih Property ID + Widget ID
// 3. Tambah 2 environment variable di Vercel:
//    NEXT_PUBLIC_TAWKTO_PROPERTY_ID=xxxxxxxxxxxx
//    NEXT_PUBLIC_TAWKTO_WIDGET_ID=xxxxxxxxxxxx
// Kalau belum diisi, widget ini otomatis tidak muncul (tidak error).

export default function LiveChatWidget() {
  const propertyId = process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID;
  const widgetId = process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID;

  if (!propertyId || !widgetId) return null;

  return (
    <Script id="tawkto-widget" strategy="lazyOnload">
      {`
        var Tawk_API = Tawk_API || {};
        var Tawk_LoadStart = new Date();
        (function () {
          var s1 = document.createElement("script"),
            s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = "https://embed.tawk.to/${propertyId}/${widgetId}";
          s1.charset = "UTF-8";
          s1.setAttribute("crossorigin", "*");
          s0.parentNode.insertBefore(s1, s0);
        })();
      `}
    </Script>
  );
}
