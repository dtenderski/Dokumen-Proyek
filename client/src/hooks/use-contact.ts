import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertContactMessage } from "@shared/schema";

export function useCreateContact() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      const res = await fetch(api.contact.create.path, {
        method: api.contact.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send message');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pesan Terkirim",
        description: "Terima kasih telah menghubungi kami. Kami akan segera merespons.",
        variant: "default", 
        className: "bg-green-600 text-white border-none"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Mengirim",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
