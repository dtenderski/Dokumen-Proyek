import { GustaftaEmbed } from "@/components/GustaftaEmbed";

export default function AIDokumen() {
  return (
    <GustaftaEmbed
      url="https://gustafta.my.id/bedah-dokumen"
      title="AI Dokumen"
      description="Upload dokumen, tanya isi dokumen dengan AI"
      backHref="/agent-hub"
      backLabel="Agent Hub"
      requireAuth={false}
    />
  );
}
