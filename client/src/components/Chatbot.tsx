import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle, X, Send, Sparkles, Loader2, ExternalLink, Bot, User,
  AlertCircle, RefreshCw, ShieldAlert, ServerCrash
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  errorCode?: "quota_exceeded" | "auth_error" | "config_error" | "network_error" | "server_error";
}

const WELCOME_TEXT = `Halo! Saya OpenClaw — agen AI dari **Gustafta Framework** di DokumenProyek.com.

Saya bisa bantu Anda mengakses fitur-fitur AI Gustafta:

🔍 **TenderaClaw** — analisis kelayakan & strategi tender
🏗 **SBUClaw** — persiapan sertifikasi SBU 4 tahap
⚡ **MultiClaw** — monitoring SBU/SKK/BUJK/Tender otomatis
⚖️ **LexCom Hukum** — konsultasi hukum konstruksi (FIDIC, Perpres, UUJK)
🏢 **Workroom** — ruang kolaborasi proyek terstruktur
🎓 **KompetensiHub** — gap analysis & roadmap SKK
👨‍🏫 **ASKOM Coach** — panduan asesor BNSP

Tanya apa saja, atau saya arahkan ke fitur yang paling sesuai kebutuhan Anda.`;

const QUICK_QUESTIONS = [
  "Apa itu TenderaClaw?",
  "Bagaimana cara pakai SBUClaw?",
  "MultiClaw bisa monitor apa saja?",
  "LexCom bisa bantu kontrak FIDIC?",
  "Apa itu Workroom dan kegunaannya?",
  "Cara analisis gap kompetensi SKK?",
  "ASKOM Coach untuk asesor BNSP?",
  "Syarat SBU Kontraktor terbaru?",
  "Cara daftar tender LPSE?",
  "Perubahan Perpres 46/2025?",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: WELCOME_TEXT, isBot: true, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    setInput("");
    setHasInteracted(true);

    const userMsg: Message = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history for multi-turn context
      const history = messages.slice(1).map(m => ({
        role: m.isBot ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: messageText, history }),
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
          id: Date.now() + 1,
          text: (code && clientMessages[code]) || data?.message || "Maaf, terjadi kesalahan. Silakan coba lagi.",
          isBot: true,
          timestamp: new Date(),
          errorCode: code || "network_error",
        };
        setMessages(prev => [...prev, errMsg]);
      } else {
        const botMsg: Message = {
          id: Date.now() + 1,
          text: data.reply || "Maaf, terjadi kesalahan. Silakan coba lagi.",
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch {
      const errMsg: Message = {
        id: Date.now() + 1,
        text: "Maaf, koneksi bermasalah. Silakan coba lagi dalam beberapa saat.",
        isBot: true,
        timestamp: new Date(),
        errorCode: "network_error" as const,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            data-testid="button-open-chatbot"
            aria-label="Buka chatbot"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 left-6 z-50 w-[360px] h-[520px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-white">
                <h3 className="font-bold text-sm leading-tight">OpenClaw AI</h3>
                <p className="text-[11px] text-white/70">Asisten dokumen konstruksi</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Link href="/ai-chat">
                <button
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  title="Buka chat penuh"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-expand-chatbot"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                data-testid="button-close-chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2 items-end", msg.isBot ? "justify-start" : "justify-end")}
              >
                {msg.isBot && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[82%] px-3 py-2.5 rounded-2xl text-sm",
                    msg.isBot && !msg.errorCode
                      ? "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100"
                      : msg.errorCode
                      ? msg.errorCode === "auth_error"
                        ? "bg-red-50 text-red-800 rounded-bl-sm border border-red-200"
                        : msg.errorCode === "server_error"
                        ? "bg-orange-50 text-orange-800 rounded-bl-sm border border-orange-200"
                        : "bg-amber-50 text-amber-800 rounded-bl-sm border border-amber-200"
                      : "bg-blue-600 text-white rounded-br-sm"
                  )}
                >
                  {msg.isBot ? (
                    msg.errorCode ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-1.5">
                          {msg.errorCode === "auth_error"
                            ? <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                            : msg.errorCode === "server_error"
                            ? <ServerCrash className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-orange-500" data-testid="icon-server-error-chatbot" />
                            : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-500" />
                          }
                          <p className="text-[13px] leading-snug">{msg.text}</p>
                        </div>
                        {msg.errorCode === "auth_error" && (
                          <a
                            href="/api/login?returnTo=/ai-chat"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition-colors"
                            data-testid="link-login-from-chatbot"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            Masuk untuk melanjutkan
                          </a>
                        )}
                        {msg.errorCode !== "auth_error" && (() => {
                          const lastUserMsg = [...messages].reverse().find(m => !m.isBot);
                          const isServerErr = msg.errorCode === "server_error";
                          return lastUserMsg ? (
                            <button
                              onClick={() => handleSend(lastUserMsg.text)}
                              disabled={isLoading}
                              className={isServerErr
                                ? "flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 transition-colors disabled:opacity-50"
                                : "flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300 transition-colors disabled:opacity-50"
                              }
                              data-testid="button-retry-chatbot"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Coba lagi
                            </button>
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-ol:my-0.5 prose-headings:my-1 prose-table:text-xs prose-a:text-blue-300 prose-code:text-blue-200 prose-strong:text-white prose-li:text-white leading-relaxed text-[13px] text-white">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <p className="text-[13px]">{msg.text}</p>
                  )}
                </div>
                {!msg.isBot && (
                  <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center flex-shrink-0 mb-0.5">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2 items-end">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions — only shown before first user interaction */}
          {!hasInteracted && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-slate-50 flex-shrink-0">
              {QUICK_QUESTIONS.map((q) => (
                <Badge
                  key={q}
                  variant="secondary"
                  className="cursor-pointer text-[11px] hover:bg-blue-100 hover:text-blue-700 transition-colors px-2 py-0.5"
                  onClick={() => handleSend(q)}
                  data-testid={`badge-quick-${q.slice(0, 10)}`}
                >
                  {q}
                </Badge>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-white flex-shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 items-center"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya SBU, SKK, Tender..."
                className="flex-1 text-sm h-9 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                disabled={isLoading}
                data-testid="input-chatbot"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 flex-shrink-0"
                data-testid="button-send-chatbot"
              >
                {isLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />
                }
              </Button>
            </form>
            <p className="text-center text-[10px] text-slate-400 mt-1.5">
              AI · knowledge base SBU, SKK, Tender, Legalitas &nbsp;·&nbsp;
              <Link href="/ai-chat" onClick={() => setIsOpen(false)}>
                <span className="text-blue-500 hover:underline cursor-pointer">Chat penuh</span>
              </Link>
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
