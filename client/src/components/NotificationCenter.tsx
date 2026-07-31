import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  X, 
  Check,
  FileText,
  DollarSign,
  Briefcase,
  ShoppingCart,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  MessageSquare,
  Award,
  Shield,
  GraduationCap
} from "lucide-react";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const iconByType: Record<string, any> = {
  tender: FileText,
  payment: DollarSign,
  order: ShoppingCart,
  project: Briefcase,
  equipment: Truck,
  system: AlertCircle,
  consultation: MessageSquare,
  sbu: Award,
  iso: Shield,
  skk: GraduationCap,
};

const colorByType: Record<string, string> = {
  tender: 'bg-amber-500',
  payment: 'bg-green-500',
  order: 'bg-purple-500',
  project: 'bg-blue-500',
  equipment: 'bg-orange-500',
  system: 'bg-red-500',
  consultation: 'bg-teal-500',
  sbu: 'bg-amber-600',
  iso: 'bg-indigo-500',
  skk: 'bg-violet-500',
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  return `${Math.floor(seconds / 86400)} hari lalu`;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", "/api/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            data-testid="overlay-notifications"
          />
          <Card className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 shadow-xl max-h-[70vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Notifikasi</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">{unreadCount} baru</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => markAllReadMutation.mutate()}
                    disabled={markAllReadMutation.isPending}
                    className="text-xs"
                    data-testid="button-mark-all-read"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Tandai dibaca
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-notifications"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                  <p className="text-sm">Memuat notifikasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-sm">Tidak ada notifikasi</p>
                  <p className="text-xs mt-1">Notifikasi akan muncul saat ada update layanan Anda</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif: Notification) => {
                    const Icon = iconByType[notif.type] || AlertCircle;
                    const color = colorByType[notif.type] || 'bg-slate-500';
                    
                    return (
                      <div 
                        key={notif.id}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          !notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        data-testid={`notification-${notif.id}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">{notif.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                              <div className="flex gap-1">
                                {!notif.isRead && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => markReadMutation.mutate(notif.id)}
                                    data-testid={`button-mark-read-${notif.id}`}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 text-muted-foreground hover:text-red-500"
                                  onClick={() => deleteMutation.mutate(notif.id)}
                                  data-testid={`button-delete-${notif.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </>
  );
}
