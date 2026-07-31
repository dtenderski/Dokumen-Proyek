import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { 
  ArrowLeft, Sparkles, Send, Loader2, Bot, User,
  Building2, Award, GraduationCap, Shield, FileText,
  FolderOpen, Zap, BookMarked, RotateCcw, Copy, Check,
  AlertCircle, RefreshCw, ShieldAlert, PlusCircle, History, X, MessageSquare,
  MoreHorizontal, Pencil, Trash2, ServerCrash
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  errorCode?: "quota_exceeded" | "auth_error" | "config_error" | "network_error" | "server_error";
}

interface ChatSessionSummary {
  id: number;
  title: string;
  updatedAt: string;
  createdAt: string;
}

const QUICK_PROMPTS = [
  { icon: FileText, text: "Buatkan draft Surat Penawaran Harga lengkap", color: "text-green-500" },
  { icon: Award, text: "Langkah lengkap mengurus SBU Konstruksi LPJK", color: "text-amber-500" },
  { icon: FolderOpen, text: "Cara daftar LPSE dan ikut tender pemerintah", color: "text-orange-500" },
  { icon: GraduationCap, text: "Cara urus SKK tenaga ahli dan terampil konstruksi", color: "text-purple-500" },
  { icon: BookMarked, text: "Apa itu TKDN dan cara memenuhi ambang batas?", color: "text-rose-500" },
  { icon: Building2, text: "Roadmap lengkap mendirikan perusahaan kontraktor", color: "text-blue-500" },
  { icon: Zap, text: "Perubahan penting Perpres 46/2025 untuk pengadaan", color: "text-teal-500" },
  { icon: Shield, text: "Cara urus NIB dan SBUJK via OSS-RBA PP 28/2025", color: "text-indigo-500" },
  { icon: FileText, text: "Buatkan draft Addendum Kontrak karena force majeure", color: "text-cyan-500" },
  { icon: Sparkles, text: "Strategi menang tender dengan harga paling kompetitif", color: "text-yellow-500" },
];

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Halo! Senang bisa ngobrol dengan Anda di sini.

Saya asisten AI dari **DokumenProyek.com**. Ada beberapa hal yang bisa saya bantu:

- **Tanya jawab** seputar SBU, SKK, Legalitas, Perizinan, ISO/SMK3, Tender, dan Proyek konstruksi
- **Draft dokumen** siap pakai — surat penawaran, pakta integritas, RK3K, SPMK, berita acara, dan lainnya
- **Saran dan strategi** mengikuti tender agar lebih kompetitif
- **Meluruskan** jika ada informasi atau regulasi yang kurang tepat

