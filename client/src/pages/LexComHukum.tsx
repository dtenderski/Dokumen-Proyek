import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function LexComHukum() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/klinik-konsultasi"
      title="LexCom — Klinik Hukum Konstruksi"
      description="Konsultasi hukum kontrak, regulasi pengadaan, dan sengketa proyek dengan AI spesialis"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth
    />
  );
}
