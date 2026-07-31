# DokumenProyek.com - Platform Konstruksi Terintegrasi

## Overview
DokumenProyek.com adalah platform digital terpadu untuk layanan legalitas, perizinan, sertifikasi, tender, dan proyek di Indonesia. Platform ditenagai oleh **OpenClaw AI** (GPT-4o + OpenAI Agents SDK + RAG) dengan **11 agen spesialis**, melayani multi-sektor: Konstruksi, Ketenagalistrikan, EBT, Mineral & Pertambangan, Lingkungan, dan Engineering Services.

## Project Goals
- Platform jasa dokumen & konsultasi usaha #1 Indonesia — multi-sektor
- Model keagenan 3-Tier: Pusat (L1) + Master Agent/Regional (L2) + Fasilitator Lapangan (L3)
- OpenClaw multi-agent AI: Orchestrator + 11 Specialist Agents + RAG regulasi Indonesia
- 4 Jenis lisensi agen: Referral, Service, Master Agent, Strategic Institutional Partner
- 3 Pilar sertifikasi: Badan Usaha + Kompetensi Kerja + Manajemen Usaha
- Bundling paket: Startup Contractor, Tender Ready, ISO & Compliance, Supply Chain Ready
- chat.dokumenproyek.com sebagai sentra draft dokumen berbasis LLM (6 GPTs + 8 mini apps)
- Ekosistem terintegrasi: jasa dokumen + edukasi kompetensi (flywheel growth)

## Business Model
- **Layanan Inti**: Legalitas, Perizinan, SBU, SKK, ISO/SMK3, Tender, Proyek
- **Segmentasi Sektor**: Konstruksi (prioritas), Ketenagalistrikan, EBT, Mineral & Tambang, Lingkungan, Engineering Services
- **Model Keagenan 3-Tier**: Pusat L1 (processing + QA + AI) → Master Agent L2 (regional network) → Fasilitator L3 (lapangan)
- **4 Jenis Lisensi**: Referral Agent | Service Agent | Master Agent/Regional Operator | Strategic Institutional Partner
- **Monetisasi**: Fee layanan + Subscription/retainer + Lisensi agen + Enterprise partnership + Renewal management
- **OpenClaw AI**: diferensiator kompetitif — 11 agen spesialis termasuk Document Review, Sales & Intake, Document Generator

## Current State
- Landing page dengan informasi lengkap tentang modul platform (multi-sektor, bundling, 3-pilar sertifikasi)
- Sistem autentikasi terintegrasi (Replit Auth) — terhubung ke Navbar (login/logout/avatar), Dashboard, ProfileSetup
- **Integrasi Lengkap (sinkronisasi terbaru)**:
  - **Navbar** (`Navbar.tsx`): Menampilkan status login — tombol "Masuk/Daftar" untuk tamu; avatar + "Dashboard" + tombol logout untuk user terautentikasi; mobile menu responsif dengan profil user
  - **NotificationCenter** (`NotificationCenter.tsx`): Terhubung ke backend `/api/notifications` (bukan mock data); mendukung mark-read, mark-all-read, delete; auto-refresh setiap 30 detik
  - **Dashboard** (`Dashboard.tsx`): Module tiles + Aksi Cepat mencakup Mini Apps & Generator Dokumen; tombol "Lengkapi Profil" terhubung ke `/setup`; semua moduleLinks lengkap; section "Konsultasi Saya" menampilkan riwayat konsultasi dari database
  - **ProfileSetup** (`ProfileSetup.tsx`): Redirect ke "/" setelah setup selesai (routing ke Dashboard secara otomatis)
  - **ConsultationModal**: Terpasang di 6 halaman layanan (Legalitas, OSS-RBA, SBU, SKK, ISO-SMK3, Proyek) — tersimpan ke `/api/consultations`
