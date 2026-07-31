import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function BrainProject() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/brain-project"
      title="Brain Project"
      description="Kelola pengetahuan & konteks proyek dengan memori AI jangka panjang"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth
    />
  );
}
