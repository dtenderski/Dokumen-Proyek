import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function Workroom() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/ruang-kelola"
      title="Workroom — Ruang Kelola"
      description="Ruang kerja kolaboratif untuk tim proyek & konsultan konstruksi"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth
    />
  );
}
