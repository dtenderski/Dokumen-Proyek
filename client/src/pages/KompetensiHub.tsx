import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function KompetensiHub() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/toolkit"
      title="KompetensiHub"
      description="Tools SKK, tracker kompetensi, dan roadmap sertifikasi tenaga ahli konstruksi"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth
    />
  );
}