- Dashboard dinamis: case tracker real-time, statistik akun, modal "Ajukan Layanan Baru" (POST /api/projects)
- **OSSRBAPage** (`/oss-rba`): Halaman lengkap OSS-RBA — 4 level risiko (Rendah/MR/MT/Tinggi) dengan persyaratan, tahapan, dokumen wajib per level; KBLI lookup (20 KBLI konstruksi terfilter); Checklist Interaktif dokumen dengan progress bar & salin clipboard; Alur OSS-RBA 6-langkah visual; Dasar hukum per level; akses publik & login
- **SBUPage** (`/sbu`): Halaman SBU komprehensif per PP 28/2025 & Permen PU 6/2025 — 6 gred kualifikasi (K1/K2/M1/M2/B1/B2) dengan persyaratan SDM SKK, dokumen, modal, PNBP; Checklist interaktif per gred; Subklasifikasi lookup (20 subklasifikasi: Gedung/Sipil/ME/Spesialis/Konsultan); Alur 8 tahap digital LPJK; Dialog detail perubahan regulasi PP 28/2025 & Permen PU 6/2025; AgentHub flow SBU diperbarui dengan regulasi 2025
- **ProjectDashboard**: Milestone/history dialog (timeline icon per update-type), tombol "Riwayat" per kartu proyek, update dialog — terhubung ke `/api/projects` dan `/api/project-updates`
- **FinancialModule**: Bar chart bulanan (Recharts) pemasukan vs pengeluaran, fallback sample data 6 bulan
- **AgentHub**: 11 agent OpenClaw dengan chat flows dan contoh prompt per spesialisasi; sekarang terhubung ke `/api/agent-sessions` untuk persistensi sesi chat (untuk user terautentikasi)
- **AIChat** (`/ai-chat`): Full chat UI dibangun ulang — memanggil `/api/chat` backend endpoint dengan knowledge base 16 topik (SBU gred/proses/dokumen, SKK, Legalitas, Perizinan, ISO/SMK3, Tender, Proyek, Mini Apps, Generator Dokumen, AgentHub, Harga, Regulasi, dll); quick prompts; copy pesan; clear chat; animasi typing
- **Chat Backend** (`/api/chat`): Knowledge base rule-based dengan 16+ topik konstruksi Indonesia; algoritma scoring dengan exact phrase match (5×weight) + partial match; deteksi greeting otomatis
- **Per-gred/kategori ConsultationModal**: SBUPage (per K1/K2/M1/M2/B1/B2), SKKPage (per kategori), OSSRBAPage (per level risiko) — semua tersambung ke `/api/consultations`
- **MiniAppsPage SaveButton**: Tombol "Simpan Kalkulasi" di AppJaminan dan AppDenda — tersambung ke `/api/saved-calculations` (hanya untuk user terautentikasi)
- **TenderDocument**: Generator 13 section dokumen tender (BOQ, AHSP, RENCANA K3, dll) dengan template profesional per tipe proyek
- Database PostgreSQL untuk penyimpanan data (projects, projectUpdates, tenderDocuments, transactions, userProfiles)

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL dengan Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)

## Project Architecture
```
client/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx     # Landing page untuk visitor
│   │   ├── Dashboard.tsx       # Dashboard untuk user login (stakeholder-specific)
│   │   ├── ProfileSetup.tsx    # Profile completion for new users
│   │   ├── Opportunities.tsx   # Opportunity matching & browsing
│   │   ├── Marketplace.tsx     # Material marketplace with escrow
│   │   ├── TenderGenerator.tsx # Auto-generate tender documents
│   │   ├── ProjectDashboard.tsx # Project monitoring
│   │   ├── FinancialModule.tsx # Financial management
│   │   ├── EquipmentRental.tsx # Equipment rental marketplace
│   │   ├── AIChat.tsx          # AI Chat iframe integration
│   │   ├── Analytics.tsx       # Business analytics dashboard
│   │   ├── DocumentVerification.tsx # QR verification (public)
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── Navbar.tsx          # Public navbar with verification
│   │   ├── FeatureCard.tsx
│   │   ├── ContactForm.tsx
│   │   ├── Chatbot.tsx         # Platform knowledge chatbot
│   │   ├── SmartSearch.tsx     # Cmd+K global search
│   │   ├── NotificationCenter.tsx # Notification panel
│   │   ├── ActivityTimeline.tsx # User activity log
│   │   └── FloatingChatButton.tsx # AI Chat floating button
│   ├── hooks/
│   │   ├── use-auth.ts         # Auth hook
│   │   └── use-contact.ts
│   └── lib/
│       ├── queryClient.ts
│       └── auth-utils.ts
server/
├── index.ts                    # Express server entry
├── routes.ts                   # API routes
├── storage.ts                  # Database operations
├── db.ts                       # Database connection
└── replit_integrations/
    └── auth/                   # Replit Auth module
shared/
├── schema.ts                   # Drizzle schema
├── routes.ts                   # API route definitions
└── models/
    └── auth.ts                 # Auth schema (users, sessions)
```

