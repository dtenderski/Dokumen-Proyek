import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function BimtekSKK() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/skk"
      title="Bimtek SKK — Portal Ekosistem SKK"
      description="Bimbingan teknis, persiapan uji kompetensi, dan portal SKK KKNI L1-9 untuk tenaga ahli konstruksi"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth
    />
  );
}
