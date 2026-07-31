import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function ActivityTimeline({ limit = 5 }: { limit?: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-6 text-center">
          <Clock className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">Belum ada aktivitas tercatat</p>
          <p className="text-xs text-muted-foreground mt-1">Aktivitas akan muncul setelah Anda mulai menggunakan platform</p>
        </div>
      </CardContent>
    </Card>
  );
}
