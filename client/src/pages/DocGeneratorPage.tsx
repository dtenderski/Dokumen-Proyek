import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { RelatedServices } from "@/components/ServiceNav";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft, FileText, Download, Copy, CheckCircle2, RefreshCw,
  Eye, Zap, BookOpen, FolderOpen, ChevronRight, Printer, Star,
  PenLine, FileBadge, Gavel, ScrollText, Shield, Clock, Users,
  CheckCheck, Search, LayoutTemplate, Sparkles, History,
  ArrowRight, Save, Trash2, CloudDownload, Award
} from "lucide-react";

// ─── Tipe & Helper ────────────────────────────────────────────────────────
const today = () => new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const tglShort = () => new Date().toLocaleDateString("id-ID");

type Field = { key: string; label: string; placeholder: string; type?: "text" | "textarea" | "date" | "select"; options?: string[] };
type Template = {
  id: string; kategori: "tender" | "proyek" | "umum"; icon: any;
  nama: string; deskripsi: string; regulasi: string;
  badge: string; badgeColor: string; fields: Field[];
  generate: (data: Record<string, string>) => string;
};

// ─── TEMPLATE GENERATORS ─────────────────────────────────────────────────

const templates: Template[] = [

  // ═══ TENDER ═══════════════════════════════════════════════════════════

  {
    id: "surat-penawaran",
    kategori: "tender", icon: PenLine,
    nama: "Surat Penawaran",
    deskripsi: "Surat resmi penawaran harga kepada PPK/Pokja — bermaterai dan bertandatangan direksi",
    regulasi: "Perpres 46/2025",
    badge: "Tender", badgeColor: "bg-green-100 text-green-800",
    fields: [
      { key: "nomorSurat", label: "Nomor Surat", placeholder: "001/SP/PT-XXX/IV/2025" },
      { key: "namaProyek", label: "Nama Paket / Proyek", placeholder: "Pembangunan Gedung Kantor Dinas..." },
      { key: "namaKementerian", label: "Nama Instansi Pemberi Kerja", placeholder: "Dinas PU dan Perumahan Kab. ..." },
      { key: "nilaiPenawaran", label: "Nilai Penawaran (angka & huruf)", placeholder: "Rp 4.750.000.000 (Empat Miliar Tujuh Ratus Lima Puluh Juta Rupiah)" },
      { key: "masaBerlaku", label: "Masa Berlaku Penawaran", placeholder: "90 hari kalender" },
      { key: "namaPerusahaan", label: "Nama Perusahaan", placeholder: "PT. Bangun Nusantara Jaya" },
      { key: "alamatPerusahaan", label: "Alamat Perusahaan", placeholder: "Jl. Sudirman No. 12, Jakarta" },
      { key: "namaDirektur", label: "Nama Direktur", placeholder: "Ir. Budi Santoso, ST., MT." },
      { key: "jabatan", label: "Jabatan Penandatangan", placeholder: "Direktur Utama" },
      { key: "kota", label: "Kota Penandatanganan", placeholder: "Jakarta" },
    ],
    generate: (d) => `SURAT PENAWARAN HARGA
${"═".repeat(70)}

Nomor    : ${d.nomorSurat || "[Nomor Surat]"}
Lampiran : 1 (satu) berkas Dokumen Penawaran
Perihal  : Penawaran Harga Pekerjaan ${d.namaProyek || "[Nama Proyek]"}

Kepada Yth.
Kelompok Kerja (Pokja) Pemilihan
${d.namaKementerian || "[Nama Instansi]"}
Di Tempat

Dengan hormat,

Yang bertandatangan di bawah ini:

  Nama             : ${d.namaDirektur || "[Nama Direktur]"}
  Jabatan          : ${d.jabatan || "Direktur Utama"}
  Nama Perusahaan  : ${d.namaPerusahaan || "[Nama Perusahaan]"}
  Alamat           : ${d.alamatPerusahaan || "[Alamat Perusahaan]"}

Dengan ini mengajukan penawaran untuk pelaksanaan pekerjaan:

  Nama Pekerjaan : ${d.namaProyek || "[Nama Proyek]"}
  Nilai Penawaran: ${d.nilaiPenawaran || "[Nilai Penawaran]"}

dengan ketentuan sebagai berikut:

1. Penawaran ini berlaku selama ${d.masaBerlaku || "90 (sembilan puluh) hari kalender"} sejak tanggal pemasukan dokumen penawaran.

2. Kami menyatakan bahwa:
   a. Dokumen penawaran ini telah kami buat dengan sesungguhnya dan apabila dikemudian hari terdapat pemalsuan dokumen, kami bersedia menerima sanksi sesuai ketentuan yang berlaku.
   b. Semua dokumen yang kami lampirkan adalah benar dan sah.
   c. Kami tidak sedang dalam pengawasan pengadilan, tidak pailit, kegiatan usaha tidak sedang dihentikan, dan tidak sedang menjalani sanksi pidana.
   d. Kami tidak masuk dalam daftar hitam pengadaan pemerintah.

3. Kami bersedia mematuhi semua ketentuan yang diatur dalam Dokumen Pemilihan.

4. Dalam hal kami ditunjuk sebagai pemenang, kami berkomitmen untuk melaksanakan pekerjaan sesuai lingkup, spesifikasi teknis, dan jangka waktu yang ditetapkan dalam kontrak.

Demikian surat penawaran ini kami sampaikan. Atas perhatian dan kepercayaan Bapak/Ibu, kami mengucapkan terima kasih.

                                        ${d.kota || "[Kota]"}, ${today()}

                                        ${d.namaPerusahaan || "[Nama Perusahaan]"}


                                        [Materai Rp 10.000]


                                        _________________________________
                                        ${d.namaDirektur || "[Nama Direktur]"}
                                        ${d.jabatan || "Direktur Utama"}

${"═".repeat(70)}
Dokumen ini digenerate oleh DokumenProyek.com — ${today()}`,
  },

  {
    id: "pakta-integritas",
    kategori: "tender", icon: Shield,
    nama: "Pakta Integritas",
    deskripsi: "Pernyataan resmi tidak melakukan KKN, kolusi, dan nepotisme dalam proses pengadaan",
    regulasi: "Perpres 46/2025 + UU PTPK",
    badge: "Tender", badgeColor: "bg-green-100 text-green-800",
    fields: [
      { key: "namaProyek", label: "Nama Paket Pekerjaan", placeholder: "Pembangunan Gedung Rawat Inap RSUD..." },
      { key: "namaPerusahaan", label: "Nama Perusahaan", placeholder: "PT. Karya Mandiri Konstruksi" },
      { key: "namaDirektur", label: "Nama Lengkap Penandatangan", placeholder: "Ir. Ahmad Fauzi, ST." },
      { key: "jabatan", label: "Jabatan", placeholder: "Direktur Utama" },
      { key: "nomorKTP", label: "Nomor KTP / NIK", placeholder: "3271012345678901" },
      { key: "kota", label: "Tempat Penandatanganan", placeholder: "Bandung" },
    ],
    generate: (d) => `PAKTA INTEGRITAS
${"═".repeat(70)}

PAKTA INTEGRITAS
PENGADAAN BARANG/JASA PEMERINTAH

Pekerjaan : ${d.namaProyek || "[Nama Pekerjaan]"}

Yang bertandatangan di bawah ini:

  Nama     : ${d.namaDirektur || "[Nama]"}
  Jabatan  : ${d.jabatan || "Direktur Utama"}
  NIK      : ${d.nomorKTP || "[Nomor KTP]"}
  Bertindak untuk dan atas nama : ${d.namaPerusahaan || "[Nama Perusahaan]"}

Dalam rangka pengadaan ${d.namaProyek || "[Nama Pekerjaan]"}, dengan ini menyatakan bahwa saya/kami:

1. Tidak akan melakukan praktik Korupsi, Kolusi, dan Nepotisme (KKN);

2. Akan melaporkan kepada APIP/pihak berwenang apabila mengetahui ada indikasi KKN dalam proses pengadaan ini;

3. Akan mengikuti proses pengadaan secara bersih, transparan, dan profesional untuk memberikan hasil kerja terbaik sesuai ketentuan peraturan perundang-undangan;

4. Apabila melanggar hal-hal yang dinyatakan dalam Pakta Integritas ini, bersedia menerima sanksi administratif, dimasukkan dalam Daftar Hitam, dituntut secara perdata dan/atau dilaporkan secara pidana sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.

                                        ${d.kota || "[Kota]"}, ${today()}


   Peserta,                                       PPK,


   [Materai Rp 10.000]                            [Materai Rp 10.000]


   _______________________________                _______________________________
   ${d.namaDirektur || "[Nama Direktur]"}
   ${d.jabatan || "Direktur Utama"}
   ${d.namaPerusahaan || "[Nama Perusahaan]"}

${"═".repeat(70)}`,
  },

  {
    id: "surat-pernyataan",
    kategori: "tender", icon: ScrollText,
    nama: "Surat Pernyataan (Tidak Blacklist)",
    deskripsi: "Surat pernyataan tidak masuk daftar hitam dan tidak sedang dalam proses sanksi pengadaan",
    regulasi: "Perpres 46/2025",
    badge: "Tender", badgeColor: "bg-green-100 text-green-800",
    fields: [
      { key: "namaPerusahaan", label: "Nama Perusahaan", placeholder: "PT. Konstruksi Maju Bersama" },
      { key: "npwp", label: "NPWP Perusahaan", placeholder: "01.234.567.8-901.000" },
      { key: "alamat", label: "Alamat Perusahaan", placeholder: "Jl. Ahmad Yani No. 5, Surabaya" },
      { key: "namaDirektur", label: "Nama Direktur", placeholder: "Drs. Hendra Kusuma, MM." },
      { key: "namaProyek", label: "Nama Paket yang Diikuti", placeholder: "Rehabilitasi Jalan Kec. Cibubur" },
      { key: "kota", label: "Tempat Pembuatan", placeholder: "Surabaya" },
    ],
    generate: (d) => `SURAT PERNYATAAN
${"═".repeat(70)}

Yang bertandatangan di bawah ini:

  Nama        : ${d.namaDirektur || "[Nama Direktur]"}
  Jabatan     : Direktur Utama
  Nama Badan Usaha : ${d.namaPerusahaan || "[Nama Perusahaan]"}
  NPWP        : ${d.npwp || "[NPWP]"}
  Alamat      : ${d.alamat || "[Alamat]"}

Dengan ini menyatakan dengan sesungguhnya bahwa badan usaha kami:

1. TIDAK MASUK DALAM DAFTAR HITAM (Blacklist) pengadaan pemerintah yang dikeluarkan oleh LKPP maupun kementerian/lembaga/daerah manapun.

2. TIDAK SEDANG DALAM PENGAWASAN PENGADILAN, tidak pailit, dan kegiatan usahanya tidak sedang dihentikan.

3. TIDAK SEDANG MENJALANI SANKSI PIDANA yang berkaitan dengan kegiatan usaha atau pengadaan barang/jasa pemerintah.

4. TIDAK MEMILIKI HUBUNGAN KELUARGA dengan PPK/Pokja yang mengelola paket pekerjaan ini sehingga dapat mempengaruhi proses pengadaan.

5. DATA PERUSAHAAN yang kami sampaikan dalam dokumen penawaran untuk pekerjaan:
   "${d.namaProyek || "[Nama Pekerjaan]"}"
   adalah BENAR DAN SAH.

Pernyataan ini kami buat dengan sebenar-benarnya. Apabila pernyataan ini tidak benar, kami bersedia dituntut secara hukum dan menerima sanksi sesuai ketentuan yang berlaku.

                                        ${d.kota || "[Kota]"}, ${today()}

                                        Yang membuat pernyataan,

                                        ${d.namaPerusahaan || "[Nama Perusahaan]"}

                                        [Materai Rp 10.000]


                                        _________________________________
                                        ${d.namaDirektur || "[Nama Direktur]"}
                                        Direktur Utama

${"═".repeat(70)}`,
  },

  {
    id: "metode-pelaksanaan",
    kategori: "tender", icon: BookOpen,
    nama: "Metode Pelaksanaan",
    deskripsi: "Uraian teknis cara pelaksanaan pekerjaan — mencakup tahapan, personel, alat, dan K3",
    regulasi: "Permen PUPR 14/2020",
    badge: "Tender", badgeColor: "bg-green-100 text-green-800",
    fields: [
      { key: "namaProyek", label: "Nama Pekerjaan", placeholder: "Pembangunan Gedung Serbaguna 3 Lantai" },
      { key: "lokasiProyek", label: "Lokasi Pekerjaan", placeholder: "Kabupaten Bogor, Jawa Barat" },
      { key: "nilaiKontrak", label: "Nilai Kontrak", placeholder: "Rp 7.500.000.000" },
      { key: "jangkaWaktu", label: "Jangka Waktu Pelaksanaan", placeholder: "240 hari kalender" },
      { key: "namaPerusahaan", label: "Nama Perusahaan", placeholder: "PT. Bangun Sentosa" },
      { key: "namapm", label: "Nama Project Manager", placeholder: "Ir. Reza Firmansyah, ST., MT." },
      { key: "sbuKlasifikasi", label: "Klasifikasi SBU", placeholder: "BG009 — Bangunan Gedung Lainnya" },
    ],
    generate: (d) => `METODE PELAKSANAAN
${"═".repeat(70)}

NAMA PEKERJAAN : ${d.namaProyek || "[Nama Pekerjaan]"}
LOKASI         : ${d.lokasiProyek || "[Lokasi]"}
NILAI KONTRAK  : ${d.nilaiKontrak || "[Nilai]"}
JANGKA WAKTU   : ${d.jangkaWaktu || "[Jangka Waktu]"}
PELAKSANA      : ${d.namaPerusahaan || "[Nama Perusahaan]"}
PROJECT MANAGER: ${d.namapm || "[Nama PM]"}

${"═".repeat(70)}
I. PENDAHULUAN & PEMAHAMAN PEKERJAAN
${"─".repeat(70)}

Dalam rangka pelaksanaan pekerjaan ${d.namaProyek || "dimaksud"}, kami telah mempelajari dokumen teknis (RKS, gambar kerja, dan BOQ) secara menyeluruh. Berdasarkan kajian tersebut, kami telah menyusun metode pelaksanaan yang sistematis, efisien, dan mengutamakan keselamatan kerja.

II. MOBILISASI & PERSIAPAN LAPANGAN
${"─".repeat(70)}

A. Tahap Persiapan (Minggu 1–2)
   1. Pembangunan Direksi Keet dan barak pekerja
   2. Pengukuran dan setting-out ulang sesuai gambar kerja
   3. Pemasangan pagar proyek dan rambu-rambu K3
   4. Instalasi air kerja dan listrik sementara
   5. Mobilisasi alat berat dan material perdana
   6. Pembentukan tim K3 dan sosialisasi prosedur keselamatan
   7. Pengurusan izin gangguan (HO) dan izin lokasi bila diperlukan

III. TAHAPAN PELAKSANAAN PEKERJAAN
${"─".repeat(70)}

A. Pekerjaan Tanah & Pondasi
   ▶ Galian tanah sesuai gambar rencana — menggunakan excavator 20 ton
   ▶ Pemancangan tiang / bored pile sesuai data penyelidikan tanah
   ▶ Lantai kerja (lean concrete) K-100 di bawah pile cap dan sloof
   ▶ Pembesian dan pengecoran pile cap, sloof, dan tie beam
   ▶ Urugan dan pemadatan tanah kembali — CBR min. 95% (modified proctor)
   ▶ Disposal material galian ke lokasi yang disetujui owner

B. Pekerjaan Struktur
   ▶ Fabrikasi dan instalasi tulangan baja sesuai gambar (workshop drawing)
   ▶ Pemasangan bekisting sistem (formwork) — kontrol dimensi dan elevasi
   ▶ Pengecoran beton menggunakan ready mix sesuai mutu (K-250 min.)
   ▶ Perawatan beton (curing) minimal 14 hari dengan karung basah / curing compound
   ▶ Pengujian beton: slump test setiap kedatangan truck mixer + benda uji silinder
   ▶ Erection struktur baja (jika ada) sesuai shop drawing dan metode erection plan

C. Pekerjaan Arsitektur
   ▶ Pemasangan pasangan dinding bata/hebel sesuai spesifikasi
   ▶ Plesteran dan acian dinding (ketebalan 15/20 mm)
   ▶ Pemasangan keramik lantai dan dinding — pola sesuai gambar arsitektur
   ▶ Pengerjaan pintu, jendela, dan kusen aluminium/kayu
   ▶ Pemasangan plafon (gypsumboard / calsiboard) sesuai pola gambar
   ▶ Pengecatan dinding interior dan eksterior (2x undercoat + 2x finish)
   ▶ Pekerjaan atap: rangka baja ringan + penutup atap sesuai spesifikasi

D. Pekerjaan Mekanikal Elektrikal Plumbing (MEP)
   ▶ Instalasi sistem air bersih dan air kotor sesuai skema isometri
   ▶ Instalasi panel listrik utama (MDP) dan panel distribusi (SDP)
   ▶ Pemasangan instalasi kabel sesuai PUIL 2011 dan gambar single line diagram
   ▶ Instalasi sistem fire fighting, fire alarm, dan APAR
   ▶ Instalasi AC dan sistem tata udara
   ▶ Pengujian dan commissioning seluruh sistem MEP

IV. STRUKTUR ORGANISASI PROYEK
${"─".repeat(70)}

   Project Manager    : ${d.namapm || "[Nama PM]"}
   Site Manager       : [Nama Site Manager] — SKK Jenjang 8
   K3 Konstruksi      : [Nama K3] — SKK Ahli Muda K3 Konstruksi
   QA/QC Engineer     : [Nama QA/QC] — Ahli Teknik Terkait
   Site Engineer (Struct) : [Nama SE]
   Site Engineer (ME) : [Nama SE ME]
   Administrasi       : [Nama Admin]

V. KESELAMATAN KONSTRUKSI (K3)
${"─".repeat(70)}

   ▶ RK3K disusun sesuai Permen PUPR No. 10 Tahun 2021
   ▶ APD wajib: helm, rompi, sepatu safety, sarung tangan, kacamata pelindung
   ▶ Toolbox meeting K3 setiap pagi sebelum mulai kerja
   ▶ Safety induction untuk seluruh pekerja baru sebelum masuk ke area proyek
   ▶ Pemasangan safety net, jaring pengaman, dan barricade sesuai IBPR
   ▶ Biaya K3 tercantum eksplisit dalam RAB sesuai Permen PUPR 10/2021
   ▶ Pelaporan insiden K3 kepada Direksi Lapangan dalam 1x24 jam

VI. JAMINAN MUTU
${"─".repeat(70)}
   ▶ Pengujian material sebelum digunakan: semen, baja, agregat (pasir/batu)
   ▶ Uji beton: slump test + benda uji silinder (per 10 m³ atau per 1 hari cor)
   ▶ Pemeriksaan tulangan sebelum pengecoran oleh Direksi Lapangan
   ▶ Checklist mutu per item pekerjaan (inspeksi & test plan sesuai RMK)

${"═".repeat(70)}
Dibuat oleh: ${d.namaPerusahaan || "[Nama Perusahaan]"} — ${today()}`,
  },

  {
    id: "rk3k",
    kategori: "tender", icon: Shield,
    nama: "RK3K (Rencana K3 Kontrak)",
    deskripsi: "Rencana Keselamatan Konstruksi sesuai Permen PUPR No. 10 Tahun 2021 — IBPR + APD + prosedur darurat",
    regulasi: "Permen PUPR 10/2021",
    badge: "Tender", badgeColor: "bg-green-100 text-green-800",
    fields: [
      { key: "namaProyek", label: "Nama Pekerjaan", placeholder: "Konstruksi Jembatan Rangka Baja..." },
      { key: "lokasiProyek", label: "Lokasi Proyek", placeholder: "Kab. Sleman, DIY" },
      { key: "namaPerusahaan", label: "Nama Perusahaan Pelaksana", placeholder: "PT. Sarana Jaya Konstruksi" },
      { key: "namaK3", label: "Nama Penanggung Jawab K3", placeholder: "Ir. Dewi Rahayu, SKK Ahli K3" },
      { key: "jangkaWaktu", label: "Jangka Waktu Pelaksanaan", placeholder: "180 hari kalender" },
    ],
    generate: (d) => `RENCANA KESELAMATAN KONSTRUKSI (RK3K)
${"═".repeat(70)}

Pekerjaan : ${d.namaProyek || "[Nama Pekerjaan]"}
Lokasi    : ${d.lokasiProyek || "[Lokasi]"}
Pelaksana : ${d.namaPerusahaan || "[Nama Perusahaan]"}
PJ K3     : ${d.namaK3 || "[Nama Penanggung Jawab K3]"}
Durasi    : ${d.jangkaWaktu || "[Jangka Waktu]"}
Tanggal   : ${today()}

${"═".repeat(70)}
A. KEBIJAKAN KESELAMATAN KONSTRUKSI
${"─".repeat(70)}

${d.namaPerusahaan || "[Perusahaan]"} berkomitmen untuk:
1. Menyediakan lingkungan kerja yang selamat, sehat, dan bebas kecelakaan
2. Mematuhi seluruh peraturan K3 yang berlaku (PP No. 50/2012, Permen PUPR 10/2021)
3. Melibatkan seluruh tenaga kerja dalam program keselamatan
4. Melakukan perbaikan berkelanjutan atas kinerja K3 di proyek

${"─".repeat(70)}
B. IDENTIFIKASI BAHAYA & PENILAIAN RISIKO (IBPR)
${"─".repeat(70)}

┌─────────────────────────┬───────────────────────┬──────────┬──────────────────────────┐
│ Jenis Pekerjaan         │ Potensi Bahaya         │ Risiko   │ Pengendalian             │
├─────────────────────────┼───────────────────────┼──────────┼──────────────────────────┤
│ Galian tanah            │ Longsor/runtuh dinding │ TINGGI   │ Sheet pile + slope watch  │
│ Pekerjaan di ketinggian │ Jatuh dari ketinggian  │ TINGGI   │ Safety harness + guardrail│
│ Pengecoran beton        │ Terkena cipratan beton │ SEDANG   │ Kacamata + sarung tangan │
│ Instalasi besi/baja     │ Tertimpa material berat│ TINGGI   │ Lifting plan + exclusion  │
│ Pekerjaan las           │ Percikan api/radiasi   │ SEDANG   │ Pelindung muka + apron   │
│ Pekerjaan galian basah  │ Tenggelam/terpapar air │ SEDANG   │ Life jacket + dewatering  │
│ Mobilisasi alat berat   │ Tertabrak alat          │ TINGGI   │ Zona eksklusif + flagman │
└─────────────────────────┴───────────────────────┴──────────┴──────────────────────────┘

${"─".repeat(70)}
C. RENCANA KESELAMATAN & ALAT PELINDUNG DIRI (APD)
${"─".repeat(70)}

APD Wajib Seluruh Pekerja:
  ✓ Helm keselamatan (SNI) — wajib setiap saat di area konstruksi
  ✓ Rompi keselamatan (safety vest) berwarna terang
  ✓ Sepatu safety dengan pelindung baja di ujung kaki
  ✓ Sarung tangan kulit/karet sesuai jenis pekerjaan
  ✓ Kacamata pelindung untuk pekerjaan pengelasan/cutting

APD Khusus Per Pekerjaan:
  ✓ Pekerjaan di ketinggian (>1.8m): safety harness full body
  ✓ Pekerjaan las: pelindung muka, apron kulit, sarung tangan las
  ✓ Pekerjaan galian dalam: life jacket, safety rope

${"─".repeat(70)}
D. PROGRAM K3 BULANAN
${"─".repeat(70)}

  □ Toolbox meeting K3 — setiap hari Senin pagi
  □ Safety patrol lapangan — setiap hari oleh PJ K3
  □ Inspeksi APD — setiap minggu
  □ Latihan tanggap darurat & evakuasi — setiap bulan
  □ Medical check-up pekerja — setiap 3 bulan
  □ Laporan K3 bulanan ke PPK — setiap tanggal 5

${"─".repeat(70)}
E. PROSEDUR TANGGAP DARURAT
${"─".repeat(70)}

1. KEBAKARAN: Padamkan dengan APAR → Evakuasi ke titik kumpul → Hubungi 113
2. KECELAKAAN KERJA: P3K awal → Bawa ke RS terdekat → Lapor ke PJ K3 → Lapor PPK dalam 24 jam
3. BENCANA ALAM: Hentikan pekerjaan → Evakuasi ke titik kumpul → Hubungi BPBD

${"─".repeat(70)}
F. ANGGARAN K3 (sesuai Permen PUPR 10/2021)
${"─".repeat(70)}

  Anggaran K3 dihitung eksplisit dalam RAB:
  ✓ Pengadaan APD seluruh pekerja
  ✓ Pemasangan rambu, pagar, dan safety net
  ✓ Biaya pelatihan dan sosialisasi K3
  ✓ BPJS Ketenagakerjaan dan BPJS Kesehatan pekerja
  ✓ Biaya first aid dan P3K
  ✓ Biaya asuransi konstruksi (CAR)

${"═".repeat(70)}
Disetujui oleh:                          Disusun oleh:

Direksi Lapangan/Konsultan Pengawas      PJ K3 Proyek


_______________________________          _______________________________
[Nama Direksi Lapangan]                  ${d.namaK3 || "[Nama PJ K3]"}
${"═".repeat(70)}`,
  },

  // ═══ PROYEK ═══════════════════════════════════════════════════════════

  {
    id: "spmk",
    kategori: "proyek", icon: PenLine,
    nama: "Surat Perintah Mulai Kerja (SPMK)",
    deskripsi: "SPMK diterbitkan PPK kepada penyedia — menentukan tanggal awal dan batas akhir kontrak",
    regulasi: "Permen PUPR 22/2023",
    badge: "Proyek", badgeColor: "bg-orange-100 text-orange-800",
    fields: [
      { key: "nomorSPMK", label: "Nomor SPMK", placeholder: "SPMK/001/PU/IV/2025" },
      { key: "nomorKontrak", label: "Nomor Kontrak", placeholder: "KTR/001/PU/IV/2025" },
      { key: "namaProyek", label: "Nama Pekerjaan", placeholder: "Pembangunan Jalan Akses Kawasan Industri" },
      { key: "nilaiKontrak", label: "Nilai Kontrak (termasuk PPN)", placeholder: "Rp 12.500.000.000" },
      { key: "namaPerusahaan", label: "Nama Penyedia Jasa", placeholder: "PT. Karya Jaya Konstruksi" },
      { key: "namaDirektur", label: "Nama Direktur Penyedia", placeholder: "Ir. Hendra Wijaya, ST." },
      { key: "tanggalMulai", label: "Tanggal Mulai Kerja", placeholder: "01 Mei 2025" },
      { key: "tanggalSelesai", label: "Tanggal Selesai", placeholder: "30 Oktober 2025" },
      { key: "jangkaWaktu", label: "Jangka Waktu (hari kalender)", placeholder: "183 hari kalender" },
      { key: "namaPPK", label: "Nama PPK", placeholder: "Ir. Siti Rahayu, M.Sc." },
      { key: "instansi", label: "Nama Instansi / SKPD", placeholder: "Dinas Pekerjaan Umum Provinsi..." },
      { key: "kota", label: "Kota", placeholder: "Bandung" },
    ],
    generate: (d) => `SURAT PERINTAH MULAI KERJA (SPMK)
${"═".repeat(70)}

Nomor : ${d.nomorSPMK || "[Nomor SPMK]"}

Yang bertandatangan di bawah ini:

  Nama     : ${d.namaPPK || "[Nama PPK]"}
  Jabatan  : Pejabat Pembuat Komitmen (PPK)
  Instansi : ${d.instansi || "[Nama Instansi]"}

Memerintahkan kepada:

  Nama Direktur   : ${d.namaDirektur || "[Nama Direktur]"}
  Jabatan         : Direktur Utama
  Nama Perusahaan : ${d.namaPerusahaan || "[Nama Perusahaan]"}

Berdasarkan Kontrak Nomor ${d.nomorKontrak || "[Nomor Kontrak]"}, untuk segera memulai pelaksanaan pekerjaan:

  Nama Pekerjaan : ${d.namaProyek || "[Nama Pekerjaan]"}
  Nilai Kontrak  : ${d.nilaiKontrak || "[Nilai Kontrak]"}

Dengan ketentuan sebagai berikut:

1. Tanggal Mulai Kerja   : ${d.tanggalMulai || "[Tanggal Mulai]"}
2. Tanggal Selesai       : ${d.tanggalSelesai || "[Tanggal Selesai]"}
3. Jangka Waktu          : ${d.jangkaWaktu || "[Jangka Waktu]"}

Penyedia jasa diwajibkan untuk:
a. Segera memobilisasi peralatan, tenaga kerja, dan material ke lokasi pekerjaan
b. Memasang papan nama proyek sesuai format yang ditentukan PPK
c. Menyampaikan RMK (Rencana Mutu Kontrak) kepada PPK dalam 14 hari kalender setelah SPMK
d. Menyampaikan RK3K kepada PPK sebelum mulai pekerjaan
e. Melaksanakan MC-0 (Mutual Check awal) bersama Direksi Lapangan dalam 7 hari setelah SPMK

Demikian SPMK ini diterbitkan untuk dilaksanakan sebaik-baiknya.

                                        ${d.kota || "[Kota]"}, ${today()}

   Penyedia Jasa,                          PPK,


   ___________________________             ___________________________
   ${d.namaDirektur || "[Nama Direktur]"}               ${d.namaPPK || "[Nama PPK]"}
   ${d.namaPerusahaan || "[Nama Perusahaan]"}

${"═".repeat(70)}`,
  },

  {
    id: "ba-kemajuan",
    kategori: "proyek", icon: FileBadge,
    nama: "Berita Acara Kemajuan Pekerjaan",
    deskripsi: "BA kemajuan pekerjaan untuk pengajuan pembayaran termin — ditandatangani PPK dan penyedia",
    regulasi: "Permen PUPR 22/2023",
    badge: "Proyek", badgeColor: "bg-orange-100 text-orange-800",
    fields: [
      { key: "nomorBA", label: "Nomor Berita Acara", placeholder: "BA-KM/003/PU/VI/2025" },
      { key: "namaProyek", label: "Nama Pekerjaan", placeholder: "Konstruksi Gedung Puskesmas..." },
      { key: "nomorKontrak", label: "Nomor Kontrak", placeholder: "KTR/001/PU/IV/2025" },
      { key: "nilaiKontrak", label: "Nilai Kontrak", placeholder: "Rp 8.750.000.000" },
      { key: "progressFisik", label: "Progress Fisik (%)", placeholder: "65" },
      { key: "nilaiTagihan", label: "Nilai Tagihan Termin Ini", placeholder: "Rp 2.187.500.000" },
      { key: "namaPerusahaan", label: "Nama Penyedia", placeholder: "PT. Maju Jaya Konstruksi" },
      { key: "namaDirektur", label: "Nama Direktur/Kuasa", placeholder: "Budi Hartono, ST." },
      { key: "namaPPK", label: "Nama PPK", placeholder: "Ir. Sri Wahyuni, M.T." },
      { key: "konsultanPengawas", label: "Nama Konsultan Pengawas", placeholder: "CV. Pengawas Teknik Indonesia" },
      { key: "kota", label: "Kota", placeholder: "Semarang" },
    ],
    generate: (d) => `BERITA ACARA KEMAJUAN PEKERJAAN
${"═".repeat(70)}

Nomor : ${d.nomorBA || "[Nomor BA]"}

Pada hari ini, ${today()}, kami yang bertandatangan di bawah ini:

1. Nama     : ${d.namaPPK || "[Nama PPK]"}
   Jabatan  : Pejabat Pembuat Komitmen (PPK)
   Instansi : [Nama Instansi/SKPD]

2. Nama     : ${d.namaDirektur || "[Nama Direktur]"}
   Jabatan  : Direktur / Kuasa Penyedia Jasa
   Perusahaan: ${d.namaPerusahaan || "[Nama Perusahaan]"}

3. Nama     : [Nama Pengawas]
   Jabatan  : Konsultan Pengawas
   Perusahaan: ${d.konsultanPengawas || "[Konsultan Pengawas]"}

Telah mengadakan pemeriksaan di lapangan untuk pekerjaan:

  Nama Pekerjaan : ${d.namaProyek || "[Nama Pekerjaan]"}
  Nomor Kontrak  : ${d.nomorKontrak || "[Nomor Kontrak]"}
  Nilai Kontrak  : ${d.nilaiKontrak || "[Nilai Kontrak]"}

Dengan hasil pemeriksaan sebagai berikut:

  1. Progress Fisik Pekerjaan s.d. ${tglShort()} : ${d.progressFisik || "[%]"}%
  2. Nilai Tagihan Termin          : ${d.nilaiTagihan || "[Nilai]"}

Rincian Kemajuan Per Divisi Pekerjaan:
  ┌────────────────────────────────────────┬──────────┬──────────┬────────────┐
  │ Divisi Pekerjaan                       │ Rencana% │ Aktual%  │ Deviasi    │
  ├────────────────────────────────────────┼──────────┼──────────┼────────────┤
  │ I.   Pekerjaan Persiapan               │  100%    │  100%    │    0%      │
  │ II.  Pekerjaan Tanah & Pondasi         │  100%    │   98%    │   -2%      │
  │ III. Pekerjaan Struktur                │   80%    │   75%    │   -5%      │
  │ IV.  Pekerjaan Arsitektur              │   40%    │   38%    │   -2%      │
  │ V.   Pekerjaan MEP                     │   20%    │   18%    │   -2%      │
  │ TOTAL                                  │   ${d.progressFisik ? (parseFloat(d.progressFisik) + 3).toFixed(0) : "68"}%    │   ${d.progressFisik || "65"}%    │  sesuai    │
  └────────────────────────────────────────┴──────────┴──────────┴────────────┘

Berita Acara ini dibuat dengan sebenarnya untuk digunakan sebagai dasar pengajuan tagihan pembayaran kepada Bendahara/Keuangan.

     ${d.kota || "[Kota]"}, ${today()}

PPK,                  Konsultan Pengawas,         Penyedia Jasa,


_______________       ___________________         ___________________
${d.namaPPK || "[Nama PPK]"}         [Pengawas]               ${d.namaDirektur || "[Direktur]"}
PPK                   Pengawas Lapangan           ${d.namaPerusahaan || "[Perusahaan]"}

${"═".repeat(70)}`,
  },

  {
    id: "bast1",
    kategori: "proyek", icon: FileBadge,
    nama: "Berita Acara Serah Terima Pertama (BAST-1 / PHO)",
    deskripsi: "BA serah terima pekerjaan pertama (Provisional Hand Over) — dimulainya masa pemeliharaan",
    regulasi: "Perpres 46/2025 + Permen PUPR 22/2023",
    badge: "Proyek", badgeColor: "bg-orange-100 text-orange-800",
    fields: [
      { key: "nomorBAST", label: "Nomor BAST", placeholder: "BAST-1/001/PU/X/2025" },
      { key: "namaProyek", label: "Nama Pekerjaan", placeholder: "Rehabilitasi Gedung Balai Desa..." },
      { key: "nomorKontrak", label: "Nomor Kontrak", placeholder: "KTR/001/PU/IV/2025" },
      { key: "nilaiKontrak", label: "Nilai Kontrak", placeholder: "Rp 3.200.000.000" },
      { key: "namaPerusahaan", label: "Nama Penyedia", placeholder: "PT. Bumi Asri Konstruksi" },
      { key: "namaDirektur", label: "Nama Direktur", placeholder: "Ir. Soenarno, MT." },
      { key: "masaPemeliharaan", label: "Lama Masa Pemeliharaan", placeholder: "180 hari kalender" },
      { key: "tanggalAkhirPemeliharaan", label: "Tanggal Akhir Masa Pemeliharaan", placeholder: "30 April 2026" },
      { key: "namaPPK", label: "Nama PPK", placeholder: "Drs. Agus Prabowo, MT." },
      { key: "kota", label: "Kota", placeholder: "Yogyakarta" },
    ],
    generate: (d) => `BERITA ACARA SERAH TERIMA PERTAMA
(PROVISIONAL HAND OVER — PHO / BAST-1)
${"═".repeat(70)}

Nomor : ${d.nomorBAST || "[Nomor BAST-1]"}

Pada hari ini, ${today()}, kami yang bertandatangan di bawah ini:

1. Nama     : ${d.namaPPK || "[Nama PPK]"}
   Jabatan  : Pejabat Pembuat Komitmen (PPK)

2. Nama     : ${d.namaDirektur || "[Nama Direktur]"}
   Jabatan  : Direktur / Kuasa Penyedia Jasa
   Perusahaan: ${d.namaPerusahaan || "[Nama Perusahaan]"}

Telah mengadakan serah terima pekerjaan:

  Nama Pekerjaan  : ${d.namaProyek || "[Nama Pekerjaan]"}
  Nomor Kontrak   : ${d.nomorKontrak || "[Nomor Kontrak]"}
  Nilai Kontrak   : ${d.nilaiKontrak || "[Nilai Kontrak]"}

HASIL PEMERIKSAAN:

  □ Progress fisik pekerjaan : 100% (seratus persen) — SELESAI
  □ Seluruh pekerjaan telah dilaksanakan sesuai lingkup kontrak
  □ Kualitas pekerjaan telah diperiksa dan memenuhi spesifikasi teknis
  □ As-built drawing telah diserahkan dalam kondisi lengkap
  □ Manual O&M telah diserahkan kepada PPK/pengguna
  □ Sertifikat garansi peralatan utama telah diserahkan

DENGAN INI DITETAPKAN BAHWA:

1. Pekerjaan dinyatakan SELESAI dan diterima oleh PPK dalam keadaan baik.
2. Masa pemeliharaan dimulai sejak tanggal ${today()} selama ${d.masaPemeliharaan || "180 hari kalender"}.
3. Masa pemeliharaan berakhir pada tanggal ${d.tanggalAkhirPemeliharaan || "[Tanggal Akhir Pemeliharaan]"}.
4. Selama masa pemeliharaan, penyedia wajib memperbaiki cacat mutu atas biaya sendiri.
5. Jaminan Pemeliharaan senilai 5% dari nilai kontrak diserahkan oleh penyedia bersamaan dengan BAST-1 ini.

Berita Acara ini dibuat dan ditandatangani oleh kedua pihak sebagai bukti serah terima yang sah.

        ${d.kota || "[Kota]"}, ${today()}

PPK,                                    Penyedia Jasa,


[Materai Rp 10.000]                     [Materai Rp 10.000]


_______________________________         _______________________________
${d.namaPPK || "[Nama PPK]"}               ${d.namaDirektur || "[Nama Direktur]"}
PPK                                     ${d.namaPerusahaan || "[Nama Perusahaan]"}

${"═".repeat(70)}`,
  },

  {
    id: "addendum",
    kategori: "proyek", icon: Gavel,
    nama: "Addendum Kontrak",
    deskripsi: "Addendum perubahan lingkup/nilai/waktu kontrak — harus ditandatangani sebelum pekerjaan addendum dilaksanakan",
    regulasi: "Perpres 46/2025 + Permen PUPR 22/2023",
    badge: "Proyek", badgeColor: "bg-orange-100 text-orange-800",
    fields: [
      { key: "nomorAddendum", label: "Nomor Addendum", placeholder: "ADD-01/KTR-001/PU/VII/2025" },
      { key: "nomorKontrakAsal", label: "Nomor Kontrak Asal", placeholder: "KTR/001/PU/IV/2025" },
      { key: "namaProyek", label: "Nama Pekerjaan", placeholder: "Pembangunan Jembatan Rangka Baja" },
      { key: "namaPerusahaan", label: "Nama Penyedia", placeholder: "PT. Jembatan Nusantara" },
      { key: "nilaiKontrakAsal", label: "Nilai Kontrak Asal", placeholder: "Rp 15.000.000.000" },
      { key: "nilaiAddendum", label: "Nilai Addendum (+ / -)", placeholder: "+ Rp 1.200.000.000" },
      { key: "nilaiKontrakBaru", label: "Nilai Kontrak Setelah Addendum", placeholder: "Rp 16.200.000.000" },
      { key: "alasanAddendum", label: "Alasan / Dasar Addendum", placeholder: "Perubahan lingkup pekerjaan fondasi akibat kondisi tanah berbeda" },
      { key: "perpanjanganWaktu", label: "Perpanjangan Waktu (jika ada)", placeholder: "30 hari kalender" },
      { key: "namaPPK", label: "Nama PPK", placeholder: "Ir. Retno Widiastuti, M.Sc." },
      { key: "kota", label: "Kota", placeholder: "Makassar" },
    ],
    generate: (d) => `ADDENDUM KONTRAK
${"═".repeat(70)}

Nomor Addendum  : ${d.nomorAddendum || "[Nomor Addendum]"}
Nomor Kontrak   : ${d.nomorKontrakAsal || "[Nomor Kontrak Asal]"}
Pekerjaan       : ${d.namaProyek || "[Nama Pekerjaan]"}

PARA PIHAK:

1. Nama     : ${d.namaPPK || "[Nama PPK]"}
   Jabatan  : Pejabat Pembuat Komitmen (PPK)

2. Nama     : [Nama Direktur]
   Jabatan  : Direktur Utama
   Perusahaan: ${d.namaPerusahaan || "[Nama Perusahaan]"}

DASAR ADDENDUM:

  ${d.alasanAddendum || "[Alasan Addendum]"}

PERUBAHAN YANG DISEPAKATI:

  Nilai Kontrak Asal           : ${d.nilaiKontrakAsal || "[Nilai Asal]"}
  Perubahan Nilai              : ${d.nilaiAddendum || "[Nilai Addendum]"}
  Nilai Kontrak Setelah Add.   : ${d.nilaiKontrakBaru || "[Nilai Baru]"}
  Perpanjangan Waktu           : ${d.perpanjanganWaktu || "Tidak ada perpanjangan waktu"}

PERNYATAAN PARA PIHAK:

Para pihak sepakat bahwa perubahan dalam Addendum ini merupakan bagian yang tidak terpisahkan dari Kontrak asal dan mengikat kedua pihak secara hukum. Seluruh ketentuan dalam kontrak asal yang tidak diubah dalam Addendum ini tetap berlaku.

             ${d.kota || "[Kota]"}, ${today()}

PPK,                                    Penyedia Jasa,


[Materai Rp 10.000]                     [Materai Rp 10.000]


_______________________________         _______________________________
${d.namaPPK || "[Nama PPK]"}               [Nama Direktur]
PPK                                     ${d.namaPerusahaan || "[Nama Perusahaan]"}

${"═".repeat(70)}`,
  },

  {
    id: "laporan-harian",
    kategori: "proyek", icon: Clock,
    nama: "Laporan Harian Proyek",
    deskripsi: "Catatan harian pelaksanaan proyek — cuaca, tenaga kerja, material, alat, dan progress",
    regulasi: "Permen PUPR 22/2023",
    badge: "Proyek", badgeColor: "bg-orange-100 text-orange-800",
    fields: [
      { key: "namaProyek", label: "Nama Pekerjaan", placeholder: "Peningkatan Jalan Desa..." },
      { key: "nomorKontrak", label: "Nomor Kontrak", placeholder: "KTR/005/PU/IV/2025" },
      { key: "tanggalLaporan", label: "Tanggal Laporan", placeholder: "09 April 2025", type: "date" },
      { key: "cuaca", label: "Kondisi Cuaca", placeholder: "Cerah / Berawan / Hujan" },
      { key: "jumlahTenagaKerja", label: "Jumlah Tenaga Kerja (orang)", placeholder: "25" },
      { key: "namaPerusahaan", label: "Nama Penyedia", placeholder: "PT. Infrastruktur Prima" },
      { key: "namaPelaksana", label: "Nama Pelaksana/Site Manager", placeholder: "Ir. Darmawan, ST." },
    ],
    generate: (d) => `LAPORAN HARIAN PROYEK
${"═".repeat(70)}

  Nama Pekerjaan  : ${d.namaProyek || "[Nama Pekerjaan]"}
  Nomor Kontrak   : ${d.nomorKontrak || "[Nomor Kontrak]"}
  Tanggal         : ${d.tanggalLaporan || today()}
  Hari ke-        : [Isi Hari ke-]
  Cuaca           : ${d.cuaca || "[Cuaca]"}

${"─".repeat(70)}
A. TENAGA KERJA
${"─".repeat(70)}

  ┌─────────────────────┬──────────────────────┐
  │ Jabatan             │ Jumlah (orang)        │
  ├─────────────────────┼──────────────────────┤
  │ Mandor              │                       │
  │ Kepala Tukang       │                       │
  │ Tukang Batu/Besi    │                       │
  │ Pekerja Umum        │                       │
  │ Operator Alat Berat │                       │
  │ TOTAL               │ ${d.jumlahTenagaKerja || "[Total]"}                   │
  └─────────────────────┴──────────────────────┘

${"─".repeat(70)}
B. PEKERJAAN YANG DILAKSANAKAN HARI INI
${"─".repeat(70)}

  1. ____________________________________________________________
     Volume       : _______ | Satuan: _______
     Lokasi       : _______

  2. ____________________________________________________________
     Volume       : _______ | Satuan: _______
     Lokasi       : _______

  3. ____________________________________________________________
     Volume       : _______ | Satuan: _______

${"─".repeat(70)}
C. MATERIAL MASUK HARI INI
${"─".repeat(70)}

  ┌─────────────────────────────┬──────────┬──────────┐
  │ Material                    │ Volume   │ Satuan   │
  ├─────────────────────────────┼──────────┼──────────┤
  │                             │          │          │
  │                             │          │          │
  │                             │          │          │
  └─────────────────────────────┴──────────┴──────────┘

${"─".repeat(70)}
D. PERALATAN DI LAPANGAN
${"─".repeat(70)}

  ┌─────────────────────────────┬──────────┬───────────────┐
  │ Peralatan                   │ Jumlah   │ Kondisi       │
  ├─────────────────────────────┼──────────┼───────────────┤
  │                             │          │               │
  │                             │          │               │
  └─────────────────────────────┴──────────┴───────────────┘

${"─".repeat(70)}
E. KEJADIAN / CATATAN KHUSUS
${"─".repeat(70)}

  K3   : □ Tidak ada insiden  □ Ada insiden (uraikan): _______________
  Mutu : □ Tidak ada masalah  □ Ada masalah (uraikan): _______________
  Lain : _______________________________________________________________

${"─".repeat(70)}
F. PROGRESS PEKERJAAN
${"─".repeat(70)}

  Rencana Kumulatif (%) : _______
  Aktual Kumulatif (%)  : _______
  Deviasi               : _______

${"─".repeat(70)}

  Dibuat oleh,                        Diperiksa oleh,
  Pelaksana/Site Manager              Direksi Lapangan


  _____________________________       _____________________________
  ${d.namaPelaksana || "[Nama Pelaksana]"}              [Nama Direksi Lapangan]
  ${d.namaPerusahaan || "[Nama Perusahaan]"}

${"═".repeat(70)}`,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────
type GenHistory = { id: string; nama: string; waktu: string; content: string };

export default function DocGeneratorPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filterTab, setFilterTab] = useState("semua");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [history, setHistory] = useState<GenHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  // Backend: load saved docs when authenticated
  const { data: savedDocs = [], refetch: refetchSaved } = useQuery<any[]>({
    queryKey: ["/api/generated-docs"],
    enabled: !!user,
  });

  // Backend: save generated doc mutation
  const saveDocMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/generated-docs", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/generated-docs"] });
      toast({ title: "Dokumen disimpan ke akun Anda" });
    },
  });

  // Backend: delete saved doc
  const deleteDocMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/generated-docs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/generated-docs"] }),
  });

  const filtered = useMemo(() => templates.filter(t => {
    const matchTab = filterTab === "semua" || t.kategori === filterTab;
    const matchSearch = !searchQ || t.nama.toLowerCase().includes(searchQ.toLowerCase()) || t.deskripsi.toLowerCase().includes(searchQ.toLowerCase());
    return matchTab && matchSearch;
  }), [filterTab, searchQ]);

  function selectTemplate(tmpl: Template) {
    setSelectedTemplate(tmpl);
    const defaults: Record<string, string> = {};
    tmpl.fields.forEach(f => { defaults[f.key] = ""; });
    setFormData(defaults);
    setGeneratedDoc(null);
  }

  function generateDoc() {
    if (!selectedTemplate) return;
    const content = selectedTemplate.generate(formData);
    setGeneratedDoc(content);
    const entry: GenHistory = { id: Date.now().toString(), nama: selectedTemplate.nama, waktu: today(), content };
    setHistory(prev => [entry, ...prev.slice(0, 9)]);
    toast({ title: "Dokumen berhasil digenerate!" });
    // Auto-save to backend if authenticated
    if (user) {
      saveDocMutation.mutate({
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.nama,
        kategori: selectedTemplate.kategori,
        formData: JSON.stringify(formData),
        generatedContent: content,
      });
    }
  }

  function copyDoc() {
    if (!generatedDoc) return;
    navigator.clipboard.writeText(generatedDoc);
    setCopied(true);
    toast({ title: "Dokumen disalin ke clipboard" });
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadDoc() {
    if (!generatedDoc || !selectedTemplate) return;
    const blob = new Blob([generatedDoc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate.nama.replace(/\s+/g, "_")}_${Date.now()}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Dokumen berhasil diunduh" });
  }

  function resetAll() { setSelectedTemplate(null); setGeneratedDoc(null); setFormData({}); }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          {selectedTemplate ? (
            <Button variant="ghost" size="sm" onClick={resetAll} data-testid="button-back-catalog">
              <ArrowLeft className="w-4 h-4 mr-1" /> Semua Template
            </Button>
          ) : (
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-dashboard"><ArrowLeft className="w-4 h-4 mr-1" /> Kembali</Button>
            </Link>
          )}
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span className="font-bold text-slate-800">{selectedTemplate ? selectedTemplate.nama : "Generator Dokumen Konstruksi"}</span>
            {selectedTemplate && <Badge className={`text-xs ${selectedTemplate.badgeColor}`}>{selectedTemplate.badge}</Badge>}
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} data-testid="button-history">
              <History className="w-4 h-4 mr-1" /> Riwayat ({history.length})
            </Button>
            <Link href="/tender-generator">
              <Button variant="outline" size="sm" data-testid="button-goto-tender"><FileText className="w-4 h-4 mr-1" /> Tender AI</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── CATALOG ── */}
        {!selectedTemplate && (
          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-violet-600 text-white text-xs px-3 py-1">
                {templates.length} Template Dokumen Siap Pakai
              </Badge>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Generator Dokumen<br /><span className="text-violet-600">Tender & Proyek Konstruksi</span></h1>
              <p className="text-slate-600 text-sm max-w-xl leading-relaxed">
                Pilih template dokumen, isi data proyek, dan dokumen siap dalam hitungan detik — format standar Perpres 46/2025, Permen PUPR 22/2023, dan regulasi konstruksi terbaru.
              </p>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" placeholder="Cari template dokumen..."
                  className="w-full pl-9 pr-4 h-9 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  data-testid="input-search-template"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { v: "semua", l: `Semua (${templates.length})` },
                  { v: "tender", l: `Tender (${templates.filter(t => t.kategori === "tender").length})` },
                  { v: "proyek", l: `Proyek (${templates.filter(t => t.kategori === "proyek").length})` },
                ].map(f => (
                  <button key={f.v} onClick={() => setFilterTab(f.v)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${filterTab === f.v ? "bg-violet-600 text-white border-violet-600" : "bg-white border-slate-200 hover:border-violet-300"}`}
                    data-testid={`filter-${f.v}`}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(tmpl => (
                <Card key={tmpl.id} className="cursor-pointer hover:border-violet-300 hover:shadow-md transition-all group" onClick={() => selectTemplate(tmpl)} data-testid={`card-template-${tmpl.id}`}>
                  <CardContent className="pt-5 pb-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tmpl.kategori === "tender" ? "bg-green-100" : tmpl.kategori === "proyek" ? "bg-orange-100" : "bg-blue-100"} group-hover:scale-110 transition-transform`}>
                        <tmpl.icon className={`w-5 h-5 ${tmpl.kategori === "tender" ? "text-green-700" : tmpl.kategori === "proyek" ? "text-orange-700" : "text-blue-700"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Badge className={`text-[9px] mb-1 ${tmpl.badgeColor}`}>{tmpl.badge}</Badge>
                        <div className="font-bold text-sm leading-tight">{tmpl.nama}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{tmpl.deskripsi}</p>
                    <div className="text-[10px] text-slate-400">Regulasi: {tmpl.regulasi}</div>
                  </CardContent>
                  <CardFooter className="pt-0 pb-4">
                    <Button variant="ghost" size="sm" className="w-full text-xs group-hover:bg-violet-50 group-hover:text-violet-700" data-testid={`button-select-${tmpl.id}`}>
                      Buat Dokumen Ini <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-12 text-muted-foreground">
                  <LayoutTemplate className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>Tidak ada template yang cocok</p>
                </div>
              )}
            </div>

            {/* History Panel */}
            {showHistory && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-violet-600" />
                    {user ? "Dokumen Tersimpan di Akun" : "Riwayat Sesi Ini"}
                    {user && savedDocs.length > 0 && <Badge variant="secondary">{savedDocs.length}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                    savedDocs.length > 0 ? (
                      <div className="space-y-2">
                        {savedDocs.map((h: any) => (
                          <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl border hover:bg-slate-50 group" data-testid={`saved-doc-${h.id}`}>
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { setGeneratedDoc(h.generatedContent); const t = templates.find(x => x.id === h.templateId); if (t) setSelectedTemplate(t); }}>
                              <div className="text-sm font-semibold truncate">{h.templateName}</div>
                              <div className="text-[10px] text-muted-foreground">{new Date(h.createdAt).toLocaleDateString("id-ID")}</div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { navigator.clipboard.writeText(h.generatedContent); toast({ title: "Disalin!" }); }}>
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => deleteDocMutation.mutate(h.id)} data-testid={`delete-doc-${h.id}`}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        <CloudDownload className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Belum ada dokumen tersimpan</p>
                        <p className="text-xs">Generate dokumen untuk menyimpannya secara otomatis</p>
                      </div>
                    )
                  ) : (
                    history.length > 0 ? (
                      <div className="space-y-2">
                        {history.map(h => (
                          <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl border hover:bg-slate-50 cursor-pointer" onClick={() => { setGeneratedDoc(h.content); const t = templates.find(x => x.nama === h.nama); if (t) setSelectedTemplate(t); }} data-testid={`history-item-${h.id}`}>
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="text-sm font-semibold">{h.nama}</div>
                              <div className="text-[10px] text-muted-foreground">{h.waktu}</div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(h.content); toast({ title: "Disalin!" }); }}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                        <p className="text-xs text-center text-muted-foreground pt-1">Login untuk menyimpan dokumen secara permanen</p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Belum ada riwayat di sesi ini</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
              <CardContent className="py-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold mb-1">Ingin generate dengan AI secara penuh?</div>
                  <p className="text-sm text-muted-foreground">Generator AI Tender menggunakan OpenClaw untuk dokumen yang lebih kontekstual dan detail</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link href="/tender-generator"><Button size="sm" data-testid="button-cta-ai-gen"><Zap className="w-4 h-4 mr-1" /> AI Tender Generator</Button></Link>
                  <Link href="/agent-hub"><Button variant="outline" size="sm" data-testid="button-cta-agent"><Sparkles className="w-4 h-4 mr-1" /> OpenClaw AI</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── FORM + PREVIEW ── */}
        {selectedTemplate && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <selectedTemplate.icon className="w-5 h-5 text-violet-600" />
                    Isi Data Dokumen
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Isi kolom yang diperlukan — kosongkan jika tidak ada datanya (akan diisi placeholder)</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  {selectedTemplate.fields.map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <Label className="text-xs font-semibold">{f.label}</Label>
                      {f.type === "textarea" ? (
                        <Textarea rows={2} placeholder={f.placeholder} value={formData[f.key] || ""} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} className="text-sm" data-testid={`field-${f.key}`} />
                      ) : (
                        <Input type={f.type === "date" ? "date" : "text"} placeholder={f.placeholder} value={formData[f.key] || ""} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} className="text-sm h-9" data-testid={`field-${f.key}`} />
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="border-t pt-4 flex gap-2">
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={generateDoc} data-testid="button-generate-doc">
                    <Sparkles className="w-4 h-4 mr-1" /> Generate Dokumen
                  </Button>
                  <Button variant="outline" onClick={() => { const d: Record<string, string> = {}; selectedTemplate.fields.forEach(f => { d[f.key] = ""; }); setFormData(d); setGeneratedDoc(null); }} data-testid="button-reset-form">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Quick nav to other templates */}
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wide">Template Lainnya</div>
                <div className="flex flex-wrap gap-2">
                  {templates.filter(t => t.id !== selectedTemplate.id).slice(0, 5).map(t => (
                    <button key={t.id} onClick={() => selectTemplate(t)} className="text-[10px] px-2 py-1 rounded-lg border bg-white hover:border-violet-300 font-semibold" data-testid={`button-quick-${t.id}`}>
                      {t.nama}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <Card className="flex flex-col">
                <CardHeader className="pb-3 border-b flex-shrink-0">
                  <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-violet-600" /> Preview Dokumen</span>
                    {generatedDoc && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyDoc} data-testid="button-copy-doc">
                          {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          {copied ? "Disalin" : "Salin"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadDoc} data-testid="button-download-doc">
                          <Download className="w-3.5 h-3.5 mr-1" /> Unduh
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  {generatedDoc ? (
                    <div className="bg-white border rounded-xl overflow-hidden">
                      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" /><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        <span className="text-[10px] text-slate-400 ml-2">{selectedTemplate.nama}.txt</span>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed p-4 max-h-[55vh] overflow-y-auto text-slate-800">
                        {generatedDoc}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-xl">
                      <Sparkles className="w-10 h-10 text-violet-300 mb-3" />
                      <p className="text-sm font-semibold text-slate-500">Isi form di sebelah kiri</p>
                      <p className="text-xs text-muted-foreground mt-1">kemudian klik "Generate Dokumen"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      {/* Layanan Terkait */}
      <RelatedServices
        subtitle="Dokumen sudah siap? Lanjutkan proses tender dan proyek Anda:"
        services={[
          { href: "/tender-generator", icon: FileText, label: "Generator Dokumen Tender", desc: "Buat dokumen penawaran, spesifikasi teknis & RK3K lengkap", color: "bg-green-600", badge: "Tools" },
          { href: "/mini-apps", icon: Zap, label: "Kalkulator & Mini Apps", desc: "Hitung jaminan, TKDN, anggaran proyek & tools konstruksi lainnya", color: "bg-teal-600" },
          { href: "/proyek", icon: FolderOpen, label: "Manajemen Proyek", desc: "Pantau progress proyek, fase pekerjaan & dokumen kontrak aktif", color: "bg-orange-600" },
          { href: "/ai-chat", icon: Sparkles, label: "Konsultasi AI Dokumen", desc: "Tanya AI soal klausul kontrak, format dokumen & regulasi terbaru", color: "bg-indigo-600", badge: "AI" },
        ]}
        nextStep={{ href: "/tender-generator", label: "Buka Generator Tender →", icon: FileText }}
      />
      </main>
    </div>
  );
}
