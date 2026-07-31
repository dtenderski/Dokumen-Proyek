import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function ASKOMCoach() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/klinik-konsultasi"
      title="ASKOM Coach"
      description="Coaching & pendampingan asosiasi konstruksi — konsultasi kelembagaan dan pengembangan kapasitas"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth
    />
  );
}