## Database Schema
- **users** - User accounts (from Replit Auth)
- **sessions** - Session storage
- **user_profiles** - Extended user info with stakeholder type
- **contact_messages** - Contact form submissions
- **modules** - Platform modules/features
- **user_roles** - Stakeholder types display
- **benefits** - Platform benefits
- **hero_content** - Landing page hero section
- **cta_content** - Call-to-action section
- **opportunities** - Tender/project opportunities
- **products** - Marketplace products

## Stakeholder Types
1. **Kontraktor** - Construction contractors
2. **Konsultan** - Consultants
3. **Vendor** - Equipment/material vendors
4. **Supplier** - Material suppliers
5. **Tenaga Kerja** - Construction workers
6. **Masyarakat** - Service users

## Modules
1. Kompeten & Latih - Training and certification
2. Tuman (Tenaga Kerja) - Worker matching
3. RancangBangun - Design and build services
4. Pasok (Marketplace) - Material marketplace
5. Tender - Tender document generator
6. Perizinan & Legalitas - Licensing and permits
7. Kendali Proyek - Project monitoring
8. Penilai Ahli - Expert consultation
9. Alat - Equipment rental
10. Financial - Financial management
11. Safety Ready - K3/Safety compliance
12. Ekonomi Sirkular - Circular economy

## Recent Changes
- 2026-01-29: Added Replit Auth integration
- 2026-01-29: Created Dashboard for logged-in users
- 2026-01-29: Added user_profiles, opportunities, products schemas
- 2026-01-29: Implemented API routes for profile, opportunities, products
- 2026-01-29: Added ProfileSetup page for new user onboarding with stakeholder selection
- 2026-01-29: Made Dashboard content dynamic based on stakeholder type
- 2026-01-29: Created Opportunities page with matching, filtering, and creation features
- 2026-01-29: Built Marketplace Pasok with escrow payment flow (escrow → shipped → delivered → completed)
- 2026-01-29: Implemented Tender Generator with template-based document auto-generation
- 2026-01-29: Created Project Dashboard for real-time project monitoring
- 2026-01-29: Added Financial Module for transaction tracking and cash flow reporting
- 2026-01-29: Built Equipment Rental Marketplace for construction equipment with booking system
- 2026-01-29: Added AI Chat integration (chat.dokumenproyek.com) with floating button and dashboard card
- 2026-01-29: Added Dashboard Analytics with business data visualization
- 2026-01-29: Implemented QR Code Document Verification (/verify) - public access
- 2026-01-29: Added Activity Timeline for user accountability
- 2026-01-29: Built Notification Center with read/unread states
- 2026-01-29: Created Smart Search with Cmd+K shortcut for quick navigation
- 2026-01-29: Integrated Chatbot with comprehensive platform knowledge
- 2026-01-29: Added verification button to public navbar for document verification

## External Integrations
- **AI Chat**: https://chat.dokumenproyek.com - AI assistant for tender documents, project analysis, construction consultation
  - Features: Voice Transcription, Image Generation, Deep Research, Product Photoshoot

## User Preferences
- Language: Indonesian (Bahasa Indonesia)
- Platform focus: Construction industry