Mau tanya apa, atau butuh draft dokumen apa? Cerita saja — saya siap bantu.`,
  timestamp: new Date(),
};

export default function AIChat() {
  const { user } = useAuth();
  const displayName = user?.firstName || user?.email?.split("@")[0] || "Pengguna";
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Session history sidebar
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null);

  // Rename / delete state
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close "…" dropdown when clicking elsewhere
  useEffect(() => {
    if (menuOpenId === null) return;
    const handler = () => setMenuOpenId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpenId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount for authenticated users
  useEffect(() => {
    if (!user || historyLoaded) return;
    setHistoryLoaded(true);

    fetch("/api/chat/history", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.messages || data.messages.length === 0) return;
        setSessionId(data.sessionId);
        const restored: Message[] = data.messages.map((m: any) => ({
          id: `restored-${m.id}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages([WELCOME_MESSAGE, ...restored]);
      })
      .catch(() => { /* silently ignore */ });
  }, [user, historyLoaded]);

  // Load session list when history panel opens
  const openHistoryPanel = useCallback(async () => {
    setShowHistory(true);
    if (!user) return;
    setSessionsLoading(true);
    setSessionsError(false);
    try {
      const res = await fetch("/api/chat/sessions", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      } else {
        setSessionsError(true);
      }
    } catch {
      setSessionsError(true);
    } finally {
      setSessionsLoading(false);
    }
  }, [user]);

  // Rename a session
  const startRename = (s: ChatSessionSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setRenamingId(s.id);
    setRenameValue(s.title || "");
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const commitRename = useCallback(async (sid: number) => {
    const title = renameValue.trim();
    if (!title) { setRenamingId(null); return; }
    try {
      const res = await fetch(`/api/chat/sessions/${sid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      if (res.ok) {
        setSessions(prev => prev.map(s => s.id === sid ? { ...s, title } : s));
      }
    } catch { /* ignore */ }
    setRenamingId(null);
  }, [renameValue]);

  // Delete a session
  const deleteSession = useCallback(async (sid: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpenId(null);
    setDeletingId(sid);
    try {
      const res = await fetch(`/api/chat/sessions/${sid}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== sid));
        // If current session was deleted, reset to new chat
        if (sessionId === sid) {
          setMessages([WELCOME_MESSAGE]);
          setSessionId(null);
        }
      }
    } catch { /* ignore */ }
    setDeletingId(null);
  }, [sessionId]);

  // Switch to a past session
  const loadSession = useCallback(async (sid: number) => {
    setLoadingSessionId(sid);
    try {
      const res = await fetch(`/api/chat/sessions/${sid}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const restored: Message[] = data.messages.map((m: any) => ({
        id: `restored-${m.id}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(m.createdAt),
      }));
      setSessionId(sid);
      setMessages([WELCOME_MESSAGE, ...restored]);
      setShowHistory(false);
    } catch {
      // ignore
    } finally {
      setLoadingSessionId(null);
    }
  }, []);

  // Ensure a session exists, create one if needed
  const ensureSession = useCallback(async (firstMessage: string): Promise<number> => {
    if (sessionId) return sessionId;
    const res = await fetch("/api/chat/history/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: firstMessage.slice(0, 60) }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to create session");
    const data = await res.json();
    setSessionId(data.sessionId);
    return data.sessionId;
  }, [sessionId]);

  // Save a message to history (fire-and-forget, no blocking)
  const saveMessage = useCallback(async (sid: number, role: string, content: string) => {
    try {
      await fetch("/api/chat/history/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, role, content }),
        credentials: "include",
      });
    } catch {
      // Silently ignore save failures — chat still works
    }
  }, []);

  const sendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput("");
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history for multi-turn context (exclude welcome message)
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, history }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        const code = data?.errorCode as Message["errorCode"];
        const clientMessages: Record<string, string> = {
          quota_exceeded: "Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.",
          auth_error: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
          config_error: "Konfigurasi layanan AI tidak valid. Hubungi administrator.",
          server_error: "Terjadi kesalahan pada server AI. Silakan coba beberapa saat lagi.",
          network_error: "Maaf, terjadi kesalahan koneksi. Silakan coba lagi dalam beberapa saat.",
        };
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: (code && clientMessages[code]) || data?.message || "Maaf, terjadi kesalahan. Silakan coba lagi.",
          timestamp: new Date(),
          errorCode: code || "network_error",
        };
        setMessages(prev => [...prev, errMsg]);
      } else {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.reply || "Maaf, terjadi kesalahan. Silakan coba lagi.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);

        // Persist both messages for authenticated users
        if (user) {
          try {
            const sid = await ensureSession(messageText);
            await saveMessage(sid, "user", messageText);
            await saveMessage(sid, "assistant", data.reply);
          } catch {
            // Silently ignore persistence failures
          }
        }
      }
    } catch {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Maaf, terjadi kesalahan koneksi. Silakan coba lagi dalam beberapa saat.",
        timestamp: new Date(),
        errorCode: "network_error",
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startNewChat = async () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setSessionId(null);
    // Create a fresh session immediately if user is logged in
    if (user) {
      try {
        const res = await fetch("/api/chat/history/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Percakapan Baru" }),
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.sessionId);
        }
      } catch {
        // Silently ignore
      }
    }
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatSessionDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white text-sm">AI Chat</h1>
                <p className="text-xs text-slate-400">DokumenProyek Assistant</p>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] ml-1">Online</Badge>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white text-xs gap-1"
                onClick={openHistoryPanel}
                data-testid="button-history"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Riwayat</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white text-xs gap-1"
              onClick={startNewChat}
              data-testid="button-new-chat"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat Baru</span>
            </Button>
            <Link href="/agent-hub">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-xs gap-1" data-testid="button-go-agent-hub">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agent Hub</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main area — chat + optional history panel side by side on wider screens */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* History Sidebar Panel */}
        {showHistory && (
          <>
            {/* Backdrop for mobile */}
            <div
              className="absolute inset-0 bg-black/50 z-10 sm:hidden"
              onClick={() => setShowHistory(false)}
            />
            <div
              className={cn(
                "absolute sm:relative z-20 h-full w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col",
                "left-0 top-0"
              )}
              data-testid="panel-history"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  Riwayat Chat
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => setShowHistory(false)}
                  data-testid="button-close-history"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Session list */}
              <div className="flex-1 overflow-y-auto">
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                  </div>
                ) : sessionsError ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-slate-400 text-sm mb-3">Gagal memuat riwayat percakapan</p>
                    <button
                      onClick={openHistoryPanel}
                      className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                      data-testid="button-retry-sessions"
                    >
                      Coba lagi
                    </button>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-slate-500 text-sm">Belum ada riwayat percakapan</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className={cn(
                          "w-full text-left rounded-lg transition-all group relative",
                          sessionId === s.id
                            ? "bg-blue-600/20 border border-blue-600/40"
                            : "hover:bg-slate-800 border border-transparent",
                        )}
                      >
                        {confirmDeleteId === s.id ? (
                          /* Inline delete confirmation */
                          <div className="px-3 py-2.5 space-y-2" onClick={e => e.stopPropagation()} data-testid={`confirm-delete-${s.id}`}>
                            <p className="text-xs text-slate-300 leading-snug">Hapus percakapan ini?</p>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex-1 text-[11px] px-2 py-1 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                                data-testid={`button-cancel-delete-${s.id}`}
                              >
                                Batal
                              </button>
                              <button
                                onClick={async e => { setConfirmDeleteId(null); await deleteSession(s.id, e); }}
                                disabled={deletingId === s.id}
                                className="flex-1 text-[11px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                                data-testid={`button-confirm-delete-${s.id}`}
                              >
                                {deletingId === s.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Hapus"}
                              </button>
                            </div>
                          </div>
                        ) : renamingId === s.id ? (
                          /* Inline rename input */
                          <div className="flex items-center gap-1.5 px-3 py-2" onClick={e => e.stopPropagation()}>
                            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                            <input
                              ref={renameInputRef}
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") commitRename(s.id);
                                if (e.key === "Escape") setRenamingId(null);
                              }}
                              onBlur={() => commitRename(s.id)}
                              className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-0.5 text-xs text-white outline-none focus:border-blue-500 min-w-0"
                              maxLength={80}
                              data-testid={`input-rename-${s.id}`}
                            />
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 px-3 py-2.5">
                            <button
                              onClick={() => loadSession(s.id)}
                              disabled={loadingSessionId === s.id || deletingId === s.id}
                              className="flex items-start gap-2 flex-1 min-w-0 text-left"
                              data-testid={`button-session-${s.id}`}
                            >
                              {loadingSessionId === s.id || deletingId === s.id ? (
                                <Loader2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 animate-spin text-blue-400" />
                              ) : (
                                <MessageSquare className={cn(
                                  "w-3.5 h-3.5 flex-shrink-0 mt-0.5",
                                  sessionId === s.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"
                                )} />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className={cn(
                                  "text-xs font-medium truncate leading-snug",
                                  sessionId === s.id ? "text-blue-300" : "text-slate-300"
                                )}>
                                  {s.title || "Percakapan"}
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5">
                                  {formatSessionDate(s.updatedAt)}
                                </p>
                              </div>
                            </button>

                            {/* "…" menu button */}
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === s.id ? null : s.id); }}
                                className={cn(
                                  "p-0.5 rounded transition-opacity text-slate-500 hover:text-slate-300",
                                  menuOpenId === s.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}
                                data-testid={`button-session-menu-${s.id}`}
                                aria-label="Opsi sesi"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>

                              {/* Dropdown */}
                              {menuOpenId === s.id && (
                                <div
                                  className="absolute right-0 top-6 z-30 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1"
                                  onClick={e => e.stopPropagation()}
                                  data-testid={`menu-session-${s.id}`}
                                >
                                  <button
                                    onClick={e => startRename(s, e)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                    data-testid={`button-rename-${s.id}`}
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Ubah nama
                                  </button>
                                  <button
                                    onClick={e => { e.stopPropagation(); setMenuOpenId(null); setConfirmDeleteId(s.id); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
                                    data-testid={`button-delete-${s.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* New chat shortcut */}
              <div className="p-3 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => { startNewChat(); setShowHistory(false); }}
                  data-testid="button-new-chat-from-history"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Chat Baru
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

            {/* Quick prompts — shown only at start */}
            {messages.length === 1 && (
              <div className="space-y-4">
                {/* Service Page Shortcuts */}
                <div>
                  <p className="text-slate-500 text-xs text-center mb-2">Akses langsung layanan interaktif:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { href: "/legalitas", icon: Building2, label: "Legalitas", color: "text-slate-400 border-slate-700 hover:border-slate-500" },
                      { href: "/oss-rba", icon: Shield, label: "Perizinan OSS", color: "text-blue-400 border-blue-900/50 hover:border-blue-700" },
                      { href: "/sbu", icon: Award, label: "SBU", color: "text-amber-400 border-amber-900/50 hover:border-amber-700" },
                      { href: "/skk", icon: GraduationCap, label: "SKK", color: "text-purple-400 border-purple-900/50 hover:border-purple-700" },
                      { href: "/iso-smk3", icon: Zap, label: "ISO/SMK3", color: "text-emerald-400 border-emerald-900/50 hover:border-emerald-700" },
                      { href: "/tender-generator", icon: FileText, label: "Tender", color: "text-green-400 border-green-900/50 hover:border-green-700" },
                      { href: "/doc-generator", icon: BookMarked, label: "Dokumen", color: "text-rose-400 border-rose-900/50 hover:border-rose-700" },
                      { href: "/mini-apps", icon: Sparkles, label: "Mini Apps", color: "text-teal-400 border-teal-900/50 hover:border-teal-700" },
                    ].map((svc) => {
                      const Icon = svc.icon;
                      return (
                        <Link key={svc.href} href={svc.href}>
                          <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-slate-800/50 cursor-pointer transition-all text-xs font-medium", svc.color)} data-testid={`link-service-${svc.label.toLowerCase()}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {svc.label}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Quick prompts */}
                <div>
                  <p className="text-slate-500 text-xs text-center mb-3">Atau coba pertanyaan populer:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_PROMPTS.map((p, i) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => sendMessage(p.text)}
                          className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-left hover:bg-slate-700/60 hover:border-slate-600 transition-all group"
                          data-testid={`button-quick-${i}`}
                        >
                          <Icon className={cn("w-4 h-4 flex-shrink-0", p.color)} />
                          <span className="text-slate-300 text-xs leading-snug">{p.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                    : "bg-gradient-to-br from-slate-600 to-slate-700"
                )}>
                  {msg.role === "assistant"
                    ? <Bot className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-white" />
                  }
                </div>

                {/* Bubble */}
                <div className={cn("group max-w-[80%] space-y-1", msg.role === "user" && "items-end flex flex-col")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === "assistant" && !msg.errorCode
                      ? "bg-slate-800 text-slate-100 rounded-tl-sm"
                      : msg.errorCode
                      ? msg.errorCode === "auth_error"
                        ? "bg-red-950/60 border border-red-800/50 text-red-200 rounded-tl-sm"
                        : msg.errorCode === "server_error"
                        ? "bg-orange-950/60 border border-orange-800/50 text-orange-200 rounded-tl-sm"
                        : "bg-amber-950/60 border border-amber-800/50 text-amber-200 rounded-tl-sm"
                      : "bg-blue-600 text-white rounded-tr-sm"
                  )}>
                    {msg.role === "assistant" ? (
                      msg.errorCode ? (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            {msg.errorCode === "auth_error"
                              ? <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                              : msg.errorCode === "server_error"
                              ? <ServerCrash className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-400" data-testid="icon-server-error-chat" />
                              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                            }
                            <p className="text-sm leading-snug">{msg.content}</p>
                          </div>
                          {msg.errorCode === "auth_error" && (
                            <a
                              href="/api/login?returnTo=/ai-chat"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-700/40 transition-colors"
                              data-testid="link-login-from-chat"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              Masuk untuk melanjutkan
                            </a>
                          )}
                          {msg.errorCode !== "auth_error" && (() => {
                            const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
                            const isServerErr = msg.errorCode === "server_error";
                            return lastUserMsg ? (
                              <button
                                onClick={() => sendMessage(lastUserMsg.content)}
                                disabled={isLoading}
                                className={isServerErr
                                  ? "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-700/40 transition-colors disabled:opacity-50"
                                  : "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-700/40 transition-colors disabled:opacity-50"
                                }
                                data-testid="button-retry-chat"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Coba lagi
                              </button>
                            ) : null;
                          })()}
                        </div>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-headings:my-2 prose-table:text-xs prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-code:text-blue-300 prose-a:text-blue-400 prose-hr:border-slate-600">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-600">{formatTime(msg.timestamp)}</span>
                    {msg.role === "assistant" && !msg.errorCode && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-copy-${msg.id}`}
                      >
                        {copiedId === msg.id
                          ? <Check className="w-3 h-3 text-green-400" />
                          : <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-slate-900 border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-3 items-end"
          >
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan tentang SBU, SKK, Tender, Legalitas..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-xl pr-4 py-3 h-12 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                disabled={isLoading}
                data-testid="input-chat"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex-shrink-0 p-0"
              data-testid="button-send-chat"
            >
              {isLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send className="w-5 h-5" />
              }
            </Button>
          </form>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            AI Chat DokumenProyek — respons berbasis knowledge base layanan konstruksi
          </p>
        </div>
      </div>
    </div>
  );
}
