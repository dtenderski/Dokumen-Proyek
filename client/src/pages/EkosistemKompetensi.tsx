import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function EkosistemKompetensi() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/skk"
      title="Ekosistem Kompetensi — Portal SKK"
      description="Seluruh kebutuhan SKK dalam satu platform — LSP, TUK, Asesor, Asesi, dan Perusahaan Jasa Konstruksi"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth
    />
  );
}
