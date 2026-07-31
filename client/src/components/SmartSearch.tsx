import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  FileText,
  ShoppingCart,
  Briefcase,
  Truck,
  DollarSign,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Users,
  ArrowRight,
  Clock,
  Command,
  Shield
} from "lucide-react";
import { useLocation } from "wouter";

interface SearchResult {
  id: string;
  type: 'page' | 'module' | 'action';
  title: string;
  description: string;
  path: string;
  icon: any;
  color: string;
}

const allResults: SearchResult[] = [
  { id: '1', type: 'page', title: 'Dashboard', description: 'Halaman utama dashboard', path: '/', icon: LayoutDashboard, color: 'bg-blue-500' },
  { id: '2', type: 'module', title: 'Tender Generator', description: 'Buat dokumen tender otomatis', path: '/tender-generator', icon: FileText, color: 'bg-amber-500' },
  { id: '3', type: 'module', title: 'Marketplace Pasok', description: 'Jual beli material konstruksi', path: '/marketplace', icon: ShoppingCart, color: 'bg-purple-500' },
  { id: '4', type: 'module', title: 'Peluang & Tender', description: 'Cari peluang bisnis', path: '/opportunities', icon: Briefcase, color: 'bg-green-500' },
  { id: '5', type: 'module', title: 'Kendali Proyek', description: 'Monitor proyek real-time', path: '/projects', icon: LayoutDashboard, color: 'bg-indigo-500' },
  { id: '6', type: 'module', title: 'Financial', description: 'Manajemen keuangan', path: '/financial', icon: DollarSign, color: 'bg-emerald-500' },
  { id: '7', type: 'module', title: 'Sewa Alat', description: 'Rental peralatan konstruksi', path: '/equipment', icon: Truck, color: 'bg-orange-500' },
  { id: '8', type: 'module', title: 'AI Chat', description: 'Asisten AI untuk konstruksi', path: '/ai-chat', icon: MessageSquare, color: 'bg-indigo-600' },
  { id: '9', type: 'page', title: 'Analytics', description: 'Dashboard analitik bisnis', path: '/analytics', icon: BarChart3, color: 'bg-violet-500' },
  { id: '10', type: 'page', title: 'Verifikasi Dokumen', description: 'Verifikasi keaslian dokumen QR', path: '/verify', icon: Shield, color: 'bg-cyan-500' },
  { id: '11', type: 'action', title: 'Buat Tender Baru', description: 'Generate dokumen tender', path: '/tender-generator', icon: FileText, color: 'bg-amber-500' },
  { id: '12', type: 'action', title: 'Tambah Produk', description: 'Jual produk di marketplace', path: '/marketplace', icon: ShoppingCart, color: 'bg-purple-500' },
  { id: '13', type: 'action', title: 'Posting Peluang', description: 'Buat peluang bisnis baru', path: '/opportunities', icon: Briefcase, color: 'bg-green-500' },
  { id: '14', type: 'action', title: 'Verifikasi Keaslian', description: 'Cek dokumen asli atau palsu', path: '/verify', icon: Shield, color: 'bg-cyan-500' },
];

const recentSearches = ['tender', 'marketplace', 'proyek'];

export function SmartSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const filtered = allResults.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        className="hidden md:flex items-center gap-2 text-muted-foreground"
        onClick={() => setIsOpen(true)}
        data-testid="button-smart-search"
      >
        <Search className="w-4 h-4" />
        <span>Cari...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="w-3 h-3" />K
        </kbd>
      </Button>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
        data-testid="overlay-smart-search"
      />
      <Card className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 shadow-2xl overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari modul, halaman, atau aksi..."
              className="border-0 focus-visible:ring-0 p-0 text-lg"
              data-testid="input-smart-search"
            />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-search"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pencarian Terakhir
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge 
                    key={search}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setQuery(search)}
                    data-testid={`badge-recent-search-${index}`}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
              
              <p className="text-xs font-medium text-muted-foreground mb-2 mt-4">Quick Links</p>
              <div className="space-y-1">
                {allResults.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer"
                    onClick={() => handleSelect(result)}
                    data-testid={`quick-link-${result.id}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${result.color} flex items-center justify-center`}>
                      <result.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{result.title}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ditemukan hasil untuk "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer"
                  onClick={() => handleSelect(result)}
                  data-testid={`search-result-${result.id}`}
                >
                  <div className={`w-10 h-10 rounded-lg ${result.color} flex items-center justify-center`}>
                    <result.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{result.title}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {result.type === 'page' ? 'Halaman' : result.type === 'module' ? 'Modul' : 'Aksi'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">Enter</kbd>
              untuk memilih
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">Esc</kbd>
              untuk tutup
            </span>
          </div>
        </div>
      </Card>
    </>
  );
}
