import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function MiniAppsPage() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/toolkit"
      title="Mini Apps & Toolkit Gustafta"
      description="10+ tools digital konstruksi — Bedah Dokumen, Exec. Summary, SKK tools, dan lainnya"
      backHref="/"
      backLabel="Beranda"
      requireAuth
    />
  );
}
