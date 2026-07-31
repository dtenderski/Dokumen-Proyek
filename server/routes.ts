import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./replit_integrations/auth";

// ── SuperAdmin guard ──────────────────────────────────────────────────────────
// Set env var SUPERADMIN_EMAILS as comma-separated email addresses.
// Example: SUPERADMIN_EMAILS=admin@perusahaan.com,owner@dokumenproyek.com
const SUPERADMIN_EMAILS = new Set(
  (process.env.SUPERADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
);
function isSuperAdmin(req: any, res: any, next: any) {
  const email: string = (req.user?.claims?.email ?? "").toLowerCase();
  if (SUPERADMIN_EMAILS.size > 0 && email && SUPERADMIN_EMAILS.has(email)) return next();
  if (SUPERADMIN_EMAILS.size === 0) {
    console.warn(`[SuperAdmin] SUPERADMIN_EMAILS not configured. Set it to your email. Requesting: ${email}`);
  }
  return res.status(403).json({ error: "Akses dibatasi untuk superadmin.", errorCode: "forbidden" });
}
import { insertUserProfileSchema, insertOpportunitySchema, insertProductSchema, insertOrderSchema, insertTenderDocumentSchema, insertProjectSchema, insertProjectUpdateSchema, insertTransactionSchema, insertEquipmentSchema, insertEquipmentRentalSchema } from "@shared/schema";
import OpenAI from "openai";
import multer from "multer";
import { createRequire } from "module";
// In ESM dev (tsx): import.meta.url is defined and works fine.
// In CJS production build: import.meta.url is undefined and throws — catch it and
// fall back to __filename, which is always a module-scoped global in CJS.
let require: NodeRequire;
try {
  require = createRequire(import.meta.url);
} catch {
  require = createRequire(__filename);
}
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
import mammoth from "mammoth";

// ─── MultiClaw Scheduler state ────────────────────────────────────────────────
let multiClawNextRun: Date | null = null;
let multiClawIntervalHours = 24;


async function seedDatabase() {
  // Seed Hero Content
  const existingHero = await storage.getHeroContent();
  if (!existingHero) {
    await storage.createHeroContent({
      badge: "Platform Layanan Dokumen & Konsultasi Usaha #1",
      title: "Jasa & Konsultasi Dokumen Legalitas, Perizinan, Sertifikasi & Tender",
      subtitle: "Kami membantu badan usaha dan tenaga ahli dalam pengurusan dokumen legalitas usaha, perizinan, sertifikasi SBU & SKK, dokumen tender, hingga dokumen proyek — cepat, tepat, dan terverifikasi.",
      primaryButtonText: "Lihat Layanan Kami",
      secondaryButtonText: "Konsultasi Gratis",
      backgroundImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop",
      isActive: true,
    });
  }

  // Seed Modules — 6 Layanan Inti
  const existingModules = await storage.getModules();
  if (existingModules.length === 0) {
    const modulesData = [
      {
        icon: "Building2",
        title: "Legalitas Usaha",
        description: "Pengurusan dokumen pendirian dan legalitas badan usaha secara lengkap dan terverifikasi.",
        features: ["Pendirian PT, CV, & Firma", "Pengurusan NIB melalui OSS", "NPWP Badan Usaha", "Akta notaris & pengesahan Kemenkumham", "Perubahan anggaran dasar"],
        type: "featured",
        featuredLabel: "WAJIB",
        anchorId: "mod-legalitas",
        sortOrder: 1,
      },
      {
        icon: "ShieldCheck",
        title: "Perizinan Usaha",
        description: "Pengurusan izin operasional, izin lingkungan, dan perizinan sektor khusus jasa konstruksi.",
        features: ["SIUJK & IUJK Konstruksi", "Izin lingkungan & AMDAL", "Izin operasional daerah", "OSS — sistem perizinan online", "Pembaruan & perpanjangan izin"],
        type: "featured",
        featuredLabel: "PRIORITAS",
        anchorId: "mod-perizinan",
        sortOrder: 2,
      },
      {
        icon: "Award",
        title: "Sertifikasi Badan Usaha (SBU)",
        description: "Pengurusan SBU konstruksi di LPJK untuk kontraktor, konsultan, dan spesialis.",
        features: ["SBU Kontraktor (Sipil, Arsitektur, ME)", "SBU Konsultan Perencana & Pengawas", "Grading & klasifikasi kualifikasi", "Renewal & upgrade SBU", "Integrasi data SIKI LPJK"],
        type: "featured",
        featuredLabel: "UNGGULAN",
        anchorId: "mod-sbu",
        sortOrder: 3,
      },
      {
        icon: "GraduationCap",
        title: "Sertifikasi Kompetensi (SKK)",
        description: "Pengurusan Sertifikat Kompetensi Kerja (SKK) untuk tenaga ahli dan tenaga terampil konstruksi.",
        features: ["SKK Tenaga Ahli (SKA)", "SKK Tenaga Terampil (SKT)", "Uji kompetensi LSP", "Perpanjangan & upgrade SKK", "Integrasi SIKI & portal LPJK"],
        type: "default",
        anchorId: "mod-skk",
        sortOrder: 4,
      },
      {
        icon: "FileText",
        title: "Dokumen Tender",
        description: "Generate dan review dokumen penawaran tender secara otomatis sesuai regulasi pengadaan.",
        features: ["Dokumen administrasi penawaran", "Spesifikasi teknis & metodologi", "Daftar kuantitas & harga (BOQ)", "RAB & analisis harga satuan", "Checklist kepatuhan Perpres 46/2025"],
        type: "featured",
        featuredLabel: "AI-POWERED",
        anchorId: "mod-tender",
        sortOrder: 5,
      },
      {
        icon: "FolderOpen",
        title: "Dokumen Proyek",
        description: "Penyiapan dan pengelolaan dokumen proyek dari kontrak hingga laporan akhir.",
        features: ["Kontrak kerja & addendum", "Berita acara kemajuan pekerjaan", "Laporan harian, mingguan, & bulanan", "As-built drawing & dokumen serah terima", "Klaim dan dokumen sengketa proyek"],
        type: "default",
        anchorId: "mod-proyek",
        sortOrder: 6,
      },
    ];
    for (const mod of modulesData) {
      await storage.createModule({ ...mod, isActive: true });
    }
  }

  // Seed User Roles — klien yang dilayani
  const existingRoles = await storage.getUserRoles();
  if (existingRoles.length === 0) {
    const rolesData = [
      { icon: "Building2", title: "BUJK / Kontraktor", subtitle: "Badan Usaha Jasa Konstruksi", sortOrder: 1 },
      { icon: "UserCheck", title: "Konsultan & Perencana", subtitle: "Pengawas & Perencana Proyek", sortOrder: 2 },
      { icon: "GraduationCap", title: "Tenaga Ahli", subtitle: "Profesional Bersertifikat", sortOrder: 3 },
      { icon: "Landmark", title: "Instansi Pemerintah", subtitle: "Owner & Pemberi Tugas", sortOrder: 4 },
      { icon: "Briefcase", title: "Developer / Swasta", subtitle: "Pengembang & Investor", sortOrder: 5 },
    ];
    for (const role of rolesData) {
      await storage.createUserRole({ ...role, isActive: true });
    }
  }

  // Seed Benefits
  const existingBenefits = await storage.getBenefits();
  if (existingBenefits.length === 0) {
    const benefitsData = [
      { text: "Tim konsultan berpengalaman di bidang hukum konstruksi & perizinan.", sortOrder: 1 },
      { text: "Proses terdigitalisasi — pantau status dokumen secara real-time.", sortOrder: 2 },
      { text: "Jaminan dokumen sesuai regulasi terbaru (UUJK, Perpres, Permen PUPR).", sortOrder: 3 },
      { text: "AI-powered: generate draft dokumen lebih cepat dengan OpenClaw.", sortOrder: 4 },
      { text: "Layanan end-to-end: dari pengumpulan data hingga dokumen jadi & terverifikasi.", sortOrder: 5 },
      { text: "Reminder otomatis masa berlaku sertifikat dan izin usaha.", sortOrder: 6 },
    ];
    for (const benefit of benefitsData) {
      await storage.createBenefit({ ...benefit, isActive: true });
    }
  }

  // Seed CTA Content
  const existingCta = await storage.getCtaContent();
  if (!existingCta) {
    await storage.createCtaContent({
      title: "Butuh Bantuan Dokumen Usaha Konstruksi?",
      subtitle: "Kami siap membantu dari legalitas, perizinan, SBU, SKK, hingga dokumen tender dan proyek. Konsultasi awal gratis.",
      primaryButtonText: "Mulai Konsultasi Gratis",
      secondaryButtonText: "Lihat Semua Layanan",
      isActive: true,
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed database on startup
  await seedDatabase();
  // Update hero background to local construction site image
  await storage.updateHeroBackgroundImage("/hero-bg.jpg");

  // Contact form
  app.post(api.contact.create.path, async (req, res) => {
    try {
      const input = api.contact.create.input.parse(req.body);
      const message = await storage.createContactMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Get all modules
  app.get(api.modules.list.path, async (req, res) => {
    const mods = await storage.getModules();
    res.json(mods);
  });

  // Get all user roles
  app.get(api.userRoles.list.path, async (req, res) => {
    const roles = await storage.getUserRoles();
    res.json(roles);
  });

  // Get all benefits
  app.get(api.benefits.list.path, async (req, res) => {
    const benefitsList = await storage.getBenefits();
    res.json(benefitsList);
  });

  // Get hero content
  app.get(api.hero.get.path, async (req, res) => {
    const hero = await storage.getHeroContent();
    res.json(hero);
  });

  // Get CTA content
  app.get(api.cta.get.path, async (req, res) => {
    const cta = await storage.getCtaContent();
    res.json(cta);
  });

  // Get all landing page content in one request
  app.get(api.landingContent.get.path, async (req, res) => {
    const [hero, mods, roles, benefitsList, cta] = await Promise.all([
      storage.getHeroContent(),
      storage.getModules(),
      storage.getUserRoles(),
      storage.getBenefits(),
      storage.getCtaContent(),
    ]);
    res.json({
      hero,
      modules: mods,
      userRoles: roles,
      benefits: benefitsList,
      cta,
    });
  });

  // GET /api/auth/whoami — returns the logged-in user's email & superadmin status
  app.get("/api/auth/whoami", isAuthenticated, (req: any, res) => {
    const email: string = (req.user?.claims?.email ?? "").toLowerCase();
    const username: string = req.user?.claims?.username ?? "";
    res.json({ email, username, isSuperAdmin: SUPERADMIN_EMAILS.has(email) });
  });

  // User Profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (err) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const existing = await storage.getUserProfile(userId);
      
      const data = insertUserProfileSchema.parse({ ...req.body, userId });
      
      if (existing) {
        const updated = await storage.updateUserProfile(userId, data);
        res.json(updated);
      } else {
        const profile = await storage.createUserProfile(data);
        res.status(201).json(profile);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // Opportunities routes
  app.get("/api/opportunities", async (req, res) => {
    const opps = await storage.getOpportunities();
    res.json(opps);
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const opp = await storage.getOpportunity(id);
    if (!opp) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.json(opp);
  });

  app.post("/api/opportunities", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertOpportunitySchema.parse({ ...req.body, postedBy: userId });
      const opp = await storage.createOpportunity(data);
      res.status(201).json(opp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create opportunity" });
    }
  });

  // Products/Marketplace routes
  app.get("/api/products", async (req, res) => {
    const prods = await storage.getProducts();
    res.json(prods);
  });

  app.get("/api/my-products", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const prods = await storage.getProductsByUser(userId);
    res.json(prods);
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertProductSchema.parse({ ...req.body, sellerId: userId });
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // Orders (Marketplace with Escrow)
  app.get("/api/my-orders", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const buyerOrders = await storage.getOrdersByBuyer(userId);
    const sellerOrders = await storage.getOrdersBySeller(userId);
    res.json({ buyerOrders, sellerOrders });
  });

  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId, quantity, shippingAddress, notes, paymentMethod } = req.body;
      
      // Validate product exists and get seller info
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (!product.isAvailable) {
        return res.status(400).json({ message: "Product is not available" });
      }
      if (product.sellerId === userId) {
        return res.status(400).json({ message: "Cannot order your own product" });
      }
      
      const totalPrice = product.price 
        ? (parseFloat(product.price.replace(/[^0-9]/g, "")) * (quantity || 1)).toString()
        : "0";
      
      const data = insertOrderSchema.parse({
        productId,
        buyerId: userId,
        sellerId: product.sellerId,
        quantity: quantity || 1,
        totalPrice,
        shippingAddress,
        notes,
        paymentMethod,
        status: "escrow", // Start with escrow - payment assumed successful
      });
      const order = await storage.createOrder(data);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const userId = req.user.claims.sub;
    const { status } = req.body;
    
    // Get existing order to check authorization
    const existingOrder = await storage.getOrder(id);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Authorization and valid transitions
    const isBuyer = existingOrder.buyerId === userId;
    const isSeller = existingOrder.sellerId === userId;
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }
    
    // Validate state transitions
    const currentStatus = existingOrder.status;
    const validTransitions: Record<string, { seller?: string[]; buyer?: string[] }> = {
      escrow: { seller: ["shipped"] },
      shipped: { seller: ["delivered"] },
      delivered: { buyer: ["completed"] },
    };
    
    const allowed = validTransitions[currentStatus || ""];
    if (!allowed) {
      return res.status(400).json({ message: "Order cannot be updated from current status" });
    }
    
    if (isSeller && allowed.seller?.includes(status)) {
      const order = await storage.updateOrderStatus(id, status, false);
      return res.json(order);
    }
    
    if (isBuyer && allowed.buyer?.includes(status)) {
      // Release escrow when buyer confirms
      const escrowReleased = status === "completed";
      const order = await storage.updateOrderStatus(id, status, escrowReleased);
      return res.json(order);
    }
    
    return res.status(400).json({ message: "Invalid status transition" });
  });

  // Tender Documents
  app.get("/api/tender-documents", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const docs = await storage.getTenderDocumentsByUser(userId);
    res.json(docs);
  });

  app.get("/api/tender-documents/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }
    const userId = req.user.claims.sub;
    const doc = await storage.getTenderDocument(id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }
    if (doc.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(doc);
  });

  app.post("/api/tender-documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertTenderDocumentSchema.parse({ ...req.body, userId });
      const doc = await storage.createTenderDocument(data);
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.post("/api/tender-documents/:id/generate", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }
    const userId = req.user.claims.sub;
    const doc = await storage.getTenderDocument(id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }
    if (doc.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Generate tender document content based on template
    const generatedContent = generateTenderContent(doc);
    const updated = await storage.updateTenderDocument(id, {
      generatedContent,
      status: "generated",
    });
    res.json(updated);
  });

  // Projects
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const projs = await storage.getProjectsByUser(userId);
    res.json(projs);
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    const userId = req.user.claims.sub;
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(project);
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    const userId = req.user.claims.sub;
    const existing = await storage.getProject(id);
    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const updated = await storage.updateProject(id, req.body);
    res.json(updated);
  });

  // Project Updates
  app.get("/api/projects/:id/updates", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    const userId = req.user.claims.sub;
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const updates = await storage.getProjectUpdates(id);
    res.json(updates);
  });

  app.post("/api/projects/:id/updates", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const userId = req.user.claims.sub;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const data = insertProjectUpdateSchema.parse({ ...req.body, projectId, userId });
      const update = await storage.createProjectUpdate(data);
      
      // Update project progress if progressDelta is provided
      if (data.progressDelta && data.progressDelta > 0) {
        const newProgress = Math.min(100, (project.progress || 0) + data.progressDelta);
        await storage.updateProject(projectId, { progress: newProgress });
      }
      
      res.status(201).json(update);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create update" });
    }
  });

  // Financial Transactions
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const txns = await storage.getTransactionsByUser(userId);
    res.json(txns);
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertTransactionSchema.parse({ ...req.body, userId });
      const txn = await storage.createTransaction(data);
      res.status(201).json(txn);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  const patchTransactionSchema = z.object({
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().int().positive().optional(),
    date: z.string().optional(),
    projectId: z.number().int().nullable().optional(),
    notes: z.string().nullable().optional(),
  });

  app.patch("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    const userId = req.user.claims.sub;
    const existing = await storage.getTransaction(id);
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    try {
      const parsed = patchTransactionSchema.parse(req.body);
      const updateData: any = { ...parsed };
      if (parsed.date !== undefined) {
        updateData.date = new Date(parsed.date);
      }
      const updated = await storage.updateTransaction(id, updateData);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    const userId = req.user.claims.sub;
    const existing = await storage.getTransaction(id);
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await storage.deleteTransaction(id);
    res.status(204).send();
  });

  // Equipment Rental
  app.get("/api/equipments", isAuthenticated, async (req: any, res) => {
    const eqs = await storage.getAllEquipments();
    res.json(eqs);
  });

  app.get("/api/equipments/mine", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const eqs = await storage.getEquipmentsByOwner(userId);
    res.json(eqs);
  });

  app.get("/api/equipments/:id", isAuthenticated, async (req: any, res) => {
    const eq = await storage.getEquipment(parseInt(req.params.id));
    if (!eq) return res.status(404).json({ message: "Equipment not found" });
    res.json(eq);
  });

  app.post("/api/equipments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertEquipmentSchema.parse({ ...req.body, ownerId: userId });
      const eq = await storage.createEquipment(data);
      res.status(201).json(eq);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });

  app.patch("/api/equipments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eq = await storage.getEquipment(parseInt(req.params.id));
      if (!eq) return res.status(404).json({ message: "Equipment not found" });
      if (eq.ownerId !== userId) return res.status(403).json({ message: "Unauthorized" });
      
      const allowedFields = ["name", "category", "brand", "model", "yearManufactured", "condition", "description", "dailyRate", "weeklyRate", "monthlyRate", "location", "specifications", "images", "availability"];
      const filteredBody: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) filteredBody[key] = req.body[key];
      }
      
      const updated = await storage.updateEquipment(parseInt(req.params.id), filteredBody);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update equipment" });
    }
  });

  // Equipment Rentals
  app.get("/api/rentals/mine", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const rentals = await storage.getRentalsByRenter(userId);
    res.json(rentals);
  });

  app.get("/api/rentals/owner", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const rentals = await storage.getRentalsByOwner(userId);
    res.json(rentals);
  });

  app.post("/api/rentals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eq = await storage.getEquipment(req.body.equipmentId);
      if (!eq) return res.status(404).json({ message: "Equipment not found" });
      if (eq.availability !== "available") return res.status(400).json({ message: "Equipment not available" });
      
      const data = insertEquipmentRentalSchema.parse({
        ...req.body,
        renterId: userId,
        ownerId: eq.ownerId,
      });
      const rental = await storage.createRental(data);
      res.status(201).json(rental);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create rental" });
    }
  });

  app.patch("/api/rentals/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rentalId = parseInt(req.params.id);
      
      const ownerRentals = await storage.getRentalsByOwner(userId);
      const renterRentals = await storage.getRentalsByRenter(userId);
      const allUserRentals = [...ownerRentals, ...renterRentals];
      const rental = allUserRentals.find(r => r.id === rentalId);
      
      if (!rental) {
        return res.status(403).json({ message: "Unauthorized - not your rental" });
      }
      
      const validStatuses = ["pending", "confirmed", "active", "completed", "cancelled"];
      if (!validStatuses.includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updated = await storage.updateRentalStatus(rentalId, req.body.status);
      if (!updated) return res.status(404).json({ message: "Rental not found" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update rental status" });
    }
  });

  // ─── CHAT AI (OpenAI GPT-4o) ─────────────────────────────────────────────────

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const CHAT_SYSTEM_PROMPT = `Anda adalah asisten AI dari **DokumenProyek.com** — platform layanan dokumen dan sertifikasi konstruksi Indonesia. Nama Anda adalah OpenClaw AI.

## Kepribadian & Gaya
- Ramah, profesional, dan to-the-point. Gunakan Bahasa Indonesia yang natural dan mudah dipahami.
- Jawab langsung pertanyaan inti tanpa basa-basi berlebihan.
- Gunakan format Markdown: **bold** untuk istilah penting, tabel untuk data terstruktur, bullet list untuk langkah-langkah.
- Jika ada informasi yang Anda tidak yakin, katakan dengan jujur dan sarankan konsultasi lebih lanjut.

## Spesialisasi Utama
Anda sangat paham tentang:
1. **SBU (Sertifikat Badan Usaha)** — 7 gred kualifikasi (K1–K3, M1–M2, B1–B2) sesuai Permen PU No. 6 Tahun 2025. Proses pengajuan via LSBU berlisensi LPJK, terintegrasi SIKI LPJK dan OSS.
2. **SKK (Sertifikat Kompetensi Kerja)** — menggantikan SKA dan SKT per SK Dirjen Bina Konstruksi No. 114 Tahun 2024. Jenjang 1–5 (terampil), 6–9 (ahli). Uji via LSP berlisensi LPJK.
3. **Legalitas Usaha** — Pendirian PT/CV, NIB via OSS-RBA (PP 28/2025), NPWP badan, akta notaris, pengesahan Kemenkumham.
4. **Perizinan Usaha** — SIUJK, IUJK Konstruksi, OSS-RBA, izin sektoral, Persetujuan Lingkungan (menggantikan Izin Lingkungan sejak UU Cipta Kerja 2020 + PP 22/2021).
5. **ISO & SMK3** — ISO 9001, 14001, 45001; SMK3 PP 50/2012; sertifikasi ISUQAR/UKAS/BVD/SGS.
6. **Dokumen Tender** — administrasi penawaran, BOQ, RAB, spesifikasi teknis, evaluasi sistem gugur/merit point, TKDN, LPSE/SPSE.
7. **Dokumen Proyek** — kontrak FIDIC/PUPR, addendum, force majeure, SPMK, berita acara kemajuan, as-built drawing, klaim.

## Regulasi Kunci (2024–2025)
- **Perpres 46/2025** (berlaku April 2025): menggantikan Perpres 16/2018 dan Perpres 12/2021. Batas Pengadaan Langsung konstruksi naik ke Rp 400 juta (non-konstruksi tetap Rp 200 juta).
- **Permen PU No. 6 Tahun 2025**: regulasi SBU terbaru, menggantikan Permen PUPR 8/2022.
- **PP 28/2025**: OSS-RBA terbaru untuk NIB dan perizinan berusaha.
- **SK Dirjen Bina Konstruksi No. 114/2024**: unifikasi SKA+SKT menjadi SKK.
- **UU Cipta Kerja + PP 22/2021**: Persetujuan Lingkungan menggantikan Izin Lingkungan.

## Kemampuan Draft Dokumen
Anda dapat membuat draft dokumen konstruksi siap pakai, antara lain:
- Surat Penawaran Harga, Pakta Integritas, RK3K
- SPMK (Surat Perintah Mulai Kerja), Addendum Kontrak
- Surat Kuasa Direktur, Berita Acara Serah Terima
- Laporan Harian/Mingguan/Bulanan Proyek
- Surat Pernyataan (tidak merangkap jabatan, dll)

Ketika diminta membuat draft, buatkan dokumen yang lengkap, profesional, dan siap disesuaikan — bukan sekadar outline.

## Batasan
- Untuk topik di luar konstruksi/bisnis/hukum Indonesia yang relevan, jelaskan bahwa Anda spesialis di bidang konstruksi dan sarankan sumber yang tepat.
- Jangan buat-buat angka atau regulasi yang tidak Anda ketahui dengan pasti.
- Jika ada perubahan regulasi yang Anda tidak yakin, sampaikan dengan jelas dan sarankan pengecekan ke sumber resmi (LPJK, LKPP, OSS, Kemenkumham).`;

  app.post("/api/chat", async (req: any, res) => {
    // Require authentication — unauthenticated users see a login prompt instead
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        message: "Silakan masuk terlebih dahulu untuk menggunakan fitur AI Chat.",
        errorCode: "auth_error",
      });
    }

    try {
      const { message, history = [] } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Pesan tidak boleh kosong" });
      }

      // Build message history for OpenAI (last 10 turns to stay within context)
      const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        ...recentHistory
          .filter((h: any) => h.role && h.content)
          .map((h: any) => ({
            role: h.role as "user" | "assistant",
            content: String(h.content),
          })),
        { role: "user", content: message.trim() },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || "Maaf, terjadi kesalahan. Silakan coba lagi.";

      res.json({
        reply,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Chat AI error:", err?.message || err);
      const status = err?.status || err?.response?.status;
      if (status === 429) {
        return res.status(503).json({ 
          message: "Layanan AI sedang sibuk atau kuota habis. Silakan coba beberapa saat lagi.",
          errorCode: "quota_exceeded"
        });
      }
      if (status === 401) {
        return res.status(503).json({ 
          message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.",
          errorCode: "config_error"
        });
      }
      res.status(500).json({ message: "Gagal memproses pesan", errorCode: "server_error" });
    }
  });

  // ─── CHAT HISTORY ────────────────────────────────────────────────────────────

  // Load latest session messages for authenticated user
  app.get("/api/chat/history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getLatestChatSession(userId);
      if (!session) {
        return res.json({ sessionId: null, messages: [] });
      }
      const msgs = await storage.getChatMessages(session.id);
      res.json({ sessionId: session.id, messages: msgs });
    } catch (err) {
      res.status(500).json({ message: "Failed to load chat history" });
    }
  });

  // List all chat sessions for authenticated user
  app.get("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessionsByUser(userId);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Failed to load sessions" });
    }
  });

  // Load messages for a specific session
  app.get("/api/chat/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getChatSession(id);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (session.userId !== userId) return res.status(403).json({ message: "Not authorized" });
      const msgs = await storage.getChatMessages(id);
      res.json({ sessionId: id, title: session.title, messages: msgs });
    } catch (err) {
      res.status(500).json({ message: "Failed to load session" });
    }
  });

  // Create a new chat session
  app.post("/api/chat/history/session", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title } = req.body;
      const session = await storage.createChatSession({
        userId,
        title: title || "Percakapan Baru",
      });
      res.status(201).json({ sessionId: session.id });
    } catch (err) {
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Rename a chat session
  app.patch("/api/chat/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getChatSession(id);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (session.userId !== userId) return res.status(403).json({ message: "Not authorized" });
      const { title } = req.body;
      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }
      const updated = await storage.updateChatSession(id, { title: title.trim() });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to rename session" });
    }
  });

  // Delete a chat session via the sessions/:id path
  app.delete("/api/chat/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getChatSession(id);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (session.userId !== userId) return res.status(403).json({ message: "Not authorized" });
      await storage.deleteChatSession(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Delete a chat session (and its messages via cascade)
  app.delete("/api/chat/history/session/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getChatSession(id);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (session.userId !== userId) return res.status(403).json({ message: "Not authorized" });
      await storage.deleteChatSession(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  // Append a message to a session
  app.post("/api/chat/history/message", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { sessionId, role, content } = req.body;
      if (!sessionId || !role || !content) {
        return res.status(400).json({ message: "sessionId, role, and content are required" });
      }
      // Verify the session exists and belongs to the authenticated user
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const msg = await storage.createChatMessage({ sessionId, role, content });
      res.status(201).json(msg);
    } catch (err) {
      res.status(500).json({ message: "Failed to save message" });
    }
  });

  // ─── CONSULTATIONS ──────────────────────────────────────────────────────────

  // Submit consultation request (public – works with or without login)
  app.post("/api/consultations", async (req: any, res) => {
    try {
      const { serviceType, name, email, phone, companyName, message } = req.body;
      if (!serviceType || !name || !email || !message) {
        return res.status(400).json({ message: "serviceType, name, email, dan message wajib diisi" });
      }
      const validServices = ["legalitas", "perizinan", "sbu", "skk", "iso-smk3", "tender", "proyek", "umum"];
      if (!validServices.includes(serviceType)) {
        return res.status(400).json({ message: "serviceType tidak valid" });
      }
      const userId = req.user?.claims?.sub || null;
      const c = await storage.createConsultation({ serviceType, name, email, phone: phone || null, companyName: companyName || null, message, userId, status: "pending", adminNotes: null });
      res.status(201).json(c);
    } catch (err) {
      res.status(500).json({ message: "Gagal menyimpan permintaan konsultasi" });
    }
  });

  // Get current user's consultations
  app.get("/api/consultations/mine", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const list = await storage.getConsultationsByUser(userId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat konsultasi" });
    }
  });

  // Get all consultations (admin)
  app.get("/api/consultations", isAuthenticated, async (req: any, res) => {
    try {
      const { serviceType } = req.query;
      const list = serviceType ? await storage.getConsultationsByService(serviceType as string) : await storage.getConsultations();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat konsultasi" });
    }
  });

  // Update consultation status
  app.patch("/api/consultations/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      const validStatuses = ["pending", "contacted", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(status)) return res.status(400).json({ message: "Status tidak valid" });
      const updated = await storage.updateConsultationStatus(id, status, adminNotes);
      if (!updated) return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Gagal update status konsultasi" });
    }
  });

  // ─── GENERATED DOCUMENTS ────────────────────────────────────────────────────

  app.get("/api/generated-docs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const docs = await storage.getGeneratedDocumentsByUser(userId);
      res.json(docs);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat dokumen" });
    }
  });

  app.get("/api/generated-docs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const doc = await storage.getGeneratedDocument(parseInt(req.params.id));
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      res.json(doc);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat dokumen" });
    }
  });

  app.post("/api/generated-docs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { templateId, templateName, kategori, formData, generatedContent } = req.body;
      if (!templateId || !templateName || !kategori || !generatedContent) {
        return res.status(400).json({ message: "templateId, templateName, kategori, dan generatedContent wajib diisi" });
      }
      const doc = await storage.createGeneratedDocument({
        userId, templateId, templateName, kategori,
        formData: typeof formData === "string" ? formData : JSON.stringify(formData || {}),
        generatedContent,
      });
      res.status(201).json(doc);
    } catch (err) {
      res.status(500).json({ message: "Gagal menyimpan dokumen" });
    }
  });

  app.delete("/api/generated-docs/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doc = await storage.getGeneratedDocument(parseInt(req.params.id));
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      if (doc.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });
      await storage.deleteGeneratedDocument(doc.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Gagal menghapus dokumen" });
    }
  });

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const list = await storage.getNotificationsByUser(userId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat notifikasi" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadCount(userId);
      res.json({ count });
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat jumlah notifikasi" });
    }
  });

  app.post("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, message, type, link } = req.body;
      if (!title || !message) return res.status(400).json({ message: "title dan message wajib diisi" });
      const n = await storage.createNotification({ userId, title, message, type: type || "info", isRead: false, link: link || null });
      res.status(201).json(n);
    } catch (err) {
      res.status(500).json({ message: "Gagal membuat notifikasi" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const updated = await storage.markNotificationRead(parseInt(req.params.id));
      if (!updated) return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Gagal update notifikasi" });
    }
  });

  app.patch("/api/notifications/read-all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Gagal update notifikasi" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteNotification(parseInt(req.params.id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Gagal menghapus notifikasi" });
    }
  });

  // ─── AGENT SESSIONS & MESSAGES ──────────────────────────────────────────────

  app.get("/api/agent-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getAgentSessionsByUser(userId);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat sesi" });
    }
  });

  app.post("/api/agent-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, activeAgents } = req.body;
      const session = await storage.createAgentSession({
        userId, title: title || "Sesi Konsultasi Baru",
        activeAgents: activeAgents || [],
        status: "active",
      });
      res.status(201).json(session);
    } catch (err) {
      res.status(500).json({ message: "Gagal membuat sesi" });
    }
  });

  app.patch("/api/agent-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getAgentSession(id);
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });
      const updated = await storage.updateAgentSession(id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Gagal update sesi" });
    }
  });

  app.delete("/api/agent-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getAgentSession(id);
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });
      await storage.deleteAgentSession(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Gagal menghapus sesi" });
    }
  });

  app.get("/api/agent-sessions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const session = await storage.getAgentSession(id);
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });
      const messages = await storage.getAgentMessages(id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat pesan" });
    }
  });

  app.post("/api/agent-sessions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.id);
      const session = await storage.getAgentSession(sessionId);
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });

      const { role, agentId, content } = req.body;
      if (!role || !content) return res.status(400).json({ message: "role dan content wajib diisi" });

      const msg = await storage.createAgentMessage({ sessionId, role, agentId: agentId || null, content });

      // Update session timestamp
      await storage.updateAgentSession(sessionId, { updatedAt: new Date() } as any);

      res.status(201).json(msg);
    } catch (err) {
      res.status(500).json({ message: "Gagal menyimpan pesan" });
    }
  });

  // ─── DOCUMENT VERIFICATIONS ──────────────────────────────────────────────────

  app.get("/api/verifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const list = await storage.getVerificationsByUser(userId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat verifikasi" });
    }
  });

  app.post("/api/verifications", async (req: any, res) => {
    try {
      const { documentType, documentNumber, holderName, issuerName, requestNotes } = req.body;
      if (!documentType || !documentNumber || !holderName) {
        return res.status(400).json({ message: "documentType, documentNumber, dan holderName wajib diisi" });
      }
      const validTypes = ["sbu", "skk", "nib", "npwp", "kontrak", "lainnya"];
      if (!validTypes.includes(documentType)) {
        return res.status(400).json({ message: "documentType tidak valid" });
      }
      const userId = req.user?.claims?.sub || null;
      const v = await storage.createVerification({
        documentType, documentNumber, holderName,
        issuerName: issuerName || null,
        requestNotes: requestNotes || null,
        userId,
        status: "pending",
        verificationResult: null,
      });

      // Auto-simulate verification after 2s (mock logic for now)
      setTimeout(async () => {
        const mockStatus = ["verified", "not_found", "expired"][Math.floor(Math.random() * 3)];
        const mockResults: Record<string, string> = {
          verified: `Dokumen ${documentType.toUpperCase()} No. ${documentNumber} VALID — terdaftar atas nama ${holderName}. Diterbitkan oleh ${issuerName || "Lembaga terkait"}.`,
          not_found: `Dokumen ${documentType.toUpperCase()} No. ${documentNumber} TIDAK DITEMUKAN dalam database. Pastikan nomor dokumen sudah benar.`,
          expired: `Dokumen ${documentType.toUpperCase()} No. ${documentNumber} KADALUARSA. Masa berlaku telah habis. Silakan perpanjang melalui layanan terkait.`,
        };
        await storage.updateVerificationStatus(v.id, mockStatus, mockResults[mockStatus]);
      }, 3000);

      res.status(201).json(v);
    } catch (err) {
      res.status(500).json({ message: "Gagal membuat permintaan verifikasi" });
    }
  });

  app.get("/api/verifications/:id", async (req: any, res) => {
    try {
      const v = await storage.getVerification(parseInt(req.params.id));
      if (!v) return res.status(404).json({ message: "Verifikasi tidak ditemukan" });
      res.json(v);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat verifikasi" });
    }
  });

  // ─── SAVED CALCULATIONS ──────────────────────────────────────────────────────

  app.get("/api/saved-calculations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const list = await storage.getSavedCalculationsByUser(userId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Gagal memuat kalkulasi" });
    }
  });

  app.post("/api/saved-calculations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { calcType, title, inputData, resultSummary } = req.body;
      if (!calcType || !title || !resultSummary) {
        return res.status(400).json({ message: "calcType, title, dan resultSummary wajib diisi" });
      }
      const calc = await storage.createSavedCalculation({
        userId, calcType, title, resultSummary,
        inputData: typeof inputData === "string" ? inputData : JSON.stringify(inputData || {}),
      });
      res.status(201).json(calc);
    } catch (err) {
      res.status(500).json({ message: "Gagal menyimpan kalkulasi" });
    }
  });

  app.delete("/api/saved-calculations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const calcs = await storage.getSavedCalculationsByUser(userId);
      const calc = calcs.find(c => c.id === parseInt(req.params.id));
      if (!calc) return res.status(404).json({ message: "Kalkulasi tidak ditemukan atau bukan milik Anda" });
      await storage.deleteSavedCalculation(calc.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Gagal menghapus kalkulasi" });
    }
  });

  // ─── BRAIN PROJECT ───────────────────────────────────────────────────────────

  app.post("/api/brain-project/:id/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return res.status(404).json({ message: "Proyek tidak ditemukan" });
      }

      const [updates, txns] = await Promise.all([
        storage.getProjectUpdates(projectId),
        storage.getTransactionsByProject(projectId),
      ]);

      // Prepare context
      const income  = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const balance = income - expense;

      const now = new Date();
      const end = project.endDate ? new Date(project.endDate) : null;
      const daysLeft = end ? Math.ceil((end.getTime() - now.getTime()) / 86400000) : null;

      const projectCtx = `
PROYEK: ${project.name}
Status: ${project.status} | Progress: ${project.progress}%
Klien: ${project.clientName || "-"} | Lokasi: ${project.location || "-"}
Nilai Kontrak: ${project.contractValue || "-"}
Mulai: ${project.startDate ? new Date(project.startDate).toLocaleDateString("id-ID") : "-"}
Selesai: ${project.endDate ? new Date(project.endDate).toLocaleDateString("id-ID") : "-"}${daysLeft !== null ? ` (${daysLeft > 0 ? daysLeft + " hari lagi" : "LEWAT " + Math.abs(daysLeft) + " hari"})` : ""}
Deskripsi: ${project.description || "-"}

KEUANGAN (${txns.length} transaksi):
- Total Pemasukan: Rp ${(income / 1_000_000).toFixed(1)} jt
- Total Pengeluaran: Rp ${(expense / 1_000_000).toFixed(1)} jt
- Saldo: Rp ${(balance / 1_000_000).toFixed(1)} jt ${balance < 0 ? "⚠️ DEFISIT" : ""}

UPDATE TERAKHIR (${updates.length} update):
${updates.slice(-5).map(u => `- [${u.updateType}] ${u.title}: ${u.description || ""} (+${u.progressDelta}%)`).join("\n") || "- Tidak ada update"}`.trim();

      const prompt = `Anda adalah Brain Project AI dari DokumenProyek.com (powered by Gustafta Framework) — sistem kecerdasan untuk proyek konstruksi Indonesia.

Analisis data proyek berikut dan hasilkan laporan intelijen komprehensif:

${projectCtx}

Buat laporan dalam Bahasa Indonesia dengan format markdown berikut:

## 🏥 Kesimpulan Kesehatan Proyek
(2-3 kalimat ringkas kondisi proyek saat ini)

## ⚠️ Identifikasi Risiko
(daftar risiko spesifik berdasarkan data — waktu, biaya, progres, dll)

## 📊 Analisis Keuangan
(evaluasi kondisi cash flow, rasio pengeluaran vs nilai kontrak jika ada)

## 📈 Analisis Progres
(evaluasi kecepatan progres vs waktu tersisa, prediksi keterlambatan jika ada)

## 🎯 Rekomendasi Tindak Lanjut
(5 langkah konkret dan actionable yang harus dilakukan segera)

## 🔮 Proyeksi 30 Hari ke Depan
(prediksi kondisi proyek 30 hari ke depan jika tidak ada perubahan)

Di akhir analisis, berikan juga dua nilai dalam format YAML di dalam blok kode:
\`\`\`yaml
health_score: <angka 0-100>
risk_level: <low|medium|high|critical>
summary: <1 kalimat ringkasan untuk eksekutif>
\`\`\``;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const raw = completion.choices[0]?.message?.content || "";

      // Parse YAML block
      let healthScore = 70, riskLevel = "medium", summary = "Proyek dalam kondisi normal.";
      const yamlMatch = raw.match(/```yaml\s*([\s\S]*?)```/);
      if (yamlMatch) {
        const yaml = yamlMatch[1];
        const hs = yaml.match(/health_score:\s*(\d+)/);
        const rl = yaml.match(/risk_level:\s*(low|medium|high|critical)/);
        const sm = yaml.match(/summary:\s*(.+)/);
        if (hs) healthScore = Math.min(100, Math.max(0, parseInt(hs[1])));
        if (rl) riskLevel = rl[1];
        if (sm) summary = sm[1].trim();
      }

      // Strip YAML block from analysis shown to user
      const analysis = raw.replace(/```yaml[\s\S]*?```/g, "").trim();

      res.json({
        project,
        analysis,
        healthScore,
        riskLevel,
        summary,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal menganalisis proyek", errorCode: "server_error" });
    }
  });

  // ─── BUSINESS MEMORY ─────────────────────────────────────────────────────────

  // List all memories for authenticated user
  app.get("/api/memory", isAuthenticated, async (req: any, res) => {
    try {
      const memories = await storage.getBusinessMemoryByUser(req.user.claims.sub);
      res.json(memories);
    } catch { res.status(500).json({ message: "Gagal memuat memory" }); }
  });

  // Create memory entry
  app.post("/api/memory", isAuthenticated, async (req: any, res) => {
    try {
      const { category, title, description, tags, eventDate, isActive } = req.body;
      if (!category || !title?.trim() || !description?.trim()) {
        return res.status(400).json({ message: "category, title, dan description wajib diisi" });
      }
      const entry = await storage.createBusinessMemory({
        userId: req.user.claims.sub,
        category,
        title: title.trim(),
        description: description.trim(),
        tags: tags ?? null,
        isActive: isActive !== false,
        eventDate: eventDate ? new Date(eventDate) : null,
      });
      res.status(201).json(entry);
    } catch { res.status(500).json({ message: "Gagal menyimpan memory" }); }
  });

  // Update memory entry
  app.patch("/api/memory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const existing = await storage.getBusinessMemory(id);
      if (!existing || existing.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Memory tidak ditemukan" });
      }
      const { category, title, description, tags, eventDate, isActive } = req.body;
      const updated = await storage.updateBusinessMemory(id, {
        ...(category !== undefined && { category }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(tags !== undefined && { tags }),
        ...(eventDate !== undefined && { eventDate: eventDate ? new Date(eventDate) : null }),
        ...(isActive !== undefined && { isActive }),
      });
      res.json(updated);
    } catch { res.status(500).json({ message: "Gagal memperbarui memory" }); }
  });

  // Delete memory entry
  app.delete("/api/memory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const existing = await storage.getBusinessMemory(id);
      if (!existing || existing.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Memory tidak ditemukan" });
      }
      await storage.deleteBusinessMemory(id);
      res.json({ success: true });
    } catch { res.status(500).json({ message: "Gagal menghapus memory" }); }
  });

  // ─── KLINIK KONSULTASI ───────────────────────────────────────────────────────

  const KLINIK_SYSTEM_PROMPT = (serviceType: string, caseTitle: string, caseDesc: string, analysis?: string, memoryContext?: string) => {
    const serviceGuides: Record<string, string> = {
      sbu: `Anda ahli SBU (Sertifikat Badan Usaha) konstruksi Indonesia. Keahlian: PP 28/2025, Permen PU 6/2025, 6 gred kualifikasi (K1/K2/M1/M2/B1/B2), proses LPJK, dokumen persyaratan per gred, PNBP, masa berlaku, renewal.`,
      skk: `Anda ahli SKK (Sertifikat Kompetensi Kerja) konstruksi Indonesia. Keahlian: SKK Tenaga Ahli (Muda/Madya/Utama) dan Terampil (Kelas 1/2/3), uji kompetensi LSP, portofolio kompetensi, SIKI LPJK, masa berlaku 5 tahun.`,
      legalitas: `Anda ahli legalitas badan usaha Indonesia. Keahlian: pendirian PT/CV/Firma, akta notaris, pengesahan Kemenkumham, NIB OSS, NPWP Badan, perubahan anggaran dasar, dokumen perizinan dasar.`,
      perizinan: `Anda ahli perizinan usaha Indonesia. Keahlian: OSS-RBA PP 28/2025, SIUJK, IUJK, izin lingkungan, AMDAL, 4 level risiko (Rendah/Menengah Rendah/Menengah Tinggi/Tinggi), KBLI, persyaratan per level.`,
      iso: `Anda ahli ISO dan SMK3 untuk sektor konstruksi Indonesia. Keahlian: ISO 9001:2015, ISO 14001, OHSAS 18001/ISO 45001, SMK3 PP 50/2012, sertifikasi, audit, implementasi sistem manajemen.`,
      tender: `Anda ahli dokumen tender konstruksi Indonesia. Keahlian: Perpres 46/2025, LKPP, LPSE, dokumen penawaran (administrasi/teknis/harga), BOQ, AHSP, RK3K, metode pelaksanaan, jaminan penawaran.`,
      proyek: `Anda ahli dokumen proyek konstruksi Indonesia. Keahlian: kontrak kerja, SPMK, berita acara, laporan harian/mingguan/bulanan, addendum, PHO/FHO, klaim, dokumen serah terima.`,
      umum: `Anda konsultan ahli layanan dokumen dan legalitas usaha konstruksi Indonesia dari DokumenProyek.com. Powered by Gustafta Framework.`,
    };

    return `${serviceGuides[serviceType] || serviceGuides.umum}

Anda sedang menangani kasus konsultasi:
- Judul: ${caseTitle}
- Layanan: ${serviceType.toUpperCase()}
- Deskripsi klien: ${caseDesc || "(belum diisi)"}
${analysis ? `- Analisis sebelumnya: ${analysis.slice(0, 500)}...` : ""}
${memoryContext ? `\n## ⚠️ Business Memory Klien (Riwayat & Pola Risiko)\n${memoryContext}\nPerhatikan memory di atas! Jika ada risiko yang berulang, WAJIB sebutkan sebagai peringatan proaktif di awal jawaban Anda.` : ""}

Panduan:
- Jawab dalam Bahasa Indonesia, profesional tapi mudah dipahami
- Berikan informasi yang spesifik, bukan jawaban umum
- Jika butuh info tambahan dari klien, tanyakan dengan spesifik
- Selalu akhiri dengan langkah konkret yang bisa dilakukan klien
- DokumenProyek.com bisa membantu mengurus semua prosesnya`;
  };

  const ANALYSIS_PROMPT = (serviceType: string, title: string, desc: string, memoryContext?: string) => {
    const focus: Record<string, string> = {
      sbu: "gap dokumen untuk mendapatkan SBU, gred yang sesuai, persyaratan SDM & modal, estimasi waktu & biaya PNBP",
      skk: "level SKK yang tepat, dokumen portofolio yang dibutuhkan, skema uji kompetensi, estimasi waktu",
      legalitas: "struktur badan usaha yang tepat, dokumen yang harus disiapkan, urutan proses, estimasi biaya notaris & PNBP",
      perizinan: "level risiko OSS-RBA yang berlaku, KBLI yang sesuai, dokumen wajib per level, tahapan proses",
      iso: "standar ISO yang relevan, gap analysis awal, tahapan implementasi & sertifikasi, estimasi biaya & waktu",
      tender: "kelengkapan dokumen penawaran, checklist persyaratan Perpres 46/2025, risiko gugur administrasi",
      proyek: "dokumen proyek yang harus disiapkan, template yang dibutuhkan, risiko administrasi proyek",
      umum: "identifikasi kebutuhan utama, layanan yang relevan, prioritas tindakan",
    };

    return `Anda konsultan ahli DokumenProyek.com (powered by Gustafta Framework). Lakukan analisis kasus konsultasi berikut:

Judul: ${title}
Layanan: ${serviceType.toUpperCase()}
Deskripsi: ${desc || "(klien belum memberikan deskripsi detail)"}
${memoryContext ? `\nRIWAYAT BISNIS KLIEN (Business Memory):\n${memoryContext}\n` : ""}
Buat analisis terstruktur dalam Bahasa Indonesia dengan format markdown:
${memoryContext ? `
## 🧠 Peringatan Berdasarkan Riwayat Bisnis
(Berdasarkan Business Memory klien, sebutkan risiko atau pola yang perlu diwaspadai secara spesifik)
` : ""}
## 📋 Ringkasan Kebutuhan
(2-3 kalimat tentang apa yang dibutuhkan klien)

## ✅ Dokumen & Persyaratan Utama
(daftar poin — fokus pada: ${focus[serviceType] || focus.umum})

## ⚠️ Potensi Kendala
(risiko atau hal yang perlu diwaspadai)

## 📅 Estimasi Proses
(waktu dan tahapan yang realistis)

## 🎯 Langkah Pertama yang Harus Dilakukan
(3-5 langkah konkret dan actionable)

Buat analisis yang spesifik dan langsung berguna, bukan generik.`;
  };

  // List cases
  app.get("/api/klinik/cases", isAuthenticated, async (req: any, res) => {
    try {
      const cases = await storage.getConsultationCasesByUser(req.user.claims.sub);
      res.json(cases);
    } catch { res.status(500).json({ message: "Gagal memuat kasus" }); }
  });

  // Create case
  app.post("/api/klinik/cases", isAuthenticated, async (req: any, res) => {
    try {
      const { title, serviceType, description, priority } = req.body;
      if (!title || !serviceType) return res.status(400).json({ message: "title dan serviceType wajib diisi" });
      const kasus = await storage.createConsultationCase({
        userId: req.user.claims.sub, title, serviceType,
        description: description || null, priority: priority || "normal", status: "open",
      });
      res.status(201).json(kasus);
    } catch { res.status(500).json({ message: "Gagal membuat kasus" }); }
  });

  // Get case
  app.get("/api/klinik/cases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const kasus = await storage.getConsultationCase(parseInt(req.params.id));
      if (!kasus || kasus.userId !== req.user.claims.sub) return res.status(404).json({ message: "Kasus tidak ditemukan" });
      res.json(kasus);
    } catch { res.status(500).json({ message: "Gagal memuat kasus" }); }
  });

  // Delete case
  app.delete("/api/klinik/cases/:id", isAuthenticated, async (req: any, res) => {
    try {
      const kasus = await storage.getConsultationCase(parseInt(req.params.id));
      if (!kasus || kasus.userId !== req.user.claims.sub) return res.status(404).json({ message: "Kasus tidak ditemukan" });
      await storage.deleteConsultationCase(kasus.id);
      res.json({ success: true });
    } catch { res.status(500).json({ message: "Gagal menghapus kasus" }); }
  });

  // AI Analysis
  app.post("/api/klinik/cases/:id/analyze", async (req: any, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        message: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
        errorCode: "auth_error",
      });
    }
    try {
      const kasus = await storage.getConsultationCase(parseInt(req.params.id));
      if (!kasus || kasus.userId !== req.user.claims.sub) return res.status(404).json({ message: "Kasus tidak ditemukan" });

      await storage.updateConsultationCase(kasus.id, { status: "analyzing" });

      // Fetch active business memory for this user
      const memories = await storage.getBusinessMemoryByUser(req.user.claims.sub, true);
      let memoryContext: string | undefined;
      if (memories.length > 0) {
        memoryContext = memories.slice(0, 8).map(m =>
          `- [${m.category}] ${m.title}: ${m.description.slice(0, 200)}`
        ).join("\n");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: ANALYSIS_PROMPT(kasus.serviceType, kasus.title, kasus.description || "", memoryContext) }],
        max_tokens: 1800, temperature: 0.4,
      });

      const analysis = completion.choices[0]?.message?.content || "Analisis tidak tersedia.";
      const updated = await storage.updateConsultationCase(kasus.id, { aiAnalysis: analysis, status: "open" });
      res.json(updated);
    } catch (err: any) {
      await storage.updateConsultationCase(parseInt(req.params.id), { status: "open" }).catch(() => {});
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal menganalisis kasus", errorCode: "server_error" });
    }
  });

  // Get messages
  app.get("/api/klinik/cases/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const kasus = await storage.getConsultationCase(parseInt(req.params.id));
      if (!kasus || kasus.userId !== req.user.claims.sub) return res.status(404).json({ message: "Kasus tidak ditemukan" });
      const messages = await storage.getCaseMessages(kasus.id);
      res.json(messages);
    } catch { res.status(500).json({ message: "Gagal memuat pesan" }); }
  });

  // Send message + AI reply
  app.post("/api/klinik/cases/:id/messages", async (req: any, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        message: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
        errorCode: "auth_error",
      });
    }
    try {
      const { message } = req.body;
      if (!message?.trim()) return res.status(400).json({ message: "Pesan tidak boleh kosong" });

      const kasus = await storage.getConsultationCase(parseInt(req.params.id));
      if (!kasus || kasus.userId !== req.user.claims.sub) return res.status(404).json({ message: "Kasus tidak ditemukan" });

      // Save user message
      const userMessage = await storage.createCaseMessage({ caseId: kasus.id, role: "user", content: message.trim() });

      // Build history (last 10 messages)
      const history = await storage.getCaseMessages(kasus.id);
      const recentHistory = history.slice(-11, -1); // exclude the one we just added

      // Fetch active business memory for contextual warnings
      const memories = await storage.getBusinessMemoryByUser(req.user.claims.sub, true);
      let memoryContext: string | undefined;
      if (memories.length > 0) {
        memoryContext = memories.slice(0, 8).map(m =>
          `- [${m.category}] ${m.title}: ${m.description.slice(0, 200)}`
        ).join("\n");
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: KLINIK_SYSTEM_PROMPT(kasus.serviceType, kasus.title, kasus.description || "", kasus.aiAnalysis || "", memoryContext) },
          ...recentHistory.map(m => ({ role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant", content: m.content })),
          { role: "user", content: message.trim() },
        ],
        max_tokens: 1500, temperature: 0.6,
      });

      const reply = completion.choices[0]?.message?.content || "Maaf, tidak dapat memproses pesan ini.";
      const aiMessage = await storage.createCaseMessage({ caseId: kasus.id, role: "ai", content: reply });

      res.json({ userMessage, aiMessage });
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal memproses pesan", errorCode: "server_error" });
    }
  });

  // ─── AI DOKUMEN QUERY ────────────────────────────────────────────────────────

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  });

  // Upload & extract document
  app.post("/api/ai-dokumen/upload",
    async (req: any, res, next) => {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
          message: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
          errorCode: "auth_error",
        });
      }
      next();
    },
    upload.single("file"),
    async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Tidak ada file yang diupload" });

      const { mimetype, originalname, buffer, size } = req.file;
      const fallbackName = (req.body.name || originalname.replace(/\.[^.]+$/, "")).slice(0, 200);

      let contentText = "";

      if (mimetype === "application/pdf") {
        const data = await pdfParse(buffer);
        contentText = data.text || "";
      } else if (
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimetype === "application/msword"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        contentText = result.value || "";
      } else if (mimetype === "text/plain") {
        contentText = buffer.toString("utf-8");
      } else {
        return res.status(400).json({ message: "Format file tidak didukung. Gunakan PDF, DOCX, atau TXT." });
      }

      if (!contentText.trim()) {
        return res.status(422).json({ message: "Tidak dapat mengekstrak teks dari dokumen ini. Pastikan dokumen tidak berupa gambar scan." });
      }

      // Truncate to ~100k chars to stay within DB/context limits
      if (contentText.length > 100_000) contentText = contentText.slice(0, 100_000);

      // AI-generate a descriptive name from the first 500 chars of content.
      // Helper: truncate at the last word boundary to avoid mid-word cuts.
      const truncateAtWord = (text: string, maxLen: number): string => {
        if (text.length <= maxLen) return text;
        const cut = text.slice(0, maxLen);
        const lastSpace = cut.lastIndexOf(" ");
        // Only snap to word boundary when it doesn't shorten too aggressively
        return lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace).trimEnd() : cut.trimEnd();
      };

      let name = fallbackName;
      let uploadPhase: "ai_named" | "fallback_named" = "fallback_named";
      try {
        const openai = new OpenAI();
        const snippet = contentText.slice(0, 500).replace(/\s+/g, " ").trim();

        // Very short documents — not enough content for meaningful AI naming
        if (snippet.length >= 50) {
          const aiResp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: `Berikan judul singkat dan deskriptif (maksimal 60 karakter, dalam Bahasa Indonesia) untuk dokumen berikut.\n\nAbaikan header umum atau boilerplate seperti "PENDAHULUAN", "BAB I", nomor halaman, atau kata-kata generik saja. Fokus pada topik utama dokumen.\n\nJika isi terlalu umum atau tidak dapat ditentukan topiknya, balas dengan: ${fallbackName}\n\nIsi dokumen:\n"${snippet}"\n\nBalas hanya dengan judul, tanpa tanda kutip, tanpa penjelasan.`,
              },
            ],
            max_tokens: 40,
            temperature: 0.3,
          });
          const rawName = aiResp.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") ?? "";
          const aiName = truncateAtWord(rawName, 60);
          if (aiName && aiName.length > 3) {
            name = aiName;
            uploadPhase = "ai_named";
          }
        }
      } catch (aiErr) {
        // Fallback to filename-derived name — non-fatal
        console.warn("AI naming failed, using fallback:", aiErr);
      }

      const userId = req.user.claims.sub;
      const doc = await storage.createProjectDocument({
        userId,
        name,
        originalFilename: originalname,
        mimeType: mimetype,
        fileSize: size,
        contentText,
      });

      // Return without contentText (it can be large); include uploadPhase so
      // clients know which naming path was taken ("ai_named" | "fallback_named").
      const { contentText: _ct, ...docMeta } = doc as any;
      res.json({ ...docMeta, uploadPhase });
    } catch (err: any) {
      console.error("AI Dokumen upload error:", err);
      res.status(500).json({ message: err.message || "Gagal memproses dokumen" });
    }
  });

  // Upload with SSE phase streaming — clients receive phase events in real time:
  //   data: {"phase":"extracting"}
  //   data: {"phase":"naming"}
  //   data: {"phase":"done","doc":{...}}
  // This allows the UI to show "Memberi nama dokumen..." before the response finishes.
  app.post("/api/ai-dokumen/upload-stream",
    async (req: any, res, next) => {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({
          message: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
          errorCode: "auth_error",
        });
      }
      next();
    },
    upload.single("file"),
    async (req: any, res) => {
      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const sendEvent = (data: object) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        if (!req.file) {
          sendEvent({ phase: "error", message: "Tidak ada file yang diupload" });
          return res.end();
        }

        const { mimetype, originalname, buffer, size } = req.file;
        const fallbackName = (req.body.name || originalname.replace(/\.[^.]+$/, "")).slice(0, 200);

        let contentText = "";

        sendEvent({ phase: "extracting" });

        if (mimetype === "application/pdf") {
          const data = await pdfParse(buffer);
          contentText = data.text || "";
        } else if (
          mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          mimetype === "application/msword"
        ) {
          const result = await mammoth.extractRawText({ buffer });
          contentText = result.value || "";
        } else if (mimetype === "text/plain") {
          contentText = buffer.toString("utf-8");
        } else {
          sendEvent({ phase: "error", message: "Format file tidak didukung. Gunakan PDF, DOCX, atau TXT." });
          return res.end();
        }

        if (!contentText.trim()) {
          sendEvent({ phase: "error", message: "Tidak dapat mengekstrak teks dari dokumen ini. Pastikan dokumen tidak berupa gambar scan." });
          return res.end();
        }

        if (contentText.length > 100_000) contentText = contentText.slice(0, 100_000);

        const truncateAtWord = (text: string, maxLen: number): string => {
          if (text.length <= maxLen) return text;
          const cut = text.slice(0, maxLen);
          const lastSpace = cut.lastIndexOf(" ");
          return lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace).trimEnd() : cut.trimEnd();
        };

        let name = fallbackName;
        let uploadPhase: "ai_named" | "fallback_named" = "fallback_named";

        const snippet = contentText.slice(0, 500).replace(/\s+/g, " ").trim();
        if (snippet.length >= 50) {
          sendEvent({ phase: "naming" });
          try {
            const openai = new OpenAI();
            const aiResp = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content: `Berikan judul singkat dan deskriptif (maksimal 60 karakter, dalam Bahasa Indonesia) untuk dokumen berikut.\n\nAbaikan header umum atau boilerplate seperti "PENDAHULUAN", "BAB I", nomor halaman, atau kata-kata generik saja. Fokus pada topik utama dokumen.\n\nJika isi terlalu umum atau tidak dapat ditentukan topiknya, balas dengan: ${fallbackName}\n\nIsi dokumen:\n"${snippet}"\n\nBalas hanya dengan judul, tanpa tanda kutip, tanpa penjelasan.`,
                },
              ],
              max_tokens: 40,
              temperature: 0.3,
            });
            const rawName = aiResp.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") ?? "";
            const aiName = truncateAtWord(rawName, 60);
            if (aiName && aiName.length > 3) {
              name = aiName;
              uploadPhase = "ai_named";
            }
          } catch (aiErr) {
            console.warn("AI naming failed in stream endpoint, using fallback:", aiErr);
          }
        }

        const userId = req.user.claims.sub;
        const doc = await storage.createProjectDocument({
          userId,
          name,
          originalFilename: originalname,
          mimeType: mimetype,
          fileSize: size,
          contentText,
        });

        const { contentText: _ct, ...docMeta } = doc as any;
        sendEvent({ phase: "done", doc: { ...docMeta, uploadPhase } });
        res.end();
      } catch (err: any) {
        console.error("AI Dokumen upload-stream error:", err);
        sendEvent({ phase: "error", message: err.message || "Gagal memproses dokumen" });
        res.end();
      }
    }
  );

  // Rename a document
  app.patch("/api/ai-dokumen/documents/:id/name", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid document ID" });
      const userId = req.user.claims.sub;
      const doc = await storage.getProjectDocument(id, userId);
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      const newName = (req.body.name || "").toString().trim().slice(0, 200);
      if (!newName) return res.status(400).json({ message: "Nama tidak boleh kosong" });
      const updated = await storage.updateProjectDocumentName(id, userId, newName);
      const { contentText: _ct, ...docMeta } = updated as any;
      res.json(docMeta);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "Gagal mengganti nama dokumen" });
    }
  });

  // List documents for user (without contentText)
  app.get("/api/ai-dokumen/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const docs = await storage.getProjectDocumentsByUser(userId);
      res.json(docs);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil daftar dokumen" });
    }
  });

  // Delete document
  app.delete("/api/ai-dokumen/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const doc = await storage.getProjectDocument(id, userId);
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      await storage.deleteProjectDocument(id, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Gagal menghapus dokumen" });
    }
  });

  // Get chat history for a document
  app.get("/api/ai-dokumen/documents/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const doc = await storage.getProjectDocument(id, userId);
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      const msgs = await storage.getDocumentChatMessages(id);
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil riwayat chat" });
    }
  });

  // Clear chat history for a document
  app.delete("/api/ai-dokumen/documents/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const doc = await storage.getProjectDocument(id, userId);
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      await storage.clearDocumentChatMessages(id, userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Gagal membersihkan riwayat chat" });
    }
  });

  // Auto-summarize document (cached — only calls AI if summaryText is empty)
  // Pass ?force=true to bypass the cache and regenerate
  app.post("/api/ai-dokumen/documents/:id/summarize", async (req: any, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        message: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
        errorCode: "auth_error",
      });
    }
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid document ID" });

      const userId = req.user.claims.sub;
      const doc = await storage.getProjectDocument(id, userId);
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });

      const force = req.query.force === "true";

      // If force=true, clear the cached summary first
      if (force && doc.summaryText) {
        await storage.clearProjectDocumentSummary(id);
      }

      // Return cached summary if it exists (and not forcing)
      if (!force && doc.summaryText) {
        return res.json({ summary: doc.summaryText, cached: true });
      }

      // Generate summary with AI
      const maxContent = 50_000;
      const content = doc.contentText.length > maxContent
        ? doc.contentText.slice(0, maxContent) + "\n\n[... konten terpotong ...]"
        : doc.contentText;

      const openai = new OpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Anda adalah asisten AI yang merangkum dokumen konstruksi dan bisnis Indonesia secara singkat dan informatif.`,
          },
          {
            role: "user",
            content: `Buat ringkasan dokumen berikut dalam 3-5 poin utama menggunakan format bullet point (•).
Setiap poin harus singkat (1-2 kalimat), padat, dan informatif.
Tulis dalam Bahasa Indonesia.
Jangan tambahkan judul atau kata pembuka — langsung mulai dengan bullet point pertama.

Dokumen: "${doc.name}"

Isi dokumen:
---
${content}
---`,
          },
        ],
        max_tokens: 600,
        temperature: 0.3,
      });

      const summary = completion.choices[0]?.message?.content?.trim() || "";

      // Cache the summary in the database
      if (summary) {
        await storage.updateProjectDocumentSummary(id, summary);
      }

      res.json({ summary, cached: false });
    } catch (err: any) {
      console.error("AI Dokumen summarize error:", err);
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba beberapa saat lagi.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal membuat ringkasan", errorCode: "server_error" });
    }
  });

  // Query document with AI
  app.post("/api/ai-dokumen/query", async (req: any, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        message: "Silakan masuk terlebih dahulu untuk menggunakan fitur ini.",
        errorCode: "auth_error",
      });
    }
    try {
      const { documentId, message } = req.body;
      if (!documentId || !message) return res.status(400).json({ message: "documentId dan message diperlukan" });

      const userId = req.user.claims.sub;
      const doc = await storage.getProjectDocument(parseInt(documentId), userId);
      if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });

      // Truncate content if very long to fit context window
      const maxContent = 50_000;
      const content = doc.contentText.length > maxContent
        ? doc.contentText.slice(0, maxContent) + "\n\n[... konten terpotong karena terlalu panjang ...]"
        : doc.contentText;

      const systemPrompt = `Anda adalah asisten AI yang membantu menganalisis dokumen konstruksi dan bisnis Indonesia.

Anda sedang menganalisis dokumen berjudul: "${doc.name}"
Nama file asli: ${doc.originalFilename}

Berikut adalah isi lengkap dokumen:
---
${content}
---

Panduan menjawab:
- Jawab berdasarkan isi dokumen di atas, bukan dari pengetahuan umum Anda
- Jika informasi tidak ada dalam dokumen, katakan dengan jelas: "Informasi ini tidak ditemukan dalam dokumen"
- Gunakan format yang rapi dan mudah dibaca (poin-poin, tabel, atau paragraf sesuai konteks)
- Jawab dalam Bahasa Indonesia
- Jika ada angka, tanggal, atau nama penting, kutip langsung dari dokumen`;

      // Load recent conversation history (last 10 turns = 20 messages) so AI can continue context
      const MAX_HISTORY_TURNS = 10;
      const allHistory = await storage.getDocumentChatMessages(parseInt(documentId));
      const recentHistory = allHistory.slice(-MAX_HISTORY_TURNS * 2); // last N turns

      const historyMessages = recentHistory.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: message.trim() },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const reply = completion.choices[0]?.message?.content || "Maaf, tidak dapat memproses pertanyaan ini.";

      // Persist both messages to database (sequentially to preserve order)
      await storage.createDocumentChatMessage({ documentId: parseInt(documentId), userId, role: "user", content: message.trim() });
      await storage.createDocumentChatMessage({ documentId: parseInt(documentId), userId, role: "assistant", content: reply });

      // Prune oldest messages so total stays under 200 per document
      await storage.pruneDocumentChatMessages(parseInt(documentId), 200);

      res.json({ reply, timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.error("AI Dokumen query error:", err);
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba beberapa saat lagi.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal memproses pertanyaan", errorCode: "server_error" });
    }
  });

  // ─── BIMTEK SKK ──────────────────────────────────────────────────────────────

  app.post("/api/bimtek-skk/tutor", isAuthenticated, async (req: any, res) => {
    try {
      const { message, context, history } = req.body;
      if (!message) return res.status(400).json({ message: "Pesan tidak boleh kosong" });

      const { skkName = "", level = "", kodeBidang = "" } = context || {};

      const systemPrompt = `Anda adalah AI Tutor SKK (Sertifikat Kompetensi Kerja) konstruksi Indonesia dari DokumenProyek.com, powered by Gustafta Framework.

Spesialisasi Anda saat ini: **${skkName} — Level ${level} (Kode ${kodeBidang})**

Keahlian Anda mencakup:
- Persyaratan SKK berdasarkan PP 28/2025 dan SK Dirjen Bina Konstruksi No. 114/2024
- Standar kompetensi KKNI (Kerangka Kualifikasi Nasional Indonesia) level 1-9
- Proses sertifikasi melalui LSP terakreditasi BNSP dan LPJK
- Penyusunan portofolio kompetensi yang memenuhi standar
- Materi teknis sesuai bidang SKK yang dipilih
- SIKI LPJK, masa berlaku 5 tahun, dan proses perpanjangan

Panduan menjawab:
- Jawab dalam Bahasa Indonesia, formal namun mudah dipahami
- Berikan informasi spesifik dan praktis, bukan generik
- Sertakan referensi regulasi bila relevan
- Jika ditanya soal teknis, berikan jawaban komprehensif sesuai standar kompetensi
- Selalu akhiri dengan langkah konkret yang bisa diambil peserta`;

      const msgs: any[] = [
        { role: "system", content: systemPrompt },
        ...(Array.isArray(history) ? history.map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })) : []),
        { role: "user", content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: msgs,
        max_tokens: 1200,
        temperature: 0.5,
      });

      const reply = completion.choices[0]?.message?.content || "Maaf, tidak dapat memproses pertanyaan ini.";
      res.json({ reply });
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal memproses pertanyaan", errorCode: "server_error" });
    }
  });

  // ─── EKOSISTEM KOMPETENSI ────────────────────────────────────────────────────

  app.get("/api/kompetensi", isAuthenticated, async (req: any, res) => {
    try {
      const items = await storage.getCompetenciesByUser(req.user.claims.sub);
      res.json(items);
    } catch { res.status(500).json({ message: "Gagal memuat kompetensi" }); }
  });

  app.post("/api/kompetensi", isAuthenticated, async (req: any, res) => {
    try {
      const { type, name, ...rest } = req.body;
      if (!type || !name) return res.status(400).json({ message: "type dan name wajib diisi" });
      const item = await storage.createCompetency({ userId: req.user.claims.sub, type, name, ...rest });
      res.status(201).json(item);
    } catch { res.status(500).json({ message: "Gagal menyimpan kompetensi" }); }
  });

  app.patch("/api/kompetensi/:id", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.getCompetency(parseInt(req.params.id));
      if (!item || item.userId !== req.user.claims.sub) return res.status(404).json({ message: "Tidak ditemukan" });
      const updated = await storage.updateCompetency(item.id, req.body);
      res.json(updated);
    } catch { res.status(500).json({ message: "Gagal memperbarui kompetensi" }); }
  });

  app.delete("/api/kompetensi/:id", isAuthenticated, async (req: any, res) => {
    try {
      const item = await storage.getCompetency(parseInt(req.params.id));
      if (!item || item.userId !== req.user.claims.sub) return res.status(404).json({ message: "Tidak ditemukan" });
      await storage.deleteCompetency(item.id);
      res.json({ success: true });
    } catch { res.status(500).json({ message: "Gagal menghapus kompetensi" }); }
  });

  app.post("/api/kompetensi/gap-analysis", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getCompetenciesByUser(userId);
      if (items.length === 0) return res.status(400).json({ message: "Belum ada kompetensi untuk dianalisis" });

      const now = new Date();
      const list = items.map(c => {
        const expDays = c.expiryDate ? Math.ceil((new Date(c.expiryDate).getTime() - now.getTime()) / 86400000) : null;
        return `- [${c.type.toUpperCase()}] ${c.name}${c.level ? ` — ${c.level}` : ""}${c.subclassification ? ` (${c.subclassification})` : ""}${c.issuer ? ` | Penerbit: ${c.issuer}` : ""}${expDays !== null ? ` | Berakhir: ${expDays > 0 ? expDays + " hari lagi" : "KADALUARSA " + Math.abs(expDays) + " hari lalu"}` : ""}`;
      }).join("\n");

      const prompt = `Anda adalah konsultan kompetensi konstruksi Indonesia dari DokumenProyek.com (powered by Gustafta Framework).

Berikut portofolio kompetensi/sertifikat yang dimiliki pengguna:
${list}

Buat analisis gap kompetensi dalam Bahasa Indonesia dengan format berikut:

## 📊 Ringkasan Portofolio
(evaluasi singkat kelengkapan dan kekuatan portofolio saat ini)

## ⚠️ Perhatian Segera
(sertifikat yang kadaluarsa atau hampir habis, tindakan yang harus diambil)

## 🎯 Gap & Peluang Upgrade
(kompetensi yang bisa ditingkatkan ke level berikutnya, potensi nilai tambah bisnis)

## 📚 Rekomendasi Pengembangan
(3-5 langkah konkret: pelatihan, uji kompetensi, atau sertifikasi baru yang relevan)

## 💡 Strategi Jangka Panjang
(roadmap 1-2 tahun untuk memaksimalkan nilai kompetensi di pasar konstruksi Indonesia)

Berikan analisis yang spesifik berdasarkan data yang ada, bukan generik.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200, temperature: 0.4,
      });

      const analysis = completion.choices[0]?.message?.content || "";
      res.json({ analysis, generatedAt: new Date().toISOString() });
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal menjalankan gap analysis", errorCode: "server_error" });
    }
  });

  // ─── EXEC. SUMMARY ───────────────────────────────────────────────────────────

  app.post("/api/exec-summary", isAuthenticated, async (req: any, res) => {
    try {
      const { sourceType, sourceId } = req.body;
      if (!sourceType || !sourceId) return res.status(400).json({ message: "sourceType dan sourceId wajib diisi" });

      const userId = req.user.claims.sub;
      let context = "";
      let title = "";

      if (sourceType === "project") {
        const project = await storage.getProject(parseInt(sourceId));
        if (!project || project.userId !== userId) return res.status(404).json({ message: "Proyek tidak ditemukan" });

        const [updates, txns] = await Promise.all([
          storage.getProjectUpdates(project.id),
          storage.getTransactionsByProject(project.id),
        ]);

        const income  = txns.filter(t => t.type === "income").reduce((s, t)  => s + t.amount, 0);
        const expense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        const now = new Date();
        const end = project.endDate ? new Date(project.endDate) : null;
        const daysLeft = end ? Math.ceil((end.getTime() - now.getTime()) / 86400000) : null;

        title = project.name;
        context = `
PROYEK: ${project.name}
Klien: ${project.clientName || "-"} | Lokasi: ${project.location || "-"}
Nilai Kontrak: ${project.contractValue || "-"}
Status: ${project.status} | Progress: ${project.progress}%
Tenggat: ${project.endDate ? new Date(project.endDate).toLocaleDateString("id-ID") : "-"}${daysLeft !== null ? ` (${daysLeft > 0 ? daysLeft + " hari lagi" : "LEWAT " + Math.abs(daysLeft) + " hari"})` : ""}
Deskripsi: ${project.description || "-"}

Keuangan:
- Pemasukan: Rp ${(income / 1_000_000).toFixed(1)} jt | Pengeluaran: Rp ${(expense / 1_000_000).toFixed(1)} jt | Saldo: Rp ${((income - expense) / 1_000_000).toFixed(1)} jt

Update Terbaru (${updates.length} total):
${updates.slice(-5).map(u => `- [${u.updateType}] ${u.title}: ${u.description || ""}`).join("\n") || "Tidak ada update"}`.trim();

      } else if (sourceType === "document") {
        const doc = await storage.getProjectDocument(parseInt(sourceId), userId);
        if (!doc) return res.status(404).json({ message: "Dokumen tidak ditemukan" });

        title = doc.name;
        const content = (doc.contentText || "").slice(0, 3000);
        context = `
DOKUMEN: ${doc.name}
File: ${doc.originalFilename} | Tipe: ${doc.mimeType}
Tanggal Upload: ${new Date(doc.createdAt).toLocaleDateString("id-ID")}

ISI DOKUMEN (ringkasan awal):
${content}`.trim();
      } else {
        return res.status(400).json({ message: "sourceType tidak valid" });
      }

      const prompt = `Anda adalah asisten eksekutif dari DokumenProyek.com (powered by Gustafta Framework).

Buat **Ringkasan Eksekutif** profesional berdasarkan data berikut:

${context}

Format output dalam Bahasa Indonesia yang formal dan profesional, menggunakan markdown:

---

# RINGKASAN EKSEKUTIF
**${title}**
*Disiapkan oleh DokumenProyek.com · Powered by Gustafta Framework*
*${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}*

---

## 1. Latar Belakang
(1-2 paragraf — konteks dan tujuan utama)

## 2. Status Terkini
(poin-poin status kondisi saat ini, progres, dan pencapaian kunci)

## 3. Isu Utama & Risiko
(maksimal 4 isu paling kritis yang perlu perhatian)

## 4. Rekomendasi
(3-5 tindakan strategis yang direkomendasikan)

## 5. Langkah Selanjutnya
(timeline dan action items konkret 30 hari ke depan)

---
*Dokumen ini bersifat ringkasan dan dihasilkan secara otomatis oleh sistem AI DokumenProyek.com*

---

Buat ringkasan yang padat, akurat, dan langsung bisa digunakan untuk presentasi ke pemangku kepentingan. Jangan tambahkan informasi yang tidak ada di data.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const summary = completion.choices[0]?.message?.content || "";
      res.json({ summary, generatedAt: new Date().toISOString(), title });

    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 429) return res.status(503).json({ message: "Layanan AI sedang sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (status === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal generate ringkasan eksekutif", errorCode: "server_error" });
    }
  });

  // ─── TENDERA CLAW ─────────────────────────────────────────────────────────────
  app.post("/api/tendera-claw/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { stage, input, previousResults, draftType } = req.body;
      const prompts: Record<number, string> = {
        1: `Anda adalah analis tender konstruksi berpengalaman dari DokumenProyek.com.

Analisis kelayakan tender berikut dan berikan laporan go/no-go:

**Data Tender:**
- Nama Proyek: ${input.namaProyek}
- Nilai HPS: Rp ${input.nilaiHPS}
- Instansi: ${input.instansi}
- Jenis: ${input.jenisTender}
- Batas Waktu: ${input.batasWaktu || "Tidak disebutkan"}
- Persyaratan: ${input.persyaratan || "Tidak disebutkan"}

Berikan analisis dengan format:
## Ringkasan Kelayakan
**Rekomendasi:** [GO / NO-GO / CONDITIONAL GO]

## Analisis Persyaratan
(cek kesesuaian persyaratan dengan profil kontraktor umum)

## Estimasi Kompetisi
(perkiraan jumlah peserta dan tingkat persaingan)

## Risiko Utama
(3-5 risiko kritis)

## Peluang Keunggulan
(apa yang bisa membedakan penawaran ini)`,

        2: `Berdasarkan data tender dan analisis kelayakan berikut, susun strategi penawaran:

**Data Tender:** ${input.namaProyek} — HPS Rp ${input.nilaiHPS} — ${input.instansi}
**Analisis Kelayakan:** ${previousResults?.[1]?.substring(0, 500)}...

## Strategi Harga
(positioning harga optimal vs HPS, pertimbangan margin)

## Diferensiasi Teknis
(keunggulan teknis yang perlu ditonjolkan)

## Tim & Personil Inti
(profil tim yang perlu disiapkan sesuai persyaratan)

## Strategi Dokumen
(dokumen kunci yang harus sempurna)

## Timeline Persiapan
(jadwal mundur dari batas waktu penawaran)`,

        3: `Buat draft dokumen tender berikut untuk proyek: ${input.namaProyek} — Instansi: ${input.instansi} — HPS: Rp ${input.nilaiHPS}

Jenis draft: **${draftType}**

Buat draft yang lengkap, profesional, dan siap diadaptasi. Gunakan format yang sesuai standar dokumen pengadaan pemerintah Indonesia.`,
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompts[stage] }],
        max_tokens: 1500,
        temperature: 0.4,
      });
      res.json({ result: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal menganalisis tender", errorCode: "server_error" });
    }
  });

  // ─── LEXCOM HUKUM ─────────────────────────────────────────────────────────────
  app.post("/api/lexcom/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message, history = [] } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `Anda adalah LexCom, AI asisten hukum konstruksi dari DokumenProyek.com powered by Gustafta Framework.

Keahlian Anda:
- Hukum kontrak konstruksi (FIDIC, SSUK Perpres 16/2018)
- Regulasi pengadaan: Perpres 16/2018, Perpres 46/2025, PP 22/2020
- UUJK No. 2/2017 dan perubahannya (PP 14/2021)
- Sengketa konstruksi: klaim, denda, pemutusan kontrak
- SBU, SKK, perizinan badan usaha jasa konstruksi

Selalu jawab dalam Bahasa Indonesia, gunakan referensi pasal/regulasi yang spesifik. Tambahkan disclaimer bahwa informasi bersifat edukatif bukan nasihat hukum profesional.` },
          ...history.map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
          { role: "user", content: message },
        ],
        max_tokens: 1200, temperature: 0.3,
      });
      res.json({ reply: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal memproses pertanyaan", errorCode: "server_error" });
    }
  });

  // ─── WORKROOM ─────────────────────────────────────────────────────────────────
  app.get("/api/workroom", isAuthenticated, async (req: any, res) => {
    try {
      const rooms = await storage.getWorkroomsByUser(req.user.id);
      res.json(rooms);
    } catch { res.status(500).json({ message: "Gagal memuat workroom" }); }
  });

  app.post("/api/workroom", isAuthenticated, async (req: any, res) => {
    try {
      const { name, type } = req.body;
      if (!name || !type) return res.status(400).json({ message: "Nama dan tipe wajib diisi" });
      const room = await storage.createWorkroom({ userId: req.user.id, name, type, currentStage: 0, status: "active", stageData: "{}" });
      res.json(room);
    } catch { res.status(500).json({ message: "Gagal membuat workroom" }); }
  });

  app.patch("/api/workroom/:id", isAuthenticated, async (req: any, res) => {
    try {
      const room = await storage.getWorkroom(Number(req.params.id));
      if (!room || room.userId !== req.user.id) return res.status(404).json({ message: "Tidak ditemukan" });
      const updated = await storage.updateWorkroom(room.id, req.body);
      res.json(updated);
    } catch { res.status(500).json({ message: "Gagal memperbarui workroom" }); }
  });

  app.delete("/api/workroom/:id", isAuthenticated, async (req: any, res) => {
    try {
      const room = await storage.getWorkroom(Number(req.params.id));
      if (!room || room.userId !== req.user.id) return res.status(404).json({ message: "Tidak ditemukan" });
      await storage.deleteWorkroom(room.id);
      res.json({ success: true });
    } catch { res.status(500).json({ message: "Gagal menghapus workroom" }); }
  });

  app.post("/api/workroom/ai-assist", isAuthenticated, async (req: any, res) => {
    try {
      const { roomType, roomName, stageIdx } = req.body;
      const stageGuides: Record<string, string[]> = {
        tender:      ["Analisis kelayakan dan persyaratan tender","Susun strategi penawaran dan diferensiasi","[GERBANG PERSETUJUAN]","Panduan finalisasi dan pengiriman dokumen"],
        perizinan:   ["Identifikasi semua izin yang dibutuhkan","Panduan persiapan dokumen per izin","[GERBANG PERSETUJUAN]","Langkah pengajuan ke instansi terkait"],
        sertifikasi: ["Gap analysis persyaratan sertifikasi","Checklist persiapan berkas lengkap","[GERBANG PERSETUJUAN]","Panduan pendaftaran dan jadwal uji kompetensi"],
        k3:          ["Identifikasi bahaya dan penilaian risiko","Panduan penyusunan RK3K","[GERBANG PERSETUJUAN]","Checklist implementasi K3 di lapangan"],
        sbu:         ["Cek persyaratan SBU untuk kualifikasi yang ditargetkan","Checklist dokumen SBU yang perlu disiapkan","[GERBANG PERSETUJUAN]","Panduan pengajuan ke LPJK via OSS"],
      };
      const stages = stageGuides[roomType] || stageGuides.tender;
      const prompt = `Anda adalah AI asisten DokumenProyek.com. Berikan panduan praktis untuk tahap berikut dalam workroom "${roomName}":

Tipe workroom: ${roomType}
Tahap saat ini (${stageIdx + 1}): ${stages[stageIdx]}

Berikan panduan terstruktur, spesifik, dan actionable untuk tahap ini. Sertakan checklist atau langkah konkret.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000, temperature: 0.4,
      });
      res.json({ result: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal memuat AI assist", errorCode: "server_error" });
    }
  });

  // ─── SBU CLAW ─────────────────────────────────────────────────────────────────
  app.post("/api/sbu-claw/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { stage, input, previousResults } = req.body;
      const prompts: Record<number, string> = {
        1: `Anda adalah konsultan SBU konstruksi Indonesia berpengalaman.

**Data Perusahaan:**
- Nama: ${input.namaPerusahaan}
- Jenis Usaha: ${input.jenisUsaha}
- Kualifikasi Target: ${input.kualifikasi}
- Subklasifikasi: ${input.subklasifikasi}
- NPWP: ${input.npwp || "Belum diisi"}
- Pengalaman: ${input.pengalaman || "Belum diisi"}
- Kendala: ${input.kendala || "Tidak ada"}

Berikan laporan cek kelengkapan SBU:

## Status Kelengkapan
(GO / PERLU PERLENGKAPAN / TIDAK MEMENUHI SYARAT)

## Dokumen Wajib (sesuai Permen PU 6/2025)
(checklist ✅/❌ per dokumen berdasarkan info yang diberikan)

## Gap yang Harus Dipenuhi
(hal-hal yang masih kurang)

## Estimasi Waktu Proses
(estimasi realistis proses SBU dari persiapan sampai terbit)`,

        2: `Berdasarkan analisis berikut, susun strategi pengajuan SBU:
${previousResults?.[1]?.substring(0, 600)}

## Strategi Pengajuan
(pendekatan terbaik: langsung, melalui asosiasi, atau konsultan SBU)

## Prioritas Persiapan
(urutan dokumen yang harus diselesaikan duluan)

## Tips Mempercepat Proses
(cara agar proses tidak terhambat di LPJK)

## Biaya Estimasi
(estimasi biaya resmi + biaya pendampingan jika diperlukan)`,

        3: `Buat draft surat permohonan SBU untuk:
Perusahaan: ${input.namaPerusahaan}
Jenis Usaha: ${input.jenisUsaha}
Kualifikasi: ${input.kualifikasi}
Subklasifikasi: ${input.subklasifikasi}

Buat surat permohonan SBU yang resmi, lengkap sesuai format LPJK, siap diadaptasi.`,
      };

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompts[stage] }],
        max_tokens: 1400, temperature: 0.4,
      });
      res.json({ result: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal menganalisis SBU", errorCode: "server_error" });
    }
  });

  // ─── PIPELINE SESSIONS (TenderaClaw & SBUClaw persistence) ────────────────────

  // List sessions for current user
  app.get("/api/pipeline-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query;
      const sessions = await storage.getPipelineSessionsByUser(userId, type as string | undefined);
      res.json(sessions);
    } catch {
      res.status(500).json({ message: "Gagal memuat riwayat sesi" });
    }
  });

  // Get a single session
  app.get("/api/pipeline-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getPipelineSession(id);
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });
      res.json(session);
    } catch {
      res.status(500).json({ message: "Gagal memuat sesi" });
    }
  });

  // Create a new session
  app.post("/api/pipeline-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { pipelineType, title, stage, inputData, results, draftType } = req.body;
      if (!pipelineType || !title) return res.status(400).json({ message: "pipelineType dan title wajib diisi" });
      const session = await storage.createPipelineSession({
        userId,
        pipelineType,
        title,
        stage: stage ?? 0,
        inputData: typeof inputData === "string" ? inputData : JSON.stringify(inputData ?? {}),
        results: typeof results === "string" ? results : JSON.stringify(results ?? {}),
        draftType: draftType || null,
      });
      // Prune old sessions — keep only the 10 most recent per user + pipeline type
      await storage.prunePipelineSessions(userId, pipelineType, 10);
      res.status(201).json(session);
    } catch {
      res.status(500).json({ message: "Gagal menyimpan sesi" });
    }
  });

  // Update an existing session
  app.patch("/api/pipeline-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getPipelineSession(id);
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });
      const { stage, inputData, results, draftType, title } = req.body;
      const updated = await storage.updatePipelineSession(id, {
        ...(title !== undefined ? { title } : {}),
        ...(stage !== undefined ? { stage } : {}),
        ...(draftType !== undefined ? { draftType } : {}),
        ...(inputData !== undefined ? { inputData: typeof inputData === "string" ? inputData : JSON.stringify(inputData) } : {}),
        ...(results !== undefined ? { results: typeof results === "string" ? results : JSON.stringify(results) } : {}),
      });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Gagal memperbarui sesi" });
    }
  });

  // Delete a session
  app.delete("/api/pipeline-sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getPipelineSession(id);
      if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.userId !== userId) return res.status(403).json({ message: "Tidak diizinkan" });
      await storage.deletePipelineSession(id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Gagal menghapus sesi" });
    }
  });

  // ─── KOMPETENSI HUB ───────────────────────────────────────────────────────────
  app.post("/api/kompetensi-hub/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { type, currentSKKs, targetRole, yearsExp, education } = req.body;
      const skkList = currentSKKs?.filter((s: any) => s.name).map((s: any) => `${s.name} (${s.level})`).join(", ") || "Belum ada";
      const prompt = type === "gap"
        ? `Anda adalah konsultan kompetensi konstruksi. Lakukan gap analysis:

**Profil:**
- Pendidikan: ${education}
- Pengalaman: ${yearsExp || "Tidak disebutkan"} tahun
- SKK Dimiliki: ${skkList}
- Target Jabatan: ${targetRole}

## Gap Analysis
(bandingkan profil saat ini vs persyaratan target jabatan)

## SKK yang Harus Ditambah
(daftar SKK yang diperlukan beserta level dan prioritasnya)

## Kompetensi Non-SKK yang Perlu Dikembangkan
(soft skill, sertifikasi lain, pengalaman proyek)

## Estimasi Waktu untuk Mencapai Target
(realistis berdasarkan gap yang ada)`
        : `Buat roadmap SKK personal:

**Profil:**
- Pendidikan: ${education} | Pengalaman: ${yearsExp || "?"} tahun
- SKK Dimiliki: ${skkList}
- Target Jabatan: ${targetRole}

## Roadmap 1 Tahun Pertama
(SKK/sertifikasi yang paling kritis untuk segera dikejar)

## Roadmap 2-3 Tahun
(pengembangan ke level berikutnya)

## Roadmap Jangka Panjang (5 tahun)
(visi karir dan posisi strategis)

## Langkah Konkret Minggu Ini
(3 aksi nyata yang bisa dimulai segera)`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200, temperature: 0.4,
      });
      res.json({ result: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal menganalisis kompetensi", errorCode: "server_error" });
    }
  });

  app.post("/api/kompetensi-hub/mock-question", isAuthenticated, async (req: any, res) => {
    try {
      const { skkName, level } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: `Buat SATU soal uji kompetensi untuk SKK ${skkName} level ${level} sesuai standar BNSP/LPJK. Soal harus spesifik, teknis, dan relevan. Hanya tulis soalnya saja tanpa jawaban.` }],
        max_tokens: 300, temperature: 0.8,
      });
      res.json({ question: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal membuat soal", errorCode: "server_error" });
    }
  });

  app.post("/api/kompetensi-hub/mock-feedback", isAuthenticated, async (req: any, res) => {
    try {
      const { skkName, level, question, answer } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: `Anda adalah asesor BNSP untuk SKK ${skkName} level ${level}. Evaluasi jawaban berikut:

Soal: ${question}
Jawaban Asesi: ${answer}

Berikan feedback dengan format:
## Penilaian
**Keputusan:** [KOMPETEN / BELUM KOMPETEN]

## Kekuatan Jawaban
(apa yang sudah benar)

## Kekurangan
(apa yang masih kurang atau perlu diperdalam)

## Jawaban Ideal
(tambahkan poin-poin penting yang seharusnya ada)` }],
        max_tokens: 800, temperature: 0.3,
      });
      res.json({ feedback: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal membuat feedback", errorCode: "server_error" });
    }
  });

  // ─── ASKOM COACH ─────────────────────────────────────────────────────────────
  app.post("/api/askom/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message, history = [] } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `Anda adalah ASKOM Coach, AI pendamping asesor kompetensi dari DokumenProyek.com powered by Gustafta Framework.

Keahlian Anda:
- Metodologi asesmen kompetensi BNSP (Badan Nasional Sertifikasi Profesi)
- Penyusunan instrumen asesmen: soal tertulis, observasi, wawancara, portofolio
- SKKNI (Standar Kompetensi Kerja Nasional Indonesia) bidang konstruksi
- Skema sertifikasi LSP dan proses asesmen
- Teknik pengambilan keputusan asesmen (kompeten/belum kompeten)
- Pelaporan dan dokumentasi hasil asesmen
- Banding dan tindak lanjut asesmen

Jawab dalam Bahasa Indonesia, gunakan terminologi BNSP yang tepat. Berikan panduan praktis yang dapat langsung diterapkan asesor.` },
          ...history.map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
          { role: "user", content: message },
        ],
        max_tokens: 1200, temperature: 0.3,
      });
      res.json({ reply: completion.choices[0]?.message?.content || "" });
    } catch (err: any) {
      const s = err?.status || err?.response?.status;
      if (s === 429) return res.status(503).json({ message: "Layanan AI sibuk. Coba lagi sebentar.", errorCode: "quota_exceeded" });
      if (s === 401) return res.status(503).json({ message: "Konfigurasi layanan AI tidak valid. Hubungi administrator.", errorCode: "config_error" });
      res.status(500).json({ message: "Gagal memproses pertanyaan", errorCode: "server_error" });
    }
  });

  // ─── MultiClaw Intelligence Hub ────────────────────────────────────────────
  // Team configs
  const MULTICLAW_TEAMS: Record<string, { name: string; description: string; systemPrompt: string }> = {
    "sbu-skk": {
      name: "Tim Monitoring SBU & SKK",
      description: "Monitor sertifikat SBU dan SKK yang akan habis masa berlakunya dari LPJK, BNSP, LSP, dan asosiasi profesi",
      systemPrompt: `Kamu adalah agen spesialis monitoring SBU & SKK di platform DokumenProyek.com (engine: Gustafta / OpenClaw).

Sumber data yang dipantau:
- lpjk.pu.go.id & siki.lpjk.net (database resmi SBU & SKK)
- bnsp.go.id (Badan Nasional Sertifikasi Profesi)
- Portal LSP terakreditasi: LSP Konstruksi, LSP Teknisi, LSP Gapensi, LSP Inkindo
- sijk.pu.go.id (Sistem Informasi Jasa Konstruksi)
- oss.go.id (data KBLI dan NIB terkait SBU)
- Portal asosiasi: GAPENSI, GAPEKSINDO, INKINDO, ASPEKINDO, HIMPERRA, ASNKGI, GAPANSI
- pu.go.id, Permen PUPR terbaru
- Portal daerah: Dinas PUPR Provinsi/Kabupaten/Kota
- Media industri: konstruksi.co.id, properti.bisnis.com, kontan.co.id/konstruksi
- mediakonstruksi.id, konstruksimedia.com, mediasipil.myr.id (portal berita & analisis konstruksi Indonesia)
- binakonstruksi.pu.go.id (Ditjen Bina Konstruksi PUPR — regulasi kompetensi, akreditasi LSP, program pembinaan)
- indokontraktor.com (direktori & forum kontraktor Indonesia)

Fokus monitoring:
1. SBU yang habis/akan habis dalam 30 hari → urgency: high
2. SBU yang habis dalam 31–90 hari → urgency: medium
3. SKK Tenaga Ahli (jenjang 7-9) yang akan kedaluwarsa
4. SKK Tenaga Terampil yang akan kedaluwarsa
5. Perubahan regulasi terbaru (Permen PUPR, Perpres, SE LPJK)
6. BUJK yang SBU-nya sudah expired tapi belum perpanjang
7. Perubahan klasifikasi atau kualifikasi SBU dari LPJK
8. Update persyaratan SKK baru dari BNSP atau LSP terkait

Berikan 10-14 temuan realistis dalam format JSON:
{
  "summary": "ringkasan 1-2 kalimat kondisi SBU/SKK periode ini",
  "findings": [
    {
      "title": "judul temuan",
      "description": "deskripsi detail termasuk sumber data dan rekomendasi tindakan",
      "urgency": "high|medium|low|info",
      "category": "SBU Kedaluwarsa|SKK Kedaluwarsa|Regulasi Baru|BUJK Mati|LSP Update|Asosiasi",
      "entityName": "nama perusahaan/individu/lembaga",
      "entityCode": "nomor SBU/SKK/IUJK",
      "expiryDate": "tanggal kadaluarsa (DD MMM YYYY)",
      "sourceUrl": "https://lpjk.pu.go.id atau sumber terkait"
    }
  ]
}
Tanggal hari ini: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}.`,
    },
    "bujk": {
      name: "Tim Monitoring BUJK & Ekosistem Industri",
      description: "Monitor status, perubahan, dan dinamika BUJK dari LPJK, OSS, Kemenkumham, BUMN, dan asosiasi industri",
      systemPrompt: `Kamu adalah agen spesialis monitoring BUJK dan ekosistem industri konstruksi Indonesia di DokumenProyek.com.

Sumber data yang dipantau:
- lpjk.pu.go.id (database BUJK resmi)
- oss.go.id & ahu.go.id (data badan usaha, perubahan akta, kepemilikan)
- kemenkumham.go.id (pengesahan PT, perubahan anggaran dasar)
- bpkp.go.id (audit dan pengawasan BUJK)
- kpk.go.id (daftar hitam perusahaan konstruksi)
- inaproc.go.id (daftar hitam pengadaan pemerintah)
- Portal asosiasi: GAPENSI, GAPEKSINDO, INKINDO, ASPEKINDO, HIMPERRA, ASNKGI, Perkindo, APNATEL
- kadin.id (Kamar Dagang dan Industri)
- apindo.or.id (Asosiasi Pengusaha Indonesia)
- Portal media bisnis: bisnis.com, kontan.co.id, katadata.co.id, detikfinance
- Portal BUMN: pertamina.com, pln.co.id, hutamakarya.com, pp-properti.co.id, adhi.co.id, waskita.co.id
- mediakonstruksi.id, konstruksimedia.com (berita & laporan dinamika industri konstruksi)
- indokontraktor.com (direktori kontraktor, profil perusahaan, rekam jejak proyek)
- binakonstruksi.pu.go.id (kebijakan pembinaan jasa konstruksi, akreditasi asosiasi, data BUJK binaan)

Fokus monitoring:
1. BUJK baru yang terdaftar minggu ini (kualifikasi Menengah ke atas)
2. BUJK yang naik atau turun kualifikasi/klasifikasi
3. BUJK Asing (BUJKA) baru yang masuk pasar Indonesia
4. BUJK yang terancam pembekuan, pencabutan izin, atau masuk daftar hitam
5. Perubahan direktur, penanggung jawab teknik, atau struktur kepemilikan
6. BUJK yang merger, akuisisi, atau bubar
7. BUJK BUMN dan anak perusahaan yang membuka divisi konstruksi baru
8. Tren pertumbuhan BUJK per sektor dan per wilayah
9. BUJK yang menang proyek besar (indikasi kapasitas dan track record)

Berikan 10-14 temuan realistis dalam format JSON:
{
  "summary": "ringkasan monitoring BUJK dan dinamika industri periode ini",
  "findings": [
    {
      "title": "judul temuan",
      "description": "detail lengkap termasuk implikasi bisnis dan sumber data",
      "urgency": "high|medium|low|info",
      "category": "BUJK Baru|BUJK Naik Kelas|BUJKA|Daftar Hitam|Perubahan Struktur|BUMN|Merger/Akuisisi|Tren Industri",
      "entityName": "nama BUJK",
      "entityCode": "nomor IUJK/NIB",
      "expiryDate": "tanggal terkait jika ada",
      "sourceUrl": "https://lpjk.go.id atau sumber terkait"
    }
  ]
}
Tanggal hari ini: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}.`,
    },
    "tender": {
      name: "Tim Tender & Peluang Proyek",
      description: "Monitor peluang proyek dari tender pemerintah, KPBU, BUMN, REI, platform renovasi, dan marketplace konstruksi swasta",
      systemPrompt: `Kamu adalah agen spesialis monitoring peluang proyek dan tender konstruksi Indonesia di DokumenProyek.com.

Sumber data yang dipantau — PEMERINTAH:
- lpse.pu.go.id dan seluruh LPSE daerah (kabupaten/kota/provinsi)
- inaproc.go.id (Sistem Pengadaan Nasional)
- sirup.go.id (Sistem Informasi Rencana Umum Pengadaan)
- spse.lkpp.go.id (portal LKPP)
- tender-indonesia.com & ijintender.co.id
- kpbu.go.id (Kerjasama Pemerintah dan Badan Usaha / PPP)
- bappenas.go.id (proyek infrastruktur RPJMN)
- pu.go.id (program PUPR: jalan, jembatan, irigasi, perumahan)
- kemenhub.go.id (infrastruktur transportasi)
- kemendes.go.id (proyek desa dan infrastruktur pedesaan)
- kemendikbud.go.id (pembangunan sekolah dan gedung pendidikan)
- kemenkes.go.id (pembangunan fasilitas kesehatan)
- Proyek Strategis Nasional (PSN) dari Kemenko Perekonomian

Sumber data — BUMN & SWASTA:
- pertamina.com, pln.co.id (proyek ESDM dan utilitas)
- hutamakarya.com, adhi.co.id, waskita.co.id, pp-properti.co.id (subkon BUMN)
- angkasapura1.co.id, angkasapura2.co.id (bandara)
- pelindo.co.id (pelabuhan)
- jakartamrt.co.id, krl.co.id (transportasi massal)
- IKN (ibu-kota-nusantara.go.id) — proyek ibukota baru

Sumber data — PROPERTI & PLATFORM DIGITAL:
- rei.or.id (Real Estate Indonesia — proyek perumahan, apartemen, komersial)
- apersi.or.id (Asosiasi Pengembang Perumahan dan Permukiman Seluruh Indonesia)
- himperra.or.id (Himpunan Pengembang Rumah Sederhana)
- mitrarenov.com (platform renovasi dan konstruksi ringan)
- tukang.com (marketplace jasa tukang dan konstruksi)
- buildwithangga.com, arsitur.com (platform arsitek & kontraktor)
- rumah123.com, 99.co, urbanindo.com (proyek perumahan swasta)
- propertidata.com, propertindo.id (data proyek properti)
- platform tender swasta: b2b.id, indotrading.com/konstruksi
- mediakonstruksi.id, konstruksimedia.com, mediasipil.myr.id (liputan proyek baru & tender swasta)
- indokontraktor.com (pengumuman proyek, forum, dan peluang subkon)
- binakonstruksi.pu.go.id (program padat karya, proyek binaan PUPR, dan program IUWASH/PLP)

Fokus monitoring — 6 kategori peluang:
1. TENDER PEMERINTAH: LPSE baru, nilai HPS, deadline pendaftaran, syarat SBU
2. KPBU/PPP: proyek kerjasama pemerintah-swasta, konsesi jalan tol, pelabuhan, energi
3. PROYEK BUMN: tender subkontraktor dari Hutama Karya, Waskita, Adhi, PP, Nindya
4. PROYEK SWASTA/REI: pengembang properti yang sedang tender kontraktor pelaksana
5. PLATFORM RENOVASI: permintaan proyek dari mitrarenov.com, tukang.com, dan marketplace sejenis
6. PROYEK IKN: paket konstruksi di kawasan Ibu Kota Nusantara Kalimantan Timur

Berikan 14-18 temuan realistis dalam format JSON:
{
  "summary": "ringkasan peluang proyek dan tender minggu ini dari semua sumber",
  "findings": [
    {
      "title": "nama proyek/tender/peluang",
      "description": "pemilik proyek + lokasi + spesifikasi + nilai estimasi + persyaratan utama",
      "urgency": "high|medium|low|info",
      "category": "Tender Pemerintah|KPBU/PPP|Proyek BUMN|Proyek Swasta/REI|Platform Renovasi|IKN|Deadline Dekat|PSN",
      "entityName": "nama instansi/pengembang/BUMN pemilik proyek",
      "entityCode": "nomor tender / kode LPSE / kode proyek",
      "expiryDate": "deadline pendaftaran atau batas penawaran",
      "sourceUrl": "https://sumber terkait"
    }
  ]
}
Tanggal hari ini: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}.`,
    },
    "freelance": {
      name: "Tim Pasar Tenaga Ahli & Subkontraktor",
      description: "Monitor pasar tenaga ahli SKK, subkontraktor, dan platform kerja konstruksi dari job board, asosiasi, komunitas, dan marketplace",
      systemPrompt: `Kamu adalah agen spesialis analisis pasar tenaga ahli dan subkontraktor konstruksi Indonesia di DokumenProyek.com.

Sumber data yang dipantau:
- lpjk.pu.go.id & siki.lpjk.net (direktori tenaga ahli bersertifikat)
- bnsp.go.id (database pemegang SKK aktif)
- Portal job board: linkedin.com/jobs (konstruksi Indonesia), jobstreet.co.id, indeed.co.id, karir.com
- Platform freelance: projects.co.id, freelancer.co.id, sribulancer.com, fastwork.id
- Platform konstruksi khusus: tukang.com, mitrarenov.com, buildwithangga.com
- Komunitas profesional: grup Telegram konstruksi Indonesia, forum GAPENSI, forum INKINDO
- Portal asosiasi profesi: iai.id (arsitek), pii.or.id (insinyur), haki.or.id, inkindo.org
- Portal rekrutmen BUMN: rekrutmen.bumn.go.id, career.pertamina.com, career.pln.co.id
- Social media profesional: LinkedIn Indonesia konstruksi, Instagram kontraktor Indonesia
- Platform upskilling: konstruksilearning.go.id, lms-lpjk.pu.go.id, Coursera (civil engineering)
- sipilpedia.com, sipilpediaacademy.com, sipilpedia.ai, sipilpediastore.com (ekosistem edukasi teknik sipil Indonesia)
- diklatkerja.com (platform diklat & pelatihan bersertifikat untuk tenaga kerja konstruksi)
- binakonstruksi.pu.go.id (program pelatihan & sertifikasi resmi PUPR)
- cekjurnal.id/jurnal/61-media-teknik-sipil & sinta.kemdiktisaintek.go.id/journals/profile/5332 (jurnal akademik teknik sipil — tren riset & standar baru)
- mediasipil.myr.id (berita teknis sipil — teknologi baru, material, metode konstruksi)

Fokus monitoring:
1. Kualifikasi SKK yang paling banyak dicari BUJK dan proyek saat ini
2. SKK yang over-supply di pasar (kompetisi tinggi)
3. Wilayah dengan kekurangan tenaga ahli spesifik (peluang mobilisasi)
4. Tren gaji/honor tenaga ahli per jenjang dan bidang keahlian
5. BUJK besar yang sedang rekrutmen besar-besaran (indikasi proyek baru)
6. Platform digital yang mempertemukan tukang/kontraktor dengan pemilik proyek
7. Tren permintaan subkontraktor per sub-bidang (ME, sipil, arsitektur, spesialis)
8. Program pelatihan dan sertifikasi baru yang disubsidi pemerintah
9. Tenaga ahli senior yang tersedia di pasar (pensiun dini dari BUMN, dll)

Berikan 10-14 analisis/temuan dalam format JSON:
{
  "summary": "ringkasan kondisi pasar tenaga ahli, subkontraktor, dan platform kerja konstruksi",
  "findings": [
    {
      "title": "judul temuan pasar",
      "description": "detail analisis termasuk platform sumber, tren, dan rekomendasi",
      "urgency": "high|medium|low|info",
      "category": "SKK Dicari|SKK Over-Supply|Gaji/Honor|Regional|BUJK Rekrutmen|Platform Digital|Subkontraktor|Pelatihan",
      "entityName": "nama SKK/bidang/perusahaan/platform",
      "entityCode": "kode SKK/wilayah/platform",
      "expiryDate": null,
      "sourceUrl": "https://sumber terkait"
    }
  ]
}
Tanggal hari ini: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}.`,
    },
    "bujk-profil": {
      name: "Tim Profil BUJK & ISO/K3 Strategis",
      description: "Profil BUJK SBU/SKK kedaluwarsa, kualifikasi Menengah/Besar/Asing/Spesialis, ISO aktif/kadaluarsa, K3, dan peluang pemasaran layanan",
      systemPrompt: `Kamu adalah agen spesialis pengumpulan data profil BUJK dan perusahaan jasa konstruksi, ESDM, dan manufaktur strategis di platform DokumenProyek.com (engine: Gustafta / OpenClaw).

Tugasmu: simulasikan hasil pengumpulan data dari sumber-sumber resmi dan platform industri, mencakup:

SUMBER RESMI PEMERINTAH:
- lpjk.pu.go.id & siki.lpjk.net (database SBU, SKK, dan profil BUJK resmi)
- perijinan.pu.go.id (sistem perizinan Kementerian PUPR)
- oss.go.id (NIB, KBLI, perizinan berbasis risiko)
- ahu.go.id / kemenkumham.go.id (akta perusahaan, susunan pengurus)
- inaproc.go.id & sirup.go.id (rencana pengadaan dan track record)
- lpse.pu.go.id dan LPSE seluruh daerah (riwayat tender & kemenangan)
- esdm.go.id (IUP, IUPK, IUPTL, usaha ketenagalistrikan & migas)
- minerba.esdm.go.id (data perusahaan tambang dan mineral batubara)
- migas.esdm.go.id (data kontraktor KKS, KKKS, dan jasa migas)
- kemnaker.go.id & K3.kemnaker.go.id (data penerapan SMK3, P2K3, kecelakaan kerja)
- bsn.go.id (database sertifikat ISO aktif yang diterbitkan di Indonesia)
- kemenperin.go.id (data industri manufaktur, IUI, izin produksi)
- kemendag.go.id (SIUP, API, data importir, distributor)
- bkpm.go.id / investment.go.id (data PMDN dan PMA sektor konstruksi)

SUMBER ASOSIASI & KOMUNITAS INDUSTRI:
- gapensi.or.id (anggota kontraktor nasional & daerah)
- inkindo.org (konsultan nasional & regional)
- gapeksindo.or.id, aspekindo.or.id, asnkgi.or.id (asosiasi khusus)
- himperra.or.id (pengembang perumahan rakyat)
- kadin.id & apindo.or.id (kamar dagang, asosiasi pengusaha)
- pii.or.id (Persatuan Insinyur Indonesia)
- iai.id (Ikatan Arsitek Indonesia)
- haki.or.id (Himpunan Ahli Konstruksi Indonesia)
- mki.or.id (Masyarakat Kelistrikan Indonesia)
- iabi.or.id (Ikatan Ahli Bangunan Indonesia)

SUMBER MEDIA, RISET & INTELIJEN PASAR:
- konstruksi.co.id & majalahkonstruksi.com (berita tender & proyek baru)
- bisnis.com/properti, kontan.co.id/konstruksi (kabar BUJK & proyek swasta)
- katadata.co.id (data makro industri konstruksi & properti)
- properti.bisnis.com, rumah123.com, 99.co (proyek properti swasta baru)
- rei.or.id (proyek REI — perumahan, apartemen, komersial berskala besar)
- mitrarenov.com, tukang.com (permintaan renovasi & konstruksi ringan skala kecil-menengah)
- tender-indonesia.com, ijintender.co.id (agregator tender nasional)
- indotrading.com/konstruksi, b2b.id (marketplace B2B material & jasa konstruksi)
- LinkedIn Indonesia (rekrutmen, ekspansi tim, proyek baru yang diumumkan BUJK)
- mediakonstruksi.id, konstruksimedia.com, mediasipil.myr.id (liputan profil perusahaan, proyek, dan isu industri)
- indokontraktor.com (direktori kontraktor, profil, dan portofolio proyek)
- binakonstruksi.pu.go.id (data pembinaan, akreditasi asosiasi, dan program kualifikasi BUJK)
- sipilpedia.com & sipilpedia.ai (referensi teknis, database material, dan knowledge base sipil)
- diklatkerja.com (data kebutuhan pelatihan teknis — indikator segmen yang belum tersertifikasi)
- cekjurnal.id, sinta.kemdiktisaintek.go.id (riset akademik terbaru — standar, material baru, metode)
- editage.com/research-solutions/journal/media-komunikasi-teknik-sipil (jurnal komunikasi & inovasi teknik sipil)

Fokus pengumpulan data pada LIMA kategori utama:

KATEGORI 1 — SBU & SKK YANG AKAN BERAKHIR MASA BERLAKUNYA:
- SBU yang habis dalam 30 hari → urgency: high
- SBU yang habis dalam 31–90 hari → urgency: medium
- SKK Tenaga Ahli yang akan kedaluwarsa
- SKK Tenaga Terampil yang akan kedaluwarsa
- BUJK yang belum perpanjang meski sudah lewat batas

KATEGORI 2 — BUJK KUALIFIKASI STRATEGIS:
- BUJK Kualifikasi Menengah: daftar aktif, bidang pekerjaan, wilayah operasi
- BUJK Kualifikasi Besar: kontraktor & konsultan skala besar
- BUJK Asing (BUJKA): perusahaan asing yang beroperasi di Indonesia
- BUJK Spesialis: bidang spesialisasi tertentu (pondasi, mekanikal, elektrikal, ESDM)

KATEGORI 3 — ISO & SISTEM MANAJEMEN:
- Perusahaan jasa konstruksi, ESDM, dan industri manufaktur yang SEDANG MENGURUS sertifikasi ISO (ISO 9001, ISO 14001, ISO 45001, SMK3, dll)
- Perusahaan yang SUDAH MEMILIKI sertifikasi ISO beserta tanggal berakhirnya
- Perusahaan dengan ISO yang akan expired dalam 6 bulan ke depan → peluang renewal
- Jenis ISO yang paling banyak dicari sektor konstruksi & ESDM saat ini

KATEGORI 4 — PENERAPAN K3 (KESELAMATAN & KESEHATAN KERJA):
- Perusahaan konstruksi dan ESDM yang sedang menerapkan program K3 / SMK3
- Perusahaan yang baru mendapat penghargaan zero accident / K3 terbaik
- Perusahaan yang sedang dalam proses audit K3 eksternal
- Sektor dengan tingkat kepatuhan K3 tertinggi dan terendah

KATEGORI 5 — PELUANG PEMASARAN LAYANAN DokumenProyek.com:
- Identifikasi segmen perusahaan yang paling membutuhkan layanan platform ini
- BUJK dengan SBU/SKK hampir expired → target layanan perpanjangan SBU/SKK
- Perusahaan yang belum punya ISO tapi wajib memiliki → target layanan ISO
- Kontraktor menengah yang belum naik kelas → target layanan konsultasi upgrade kualifikasi
- Perusahaan ESDM/manufaktur yang butuh SMK3/ISO 45001 → target layanan K3
- Rekomendasi pendekatan pemasaran: pesan utama, channel yang tepat (WhatsApp, email, LPSE, asosiasi), dan timing terbaik

Berikan 16–20 temuan realistis dalam format JSON:
{
  "summary": "ringkasan profil BUJK strategis, status ISO/K3, dan peluang pemasaran periode ini",
  "findings": [
    {
      "title": "judul temuan",
      "description": "detail profil/temuan: bidang usaha, status sertifikasi, tanggal, catatan pemasaran",
      "urgency": "high|medium|low|info",
      "category": "SBU Kedaluwarsa|SKK Kedaluwarsa|BUJK Menengah|BUJK Besar|BUJK Asing|BUJK Spesialis|ISO Aktif|ISO Kedaluwarsa|ISO Proses|K3 Aktif|K3 Audit|Peluang Pemasaran",
      "entityName": "nama resmi perusahaan/BUJK",
      "entityCode": "nomor SBU / NIB / nomor ISO / kode K3",
      "expiryDate": "tanggal berakhir sertifikat jika relevan (format: DD MMM YYYY)",
      "sourceUrl": "https://lpjk.pu.go.id atau sumber terkait"
    }
  ]
}

Gunakan nama perusahaan Indonesia yang realistis dari berbagai sektor (konstruksi, ESDM, manufaktur), kode yang valid, dan tanggal yang masuk akal.
Tanggal hari ini: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}.`,
    },
  };

  // GET /api/multiclaw/status — latest session per team + total findings
  app.get("/api/multiclaw/status", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const sessions = await storage.getLatestSessionPerTeam();
      const teams = ["sbu-skk", "bujk", "tender", "freelance", "bujk-profil"];
      const result = teams.map(team => {
        const session = sessions.find(s => s.team === team) || null;
        const cfg = MULTICLAW_TEAMS[team];
        return { team, name: cfg.name, description: cfg.description, latestSession: session };
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil status monitoring" });
    }
  });

  // POST /api/multiclaw/run — trigger a monitoring run for a team
  app.post("/api/multiclaw/run", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    const { team } = req.body;
    const cfg = MULTICLAW_TEAMS[team];
    if (!cfg) return res.status(400).json({ message: "Tim tidak dikenal" });

    const userId = req.user?.id?.toString() || req.user?.claims?.sub || "";
    const session = await storage.createMonitoringSession({ team, triggeredBy: "manual", userId, status: "running" });
    res.json({ sessionId: session.id, status: "running" });

    // Run AI analysis in background, stream result back via polling
    (async () => {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "system", content: cfg.systemPrompt }, { role: "user", content: "Jalankan monitoring sekarang dan berikan hasil terbaru dalam format JSON yang diminta." }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        let parsed: any = {};
        try { parsed = JSON.parse(completion.choices[0]?.message?.content || "{}"); } catch { parsed = {}; }
        const rawFindings: any[] = parsed.findings || [];

        const findings = rawFindings.map((f: any) => ({
          sessionId: session.id,
          team,
          category: f.category || null,
          title: f.title || "Temuan",
          description: f.description || null,
          urgency: f.urgency || "info",
          sourceUrl: f.sourceUrl || null,
          entityName: f.entityName || null,
          entityCode: f.entityCode || null,
          expiryDate: f.expiryDate || null,
          extraData: null,
        }));

        await storage.createMonitoringFindings(findings);
        await storage.completeMonitoringSession(session.id, parsed.summary || "Monitoring selesai.", findings.length, "completed");
      } catch (err: any) {
        // Sanitize error — never store raw provider text in the session summary
        const errStatus = err?.status || err?.response?.status;
        let failSummary: string;
        if (errStatus === 429) {
          failSummary = "Layanan AI sedang sibuk (kuota habis). Coba jalankan ulang sebentar lagi.";
        } else if (errStatus === 401) {
          failSummary = "Konfigurasi layanan AI tidak valid. Hubungi administrator.";
        } else {
          failSummary = "Monitoring gagal karena kesalahan server AI. Coba jalankan ulang.";
        }
        await storage.completeMonitoringSession(session.id, failSummary, 0, "failed");
      }
    })();
  });

  // GET /api/multiclaw/session/:id — poll session status
  app.get("/api/multiclaw/session/:id", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID sesi tidak valid" });
      }
      const session = await storage.getMonitoringSession(id);
      if (!session) {
        return res.status(404).json({ message: "Sesi tidak ditemukan" });
      }
      // Ownership check: only the user who triggered the session may poll it
      const userId = req.user.claims.sub;
      if (session.userId && session.userId !== userId) {
        return res.status(403).json({ message: "Tidak diizinkan" });
      }
      res.json({
        sessionId: session.id,
        team: session.team,
        status: session.status,
        findingsCount: session.findingsCount ?? 0,
        summary: session.summary ?? null,
        startedAt: session.startedAt,
        completedAt: session.completedAt ?? null,
      });
    } catch {
      res.status(500).json({ message: "Gagal mengambil status sesi" });
    }
  });

  // GET /api/multiclaw/findings/:team — get recent findings for a team
  app.get("/api/multiclaw/findings/:team", isAuthenticated, isSuperAdmin, async (req: any, res) => {
    try {
      const findings = await storage.getFindingsByTeam(req.params.team, 50);
      res.json(findings);
    } catch {
      res.status(500).json({ message: "Gagal mengambil temuan" });
    }
  });

  // GET /api/multiclaw/freelance — get freelance listings
  app.get("/api/multiclaw/freelance", isAuthenticated, async (req: any, res) => {
    try {
      const listings = await storage.getFreelanceListings("active");
      res.json(listings);
    } catch {
      res.status(500).json({ message: "Gagal mengambil listing" });
    }
  });

  // POST /api/multiclaw/freelance — create listing
  app.post("/api/multiclaw/freelance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id?.toString() || req.user?.claims?.sub || "";
      const listing = await storage.createFreelanceListing({ ...req.body, userId, status: "active" });
      res.json(listing);
    } catch {
      res.status(500).json({ message: "Gagal membuat listing" });
    }
  });

  // PATCH /api/multiclaw/freelance/:id/close — close a listing
  app.patch("/api/multiclaw/freelance/:id/close", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
      const userId = req.user?.id?.toString() || req.user?.claims?.sub || "";
      const listing = await storage.getFreelanceListing(id);
      if (!listing) return res.status(404).json({ message: "Listing tidak ditemukan" });
      if (listing.userId !== userId) return res.status(403).json({ message: "Anda tidak memiliki izin untuk menutup listing ini" });
      const updated = await storage.updateFreelanceListingStatus(id, "closed");
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Gagal menutup listing" });
    }
  });

  // DELETE /api/multiclaw/freelance/:id
  app.delete("/api/multiclaw/freelance/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid" });
      const userId = req.user?.id?.toString() || req.user?.claims?.sub || "";
      const listing = await storage.getFreelanceListing(id);
      if (!listing) return res.status(404).json({ message: "Listing tidak ditemukan" });
      if (listing.userId !== userId) return res.status(403).json({ message: "Anda tidak memiliki izin untuk menghapus listing ini" });
      await storage.deleteFreelanceListing(id);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Gagal menghapus listing" });
    }
  });

  // GET /api/multiclaw/schedule — return next scheduled run info
  app.get("/api/multiclaw/schedule", isAuthenticated, isSuperAdmin, async (_req, res) => {
    res.json({
      nextRun: multiClawNextRun ? multiClawNextRun.toISOString() : null,
      intervalHours: multiClawIntervalHours,
    });
  });

  // ─── Toko Digital ────────────────────────────────────────────────────────────
  const STORE_CATALOG = [
    {
      id: 1,
      slug: "panduan-sbu-lpjk-2025",
      title: "Panduan Lengkap Mengurus SBU via LSBU 2025",
      description: "Step-by-step pengurusan Sertifikat Badan Usaha melalui LSBU berlisensi — dari persyaratan per gred, proses OSS, hingga perpanjangan. Cocok untuk BUJK baru maupun yang ingin upgrade kualifikasi.",
      category: "ebook",
      price: 97000,
      originalPrice: 197000,
      thumbnail: null,
      tags: ["SBU", "LSBU", "konstruksi", "sertifikasi"],
      isFeatured: true,
      downloadCount: 412,
      rating: 48,
    },
    {
      id: 2,
      slug: "template-dokumen-tender-50",
      title: "50 Template Dokumen Tender Siap Pakai",
      description: "Koleksi 50 template dokumen tender resmi: surat penawaran, RAB, spesifikasi teknis, jaminan penawaran, dan lainnya — format Word & PDF.",
      category: "template",
      price: 149000,
      originalPrice: 299000,
      thumbnail: null,
      tags: ["tender", "dokumen", "template", "pengadaan"],
      isFeatured: true,
      downloadCount: 287,
      rating: 49,
    },
    {
      id: 3,
      slug: "kursus-cara-menang-tender",
      title: "Cara Menang Tender Pemerintah dari Nol",
      description: "Video kursus 6 modul: memahami SIRUP, strategi harga, kelengkapan administrasi, teknik evaluasi dokumen, dan manajemen risiko tender.",
      category: "kursus",
      price: 197000,
      originalPrice: 397000,
      thumbnail: null,
      tags: ["tender", "kursus", "pengadaan", "strategi"],
      isFeatured: true,
      downloadCount: 198,
      rating: 47,
    },
    {
      id: 4,
      slug: "panduan-skk-esdm-2025",
      title: "Panduan SKK ESDM — Sertifikat Kompetensi Kerja 2025",
      description: "Panduan lengkap persyaratan, prosedur uji kompetensi, dan cara mempertahankan SKK ESDM untuk tenaga teknik ketenagalistrikan dan migas.",
      category: "ebook",
      price: 79000,
      originalPrice: null,
      thumbnail: null,
      tags: ["SKK", "ESDM", "kompetensi", "ketenagalistrikan"],
      isFeatured: false,
      downloadCount: 156,
      rating: 46,
    },
    {
      id: 5,
      slug: "template-excel-laporan-keuangan-proyek",
      title: "Paket Template Excel Laporan Keuangan Proyek",
      description: "3 template Excel siap pakai: Cash Flow Proyek, RAB vs Realisasi, dan Laporan Laba Rugi Kontrak — dilengkapi formula otomatis.",
      category: "template",
      price: 129000,
      originalPrice: 249000,
      thumbnail: null,
      tags: ["keuangan", "Excel", "proyek", "laporan"],
      isFeatured: false,
      downloadCount: 234,
      rating: 48,
    },
    {
      id: 6,
      slug: "jasa-pengurusan-sbu-end-to-end",
      title: "Jasa Pengurusan SBU via LSBU End-to-End",
      description: "Tim PT. SKI mengurus SBU Anda melalui LSBU berlisensi dari awal hingga terbit: konsultasi kualifikasi, persiapan dokumen, pendampingan proses OSS, hingga sertifikat di tangan.",
      category: "jasa",
      price: 2500000,
      originalPrice: null,
      thumbnail: null,
      tags: ["SBU", "jasa", "LSBU", "pendampingan"],
      isFeatured: false,
      downloadCount: 0,
      rating: 50,
    },
    {
      id: 7,
      slug: "jasa-pengurusan-iso-9001",
      title: "Jasa Sertifikasi ISO 9001:2015 untuk Kontraktor",
      description: "Pendampingan penuh implementasi dan sertifikasi ISO 9001:2015 — gap analysis, penyusunan dokumen mutu, audit internal, hingga sertifikat terakreditasi.",
      category: "jasa",
      price: 5500000,
      originalPrice: null,
      thumbnail: null,
      tags: ["ISO", "9001", "manajemen mutu", "konstruksi"],
      isFeatured: false,
      downloadCount: 0,
      rating: 50,
    },
    {
      id: 8,
      slug: "paket-starter-sbu-skk",
      title: "Paket Starter: SBU + SKK Konstruksi",
      description: "Paket bundling hemat untuk BUJK baru: eBook Panduan SBU + Panduan SKK + Template Administrasi Tender (3 produk, harga 1). Hemat 40%.",
      category: "paket",
      price: 199000,
      originalPrice: 323000,
      thumbnail: null,
      tags: ["SBU", "SKK", "paket", "bundling", "konstruksi"],
      isFeatured: true,
      downloadCount: 89,
      rating: 48,
    },
    {
      id: 9,
      slug: "template-raps-kontrak-konstruksi",
      title: "Template RAPS & Dokumen Kontrak Konstruksi",
      description: "Template Rencana Anggaran Penawaran Sendiri (RAPS) + draft kontrak konstruksi standar FIDIC/PUPR dalam format Word yang bisa langsung diedit.",
      category: "template",
      price: 89000,
      originalPrice: null,
      thumbnail: null,
      tags: ["RAPS", "kontrak", "konstruksi", "dokumen"],
      isFeatured: false,
      downloadCount: 178,
      rating: 47,
    },
    {
      id: 10,
      slug: "kursus-iso-smk3-untuk-kontraktor",
      title: "Kursus Implementasi ISO & SMK3 untuk Kontraktor",
      description: "4 modul video: dasar ISO 9001 & OHSAS/SMK3, penyusunan dokumen sistem manajemen, audit internal, dan tips lolos audit eksternal.",
      category: "kursus",
      price: 249000,
      originalPrice: 449000,
      thumbnail: null,
      tags: ["ISO", "SMK3", "K3", "kursus", "manajemen"],
      isFeatured: false,
      downloadCount: 112,
      rating: 47,
    },
  ];

  app.get("/api/store/products", async (req, res) => {
    try {
      const { category } = req.query as { category?: string };
      const products = category && category !== "semua"
        ? STORE_CATALOG.filter(p => p.category === category)
        : STORE_CATALOG;
      res.json(products);
    } catch {
      res.status(500).json({ message: "Gagal memuat produk" });
    }
  });

  app.get("/api/store/products/:slug", async (req, res) => {
    try {
      const product = STORE_CATALOG.find(p => p.slug === req.params.slug);
      if (!product) return res.status(404).json({ message: "Produk tidak ditemukan" });
      res.json(product);
    } catch {
      res.status(500).json({ message: "Gagal memuat produk" });
    }
  });

  // ─── MultiClaw Auto-Scheduler ──────────────────────────────────────────────
  // Configurable via env: MULTICLAW_INTERVAL_HOURS (default 24)
  // First run fires at next 07:00 WIB (UTC+7 = UTC+0 00:00)
  const rawInterval = parseInt(process.env.MULTICLAW_INTERVAL_HOURS || "24", 10);
  if (isNaN(rawInterval) || rawInterval <= 0) {
    console.warn(`[MultiClaw Scheduler] Invalid MULTICLAW_INTERVAL_HOURS value; defaulting to 24h`);
    multiClawIntervalHours = 24;
  } else if (rawInterval > 168) {
    console.warn(`[MultiClaw Scheduler] MULTICLAW_INTERVAL_HOURS=${rawInterval} exceeds 168h max; clamping to 168h`);
    multiClawIntervalHours = 168;
  } else {
    multiClawIntervalHours = rawInterval;
  }

  const SCHEDULED_TEAMS = ["sbu-skk", "bujk", "tender", "freelance"];

  async function runMultiClawTeamScheduled(team: string): Promise<void> {
    const cfg = MULTICLAW_TEAMS[team];
    if (!cfg) return;
    let session: any;
    try {
      session = await storage.createMonitoringSession({ team, triggeredBy: "scheduled", userId: "system", status: "running" });
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: cfg.systemPrompt },
          { role: "user", content: "Jalankan monitoring terjadwal harian dan berikan hasil terbaru dalam format JSON yang diminta." },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      let parsed: any = {};
      try { parsed = JSON.parse(completion.choices[0]?.message?.content || "{}"); } catch { parsed = {}; }
      const rawFindings: any[] = parsed.findings || [];
      const findings = rawFindings.map((f: any) => ({
        sessionId: session.id,
        team,
        category: f.category || null,
        title: f.title || "Temuan",
        description: f.description || null,
        urgency: f.urgency || "info",
        sourceUrl: f.sourceUrl || null,
        entityName: f.entityName || null,
        entityCode: f.entityCode || null,
        expiryDate: f.expiryDate || null,
        extraData: null,
      }));
      await storage.createMonitoringFindings(findings);
      await storage.completeMonitoringSession(session.id, parsed.summary || "Monitoring terjadwal selesai.", findings.length, "completed");
      console.log(`[MultiClaw Scheduler] Team ${team} completed — ${findings.length} findings`);
    } catch (err: any) {
      if (session?.id) {
        // Sanitize error — never store raw provider text in the session summary
        const errStatus = err?.status || err?.response?.status;
        let failSummary: string;
        if (errStatus === 429) {
          failSummary = "Layanan AI sedang sibuk (kuota habis). Monitoring terjadwal berikutnya akan berjalan otomatis.";
        } else if (errStatus === 401) {
          failSummary = "Konfigurasi layanan AI tidak valid. Hubungi administrator.";
        } else {
          failSummary = "Monitoring terjadwal gagal karena kesalahan server AI. Akan dicoba kembali pada jadwal berikutnya.";
        }
        await storage.completeMonitoringSession(session.id, failSummary, 0, "failed");
      }
      console.error(`[MultiClaw Scheduler] Team ${team} failed:`, err?.message);
    }
  }

  // Compute the next schedule boundary after `after`, using epoch-aligned multiples of
  // intervalHours. Because the Unix epoch falls on 1970-01-01 00:00 UTC (= 07:00 WIB),
  // all multiples of 24h land at 00:00 UTC = 07:00 WIB, and larger multiples (48h, 72h …)
  // still hit 07:00 WIB on their respective days. Sub-daily intervals are similarly spaced
  // from epoch (e.g. 6h → 00:00, 06:00, 12:00, 18:00 UTC). This single formula honours
  // every positive intervalHours value correctly.
  function nextScheduleBoundary(after: Date): Date {
    const ms = multiClawIntervalHours * 60 * 60 * 1000;
    return new Date(Math.ceil((after.getTime() + 1) / ms) * ms);
  }

  async function runAllScheduledTeams(): Promise<void> {
    console.log("[MultiClaw Scheduler] Running scheduled monitoring for all teams…");
    for (const team of SCHEDULED_TEAMS) {
      await runMultiClawTeamScheduled(team);
      // Brief pause between teams to avoid hammering OpenAI
      await new Promise(r => setTimeout(r, 2000));
    }
    // Schedule next run anchored to next fixed boundary (not offset from now)
    scheduleNextRun();
  }

  function scheduleNextRun(): void {
    const now = new Date();
    const next = nextScheduleBoundary(now);
    multiClawNextRun = next;
    const msUntil = next.getTime() - now.getTime();
    console.log(`[MultiClaw Scheduler] Next run at ${next.toISOString()} (in ${Math.round(msUntil / 60000)} min)`);
    setTimeout(runAllScheduledTeams, msUntil);
  }

  scheduleNextRun();

  return httpServer;
}

// Template-based tender document generator
function generateTenderContent(doc: any): string {
  const projectTypes: Record<string, string> = {
    gedung: "Konstruksi Bangunan Gedung",
    infrastruktur: "Konstruksi Infrastruktur",
    sipil: "Pekerjaan Sipil",
    mekanikal: "Pekerjaan Mekanikal Elektrikal Plumbing (MEP)",
    elektrikal: "Pekerjaan Elektrikal",
  };

  const documentSections: Record<string, string[]> = {
    administrasi: [
      "SURAT PENAWARAN",
      "SURAT KUASA",
      "PAKTA INTEGRITAS",
      "FORMULIR ISIAN KUALIFIKASI",
      "SURAT PERNYATAAN",
    ],
    teknis: [
      "METODE PELAKSANAAN",
      "JADWAL PELAKSANAAN",
      "SPESIFIKASI TEKNIS",
      "DAFTAR PERSONIL",
      "DAFTAR PERALATAN",
      "RENCANA K3 KONSTRUKSI",
    ],
    harga: [
      "RINCIAN HARGA PENAWARAN",
      "ANALISA HARGA SATUAN",
      "REKAPITULASI BIAYA",
    ],
    semua: [
      "SURAT PENAWARAN",
      "PAKTA INTEGRITAS",
      "FORMULIR ISIAN KUALIFIKASI",
      "SURAT PERNYATAAN",
      "METODE PELAKSANAAN",
      "JADWAL PELAKSANAAN",
      "DAFTAR PERSONIL",
      "DAFTAR PERALATAN",
      "RENCANA K3 KONSTRUKSI",
      "RINCIAN HARGA PENAWARAN",
      "ANALISA HARGA SATUAN",
      "REKAPITULASI BIAYA",
    ],
  };

  const sections = documentSections[doc.documentType] || documentSections.semua;
  const projectTypeName = projectTypes[doc.projectType] || doc.projectType;

  let content = `
================================================================================
                        DOKUMEN PENAWARAN TENDER
================================================================================

INFORMASI PROYEK:
─────────────────────────────────────────────────────────────────────────────
Nama Proyek      : ${doc.projectName}
Jenis Proyek     : ${projectTypeName}
Nilai Proyek     : ${doc.projectValue || "Sesuai RAB"}
Lokasi           : ${doc.projectLocation || "-"}
Pemberi Kerja    : ${doc.clientName || "-"}
Batas Waktu      : ${doc.deadline ? new Date(doc.deadline).toLocaleDateString('id-ID') : "-"}

INFORMASI PERUSAHAAN:
─────────────────────────────────────────────────────────────────────────────
Nama Perusahaan  : ${doc.companyName || "[Nama Perusahaan]"}
Alamat           : ${doc.companyAddress || "[Alamat Perusahaan]"}
NPWP             : ${doc.npwp || "[Nomor NPWP]"}
Nomor SBU        : ${doc.sbuNumber || "[Nomor SBU]"}
Klasifikasi SBU  : ${doc.sbuClassification || "[Klasifikasi]"}
Direktur         : ${doc.directorName || "[Nama Direktur]"}

================================================================================
                              DAFTAR ISI DOKUMEN
================================================================================
`;

  sections.forEach((section, index) => {
    content += `${index + 1}. ${section}\n`;
  });

  content += `
================================================================================
                              ISI DOKUMEN
================================================================================
`;

  sections.forEach((section, index) => {
    content += `
────────────────────────────────────────────────────────────────────────────────
${index + 1}. ${section}
────────────────────────────────────────────────────────────────────────────────
`;
    content += generateSectionContent(section, doc);
  });

  content += `
================================================================================
                              PENUTUP
================================================================================

Demikian dokumen penawaran ini kami sampaikan dengan sebenar-benarnya.
Atas perhatian dan kerjasamanya kami ucapkan terima kasih.


                                          ${doc.projectLocation || "[Kota]"}, ${new Date().toLocaleDateString('id-ID')}
                                          
                                          ${doc.companyName || "[Nama Perusahaan]"}
                                          
                                          
                                          
                                          _______________________
                                          ${doc.directorName || "[Nama Direktur]"}
                                          Direktur

================================================================================
                    DOKUMEN INI DIBUAT DENGAN DOKUMENTENDER.COM
================================================================================
`;

  return content;
}

function generateSectionContent(section: string, doc: any): string {
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const projectTypeMethods: Record<string, string> = {
    gedung: `
A. PEKERJAAN PERSIAPAN
   1. Mobilisasi & Demobilisasi
      - Mobilisasi peralatan berat dan kendaraan proyek ke lokasi
      - Pembangunan barak kerja, kantor lapangan, dan gudang material
      - Pemasangan papan nama proyek sesuai format PPK/owner
      - Pemasangan pagar pengaman proyek (safety fence) sesuai perimeter
      - Pengukuran dan pematokan ulang (setting out) berdasarkan gambar kerja
      - Instalasi sementara listrik, air kerja, dan drainase lapangan
   
   2. K3 & Persiapan Keamanan Kerja
      - Briefing K3 harian (toolbox meeting) sebelum mulai kerja
      - Pemasangan safety sign, jalur evakuasi, APAR, dan P3K
      - APD wajib: helm, rompi, sepatu safety, sarung tangan, kacamata

B. PEKERJAAN SIPIL & STRUKTUR
   1. Pekerjaan Tanah
      - Galian tanah sesuai gambar rencana pondasi
      - Lantai kerja (lean concrete) dengan mutu beton minimal K-100
      - Urugan dan pemadatan tanah kembali sesuai spesifikasi (CBR)
      - Disposal material galian ke lokasi yang disetujui PPK
   
   2. Pekerjaan Pondasi
      - Pemasangan tiang pancang / bored pile sesuai data sondir/boring
      - Pile cap dan tie beam sesuai gambar struktur
      - Pengujian pile load test sesuai spesifikasi teknis
   
   3. Pekerjaan Beton Bertulang
      - Bekisting (formwork) — menggunakan plywood 12mm + rangka besi
      - Pembesian — sesuai gambar tulangan (bar bending schedule)
      - Pengecoran beton readymix mutu K-300/K-350 sesuai spesifikasi
      - Perawatan (curing) beton selama minimal 14 hari
      - Uji kuat tekan silinder (compression test) per 50 m³ atau per lantai
   
   4. Pekerjaan Struktural Baja (jika ada)
      - Fabrikasi sesuai shop drawing dan standar SNI 1729
      - Sambungan las dan baut sesuai kelas kekuatan
      - Uji NDT (Non-Destructive Test) pada sambungan kritis

C. PEKERJAAN ARSITEKTUR
   1. Pekerjaan Pasangan & Plesteran
      - Pasangan bata merah / bata ringan sesuai spesifikasi
      - Plesteran dan acian dengan campuran 1:4 atau sesuai spec
      - Keramik lantai dan dinding sesuai spec dan gambar finishing
   
   2. Pekerjaan Kusen, Pintu & Jendela
      - Frame aluminium/kayu sesuai spec dan gambar detail
      - Kaca sesuai spesifikasi (kaca tempered, kaca film, dll)
   
   3. Pekerjaan Pengecatan
      - Cat dasar (undercoat) 1 lapis + cat akhir 2 lapis
      - Brand cat sesuai spec (Nippon Paint, Dulux, atau setara)
      - Plamur sebelum pengecatan pada permukaan yang tidak rata

D. PENGENDALIAN MUTU & QUALITY CONTROL
   - Pengujian material sebelum digunakan (uji beton, besi, tanah)
   - Form inspeksi setiap tahapan pekerjaan (ITP — Inspection & Test Plan)
   - NCR (Non-Conformance Report) untuk setiap ketidaksesuaian
   - Dokumentasi foto harian: awal, proses, dan akhir setiap pekerjaan`,

    infrastruktur: `
A. PEKERJAAN PERSIAPAN
   1. Mobilisasi & Survei Lapangan
      - Survei topografi existing + profil memanjang & melintang
      - Pemetaan utilitas eksisting (pipa, kabel, saluran) sebelum galian
      - Pembuatan direksi keet, gudang, dan base camp pekerja
      - Koordinasi dengan instansi terkait (PLN, PDAM, Telkom, dll)
   
   2. Manajemen Lalu Lintas (Traffic Management)
      - Penyusunan TTMD (Traffic Management and Detour Plan)
      - Pemasangan rambu-rambu sementara dan lampu peringatan
      - Pagar pengaman di tepi galian dengan ketinggian > 1,2 m

B. PEKERJAAN TANAH & DRAINASE
   1. Galian Tanah Jalan / Saluran
      - Galian menggunakan excavator kapasitas 0.8–1.0 m³
      - Klasifikasi tanah galian sesuai SSKPBJ atau Doktek
      - Pembuangan material ke lokasi yang disetujui (disposal area)
   
   2. Timbunan & Pemadatan
      - Material pilihan (selected fill) dengan CBR ≥ 10% sebelum dipadatkan
      - Pemadatan dengan vibro roller atau stamper sesuai lebar
      - Uji kepadatan lapangan (Sand Cone / DCP) setiap 200 m layer

C. PEKERJAAN JALAN
   1. Sub Base & Base Course
      - Sub Base Granular kelas B — Agregat Material sesuai Spesifikasi Umum 2018
      - Base Course (LPA) Kelas A — CBR ≥ 90% setelah pemadatan
      - Pengujian CBR di laboratorium dan lapangan per 200 m
   
   2. Lapisan Perkerasan Aspal
      - Lapis Resap Pengikat (Prime Coat) — CSS-1 atau sesuai spec
      - AC-BC (Asphalt Concrete Binder Course) — sesuai JMF yang disetujui
      - AC-WC (Asphalt Concrete Wearing Course) — suhu hamparan ≥ 140°C
      - Core drill test untuk uji ketebalan dan density lapisan aspal
   
   3. Bangunan Pelengkap Jalan
      - Box culvert / gorong-gorong di titik perpotongan saluran
      - Kerb (kanstin) beton precast sesuai spesifikasi
      - Marka jalan dan rambu tetap sesuai SRLL

D. PENGENDALIAN MUTU (QA/QC JALAN)
   - JMF (Job Mix Formula) disetujui lab & PPK sebelum produksi
   - Uji Marshall test setiap pengiriman per 50 ton
   - Core drill uji ketebalan aspal setiap 500 m² atau sesuai Dok. Teknis`,

    sipil: `
A. PEKERJAAN PERSIAPAN
   - Mobilisasi peralatan dan personel ke lokasi proyek
   - Pembersihan lahan (land clearing) dari vegetasi dan hambatan
   - Pengukuran dan pemasangan bouwplank sesuai gambar kerja
   - Pembuatan saluran drainase sementara di sekitar area kerja

B. PEKERJAAN TANAH
   1. Galian Struktur
      - Galian tanah keras/lunak sesuai gambar rencana
      - Dewatering jika elevasi muka air tanah tinggi
      - Shore & bracing untuk galian dalam > 2 meter
   
   2. Urugan & Pemadatan
      - Urugan sirtu atau tanah pilihan lapis per lapis (max 30 cm/lapisan)
      - Pemadatan dengan vibro roller — density min 95% Proctor Modified
      - Uji kepadatan lapangan (Sand Cone) setiap 250 m² atau sesuai spec

C. PEKERJAAN BETON
   1. Beton Cor Setempat
      - Lantai kerja K-100, pondasi/struktur K-250/K-300 sesuai spec
      - Perancah (scaffolding) standar — beban terdistribusi merata
      - Readymix dari batching plant terdekat dengan surat jalan mutu
      - Slump test setiap truck readymix (slump 10±2 cm)
   
   2. Beton Precast
      - Fabrikasi di workshop tersetujui atau pabrik precast bersertifikat
      - Dokumen uji kuat tekan setiap batch
      - Pengangkutan dan pemasangan menggunakan mobile crane

D. PEKERJAAN DRAINASE & UTILITAS
   - Pemasangan pipa sesuai gambar dan spec material
   - Uji kebocoran pipa (pressure test / leak test)
   - Manhole dan struktur inlet/outlet sesuai gambar standar`,

    mekanikal: `
A. SCOPE PEKERJAAN MEKANIKAL, ELEKTRIKAL & PLUMBING (MEP)
   Pekerjaan MEP mencakup seluruh sistem penunjang bangunan yang terdiri dari:
   - Sistem Mekanikal: Plumbing, Fire Fighting, HVAC/Tata Udara
   - Sistem Elektrikal: Panel utama, distribusi daya, penerangan, grounding
   - Sistem Elektronik: Tata suara, CCTV, akses kontrol, BAS

B. PEKERJAAN PLUMBING
   1. Sistem Air Bersih
      - Instalasi pipa dari sumber (PDAM/Sumur) ke ground water tank
      - Sistem distribusi ke seluruh titik penggunaan (fixtures)
      - Pompa transfer dan pompa booster dengan backup otomatis
      - Uji tekan pipa air bersih: 15 kg/cm² selama 2 jam
   
   2. Sistem Air Kotor & Air Bekas
      - Pipa PVC SNI untuk air kotor (diameter 100–150mm), air bekas (50–75mm)
      - STP (Sewage Treatment Plant) sesuai kapasitas dan standar lingkungan
      - Uji kebocoran dan uji aliran sebelum penutupan shaft
   
   3. Sistem Hidran & Sprinkler
      - Hidran gedung dan hydrant box sesuai SNI 03-1745-2000
      - Sprinkler kepala tegak/datar sesuai NFPA 13 atau SNI
      - Pompa jockey, pompa utama, pompa darurat diesel

C. PEKERJAAN TATA UDARA (HVAC)
   - AC Central (Chilled Water) / AC Split / VRV sesuai spec
   - Ducting GI sesuai SMACNA, insulasi polyurethane atau glasswool
   - Balancing udara setelah komisioning — sesuai desain CFM
   - Uji fungsi (commissioning) seluruh sistem sebelum serah terima

D. PEKERJAAN ELEKTRIKAL
   1. Panel Listrik
      - MDP (Main Distribution Panel) — kapasitas sesuai perhitungan beban
      - SDP (Sub Distribution Panel) per lantai / zona
      - Panel penerangan & panel daya
      - Pengujian: megger test, earth continuity test, load test
   
   2. Instalasi Kabel & Lighting
      - Kabel sesuai spesifikasi (NYY, NYM, NYFGBY, dll)
      - Instalasi dalam konduit PVC/EMT sesuai standar
      - Lampu LED sesuai lux level yang disyaratkan per ruangan
      - Grounding system — tahanan ≤ 2 Ohm`,

    elektrikal: `
A. LINGKUP PEKERJAAN ELEKTRIKAL
   Pekerjaan meliputi seluruh instalasi sistem kelistrikan dari titik incoming PLN
   hingga terminal akhir (outlet/fixture) di seluruh area proyek.

B. PEKERJAAN PANEL TEGANGAN MENENGAH (TM)
   - Gardu transformator sesuai kebutuhan daya (KVA)
   - Kabel TM dari tiang PLN ke gardu — kabel N2XSY atau setara
   - Panel HV (High Voltage) dengan proteksi relay yang memadai
   - Komisioning dan pengujian bersama PLN (PLN Approval)

C. PEKERJAAN PANEL TEGANGAN RENDAH (TR)
   1. Panel Utama (LVMDP)
      - Panel baja dengan degree proteksi IP-54 minimal
      - MCB/MCCB, ELCB, busbar tembaga sesuai kapasitas
      - Sistem pengukuran (ammeter, voltmeter, KWH meter)
   
   2. Sub Panel & Panel Akhir
      - Distribusi daya ke setiap zona/lantai
      - Proteksi arus lebih dan arus bocor (RCD/ELCB)
      - Terminal grounding di setiap panel

D. INSTALASI KABEL & CONDUIT
   - Kabel NYY, NYM sesuai rating arus dan regulasi PUIL 2011
   - Conduit PVC/EMT, tray kabel, atau duct sesuai jalur
   - Sambungan kabel menggunakan konektor bersertifikat (bukan sambungan terbuka)
   - Labeling kabel dan wiring diagram terpasang di setiap panel

E. SISTEM PENERANGAN
   - Lampu LED sesuai desain pencahayaan (lux level)
   - Emergency lighting dengan baterai rechargeable min. 3 jam
   - Exit sign di seluruh jalur evakuasi
   - Kontrol penerangan (saklar/dimmer/timer) sesuai gambar

F. SISTEM GROUNDING & PENANGKAL PETIR
   - Grounding panel utama — elektroda bumi nilai ≤ 2 Ohm
   - Sistem penangkal petir konvensional/radius sesuai analisis risiko
   - Uji nilai tahanan grounding setelah instalasi selesai

G. PENGUJIAN & KOMISIONING
   - Megger test kabel setelah instalasi (resistansi insulasi ≥ 50 MΩ)
   - Earth continuity test, polarity test, load test
   - Uji trip ELCB/MCB, uji operasi panel
   - Serah terima dokumen: as-built, manual operasi, garansi material`
  };

  const templates: Record<string, string> = {
    "SURAT PENAWARAN": `
Nomor   : ${doc.companyName ? doc.companyName.substring(0, 4).toUpperCase() : "PT"}/SP/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}
Lampiran: 1 (satu) berkas dokumen penawaran
Perihal : Penawaran Harga Pekerjaan ${doc.projectName}

${doc.projectLocation || "[Kota]"}, ${today}

Kepada Yth.
Pejabat Pembuat Komitmen / Panitia Pengadaan
${doc.clientName || "[Pemberi Kerja/PPK]"}
di Tempat

Dengan hormat,

Menindaklanjuti Pengumuman Pelelangan / Permintaan Penawaran Pekerjaan 
"${doc.projectName}", dengan ini kami:

   Nama Perusahaan  : ${doc.companyName || "[Nama Perusahaan]"}
   Alamat           : ${doc.companyAddress || "[Alamat Perusahaan]"}
   NPWP             : ${doc.npwp || "[Nomor NPWP]"}
   Nomor SBU        : ${doc.sbuNumber || "[Nomor SBU]"}
   Klasifikasi SBU  : ${doc.sbuClassification || "[Klasifikasi]"}
   Direktur         : ${doc.directorName || "[Nama Direktur]"}

menyatakan dengan sesungguhnya bahwa kami:

1. Telah membaca, mempelajari, dan memahami seluruh isi Dokumen Pemilihan beserta 
   Addendum (jika ada), Berita Acara Penjelasan Pekerjaan, dan spesifikasi teknis.

2. Mengajukan Penawaran Harga untuk pekerjaan tersebut di atas sebesar:
   
   Rp ${doc.projectValue || "[NILAI PENAWARAN DALAM ANGKA]"}
   (${doc.projectValue ? "Terbilang dalam huruf sesuai nilai penawaran" : "[Nilai penawaran dalam huruf]"})
   
   Termasuk PPN 11%

3. Penawaran ini berlaku selama 90 (sembilan puluh) hari kalender terhitung sejak 
   tanggal batas akhir pemasukan penawaran.

4. Apabila penawaran kami diterima, kami sanggup menyelesaikan pekerjaan dalam 
   jangka waktu yang ditetapkan dalam Dokumen Pemilihan.

5. Penawaran ini mengikat kami dan kami tidak akan menarik diri dari penawaran 
   ini dalam masa berlakunya.

Bersama ini kami lampirkan dokumen penawaran yang terdiri dari dokumen administrasi, 
teknis, dan harga sesuai ketentuan Dokumen Pemilihan.

Atas perhatian dan kerjasamanya kami ucapkan terima kasih.

Hormat kami,
${doc.companyName || "[Nama Perusahaan]"}


Materai Rp 10.000,-


${doc.directorName || "[Nama Direktur]"}
Direktur
`,

    "PAKTA INTEGRITAS": `
PAKTA INTEGRITAS

Yang bertanda tangan di bawah ini, saya:

Nama           : ${doc.directorName || "[Nama Direktur]"}
Jabatan        : Direktur
Perusahaan     : ${doc.companyName || "[Nama Perusahaan]"}

Dalam rangka pengadaan ${doc.projectName}, dengan ini menyatakan bahwa:

1. Tidak akan melakukan praktek KKN (Korupsi, Kolusi, dan Nepotisme)
2. Akan melaporkan kepada pihak berwenang apabila mengetahui adanya 
   indikasi KKN
3. Akan mengikuti proses pengadaan secara bersih, transparan, dan profesional
4. Apabila melanggar hal-hal yang telah dinyatakan, bersedia dikenai 
   sanksi sesuai peraturan yang berlaku

Demikian pernyataan ini dibuat dengan sebenarnya untuk dipergunakan 
sebagaimana mestinya.
`,

    "FORMULIR ISIAN KUALIFIKASI": `
FORMULIR ISIAN KUALIFIKASI (FIK)
Pengadaan: ${doc.projectName}
Dasar: Perpres No. 12 Tahun 2021 & Perlem LKPP No. 12 Tahun 2021

═══════════════════════════════════════════════════════════════
A. DATA ADMINISTRASI UMUM
═══════════════════════════════════════════════════════════════
   1. Nama Perusahaan          : ${doc.companyName || "[Nama Perusahaan]"}
   2. Status Perusahaan        : PT (Perseroan Terbatas)
   3. Alamat Kantor Pusat      : ${doc.companyAddress || "[Alamat Lengkap]"}
   4. Telepon/Faks/Email       : [No. Telp] / [Faks] / [Email Perusahaan]
   5. NPWP                     : ${doc.npwp || "[Nomor NPWP 15 digit]"}
   6. Nomor SBU                : ${doc.sbuNumber || "[Nomor Sertifikat SBU]"}
   7. Klasifikasi/Subklasifikasi: ${doc.sbuClassification || "[Kode Klasifikasi — misal: BG001, SI001]"}
   8. Kualifikasi              : [Kecil/Menengah/Besar — sesuai SBU]
   9. Masa Berlaku SBU         : [Tanggal s.d. Tanggal]
   10. NIB                     : [Nomor Induk Berusaha dari OSS]

═══════════════════════════════════════════════════════════════
B. IZIN USAHA & LANDASAN HUKUM
═══════════════════════════════════════════════════════════════
   1. Akta Pendirian           : No. [Nomor Akta] Tgl [Tanggal] Notaris [Nama]
   2. Akta Perubahan Terakhir  : No. [Nomor Akta] Tgl [Tanggal] Notaris [Nama]
   3. SK Kemenkumham           : No. [Nomor SK] Tgl [Tanggal Pengesahan]
   4. NIB dari OSS             : [Nomor NIB] — Status: Aktif
   5. SIUJK / Izin Sektoral    : No. [Nomor SIUJK] Tgl [Tanggal] s.d. [Tanggal]

═══════════════════════════════════════════════════════════════
C. SUSUNAN PENGURUS PERUSAHAAN
═══════════════════════════════════════════════════════════════
   DIREKSI:
   1. Direktur Utama/Direktur  : ${doc.directorName || "[Nama Direktur]"}
      Kewarganegaraan          : WNI | No. KTP: [Nomor KTP]
      NPWP Pribadi             : [Nomor NPWP Pribadi]
   
   KOMISARIS:
   1. Komisaris Utama          : [Nama Komisaris]
      Kewarganegaraan          : WNI | No. KTP: [Nomor KTP]

═══════════════════════════════════════════════════════════════
D. DATA KEUANGAN
═══════════════════════════════════════════════════════════════
   1. Bank Rekening Perusahaan : [Nama Bank]
   2. Nomor Rekening           : [Nomor Rekening]
   3. PJBU (Penanggung Jawab Badan Usaha): ${doc.directorName || "[Nama Direktur]"}
   4. Laporan Keuangan Audit   : Tersedia (2 tahun terakhir, diaudit KAP)

═══════════════════════════════════════════════════════════════
E. PENGALAMAN PERUSAHAAN (5 Proyek Sejenis Terakhir)
═══════════════════════════════════════════════════════════════
No | Nama Pekerjaan          | Pemberi Kerja       | Nilai (Rp)   | Thn
---|-------------------------|---------------------|--------------|-----
1  | [Nama Proyek 1]         | [Instansi/Perus.]   | [Nilai]      | [Thn]
2  | [Nama Proyek 2]         | [Instansi/Perus.]   | [Nilai]      | [Thn]
3  | [Nama Proyek 3]         | [Instansi/Perus.]   | [Nilai]      | [Thn]
4  | [Nama Proyek 4]         | [Instansi/Perus.]   | [Nilai]      | [Thn]
5  | [Nama Proyek 5]         | [Instansi/Perus.]   | [Nilai]      | [Thn]

Catatan: Lengkapi dengan salinan kontrak dan BAST masing-masing proyek.

═══════════════════════════════════════════════════════════════
F. PERNYATAAN KUALIFIKASI
═══════════════════════════════════════════════════════════════
Dengan ini menyatakan bahwa data yang kami isi dalam formulir ini adalah 
benar dan lengkap. Apabila dikemudian hari terdapat ketidaksesuaian, kami
bersedia dikenai sanksi sesuai ketentuan yang berlaku.

${doc.projectLocation || "[Kota]"}, ${today}

${doc.companyName || "[Nama Perusahaan]"}


Materai Rp 10.000,-


${doc.directorName || "[Nama Direktur]"}
Direktur
`,

    "METODE PELAKSANAAN": `
METODE PELAKSANAAN PEKERJAAN
Nama Proyek : ${doc.projectName}
Lokasi      : ${doc.projectLocation || "[Lokasi Proyek]"}
Pemberi Kerja: ${doc.clientName || "[Nama PPK/Owner]"}
Nilai Kontrak: ${doc.projectValue || "[Nilai Kontrak]"}

Dasar Referensi:
- Spesifikasi Umum Bina Marga 2018 / SNI terkait sesuai jenis pekerjaan
- Peraturan K3 Konstruksi — PP No. 50/2012 tentang SMK3
- Dokumen Teknis (RKS, Gambar Rencana, dan BOQ Proyek)
${projectTypeMethods[doc.projectType] || projectTypeMethods.gedung}

E. RENCANA MANAJEMEN PROYEK
   1. Struktur Organisasi Proyek
      - Project Manager (PM): Koordinasi seluruh tim proyek
      - Site Manager: Pengawasan teknis lapangan harian
      - Quality Control: Pengujian dan dokumentasi mutu
      - K3 Officer: Safety briefing, inspeksi K3, laporan insiden
      - Surveyor: Pengukuran dan as-built data

   2. Jadwal Pelaporan
      - Laporan Harian: Dilaporkan ke owner/PPK setiap hari
      - Laporan Mingguan: Progress kurva S, foto, kendala
      - Laporan Bulanan: Termin pembayaran, deviasi jadwal

   3. Rencana Pengendalian Risiko
      - Identifikasi risiko sebelum mulai pekerjaan
      - Mitigasi untuk cuaca ekstrem, ketersediaan material, dan tenaga kerja
      - Contingency plan untuk pekerjaan pada jalur kritis
`,

    "JADWAL PELAKSANAAN": `
JADWAL PELAKSANAAN PEKERJAAN (KURVA S)
Nama Proyek  : ${doc.projectName}
Lokasi       : ${doc.projectLocation || "[Lokasi]"}
Pemberi Kerja: ${doc.clientName || "[PPK/Owner]"}

─────────────────────────────────────────────────────────────────────
RINGKASAN JADWAL PELAKSANAAN
─────────────────────────────────────────────────────────────────────
No | Uraian Pekerjaan                  | Durasi  | Minggu ke-
---|-----------------------------------|---------|-----------
1  | PERSIAPAN                         |         |
   | - Mobilisasi & Setting Out        | 2 minggu| 1-2
   | - Pembangunan direksi keet & gudang| 1 minggu| 1
   | - Pengukuran dan pematokan        | 1 minggu| 2
2  | PEKERJAAN TANAH & PONDASI        |         |
   | - Galian tanah                    | 2 minggu| 3-4
   | - Lantai kerja & pondasi          | 3 minggu| 4-6
   | - Pengujian (pile load test, dsb) | 1 minggu| 6
3  | PEKERJAAN STRUKTUR UTAMA         |         |
   | - Kolom lantai 1                  | 2 minggu| 7-8
   | - Balok & plat lantai 1           | 2 minggu| 8-9
   | - Kolom & struktur lanjutan       | 4 minggu| 10-13
4  | PEKERJAAN FINISHING              |         |
   | - Arsitektur & MEP               | 4 minggu| 14-17
   | - Pengecatan & finishing akhir    | 2 minggu| 17-18
5  | PENUTUPAN                        |         |
   | - Uji fungsi & commissioning      | 1 minggu| 19
   | - Pembersihan akhir & demobilisasi| 1 minggu| 19-20
   | - Serah terima pekerjaan (BAST-I) | 1 minggu| 20

─────────────────────────────────────────────────────────────────────
TOTAL DURASI PELAKSANAAN: 20 Minggu (140 Hari Kalender)
─────────────────────────────────────────────────────────────────────
Keterangan:
• Kurva S rencana (%) akan dilampirkan dalam format visual di dokumen resmi
• Jadwal ini dapat disesuaikan setelah SPMK diterima
• Lintasan kritis (Critical Path): Galian → Pondasi → Kolom → Atap → Finishing
• Setiap deviasi jadwal > 5% akan dibahas dalam rapat koordinasi mingguan

Monitoring & Kontrol:
• Nilai progres mingguan dilaporkan via form standar PPK/owner
• Earned Value Management (EVM) digunakan untuk deteksi deviasi dini
`,

    "SPESIFIKASI TEKNIS": `
SPESIFIKASI TEKNIS PEKERJAAN
Nama Proyek : ${doc.projectName}
Jenis       : ${doc.projectType ? ({"gedung":"Konstruksi Bangunan Gedung","infrastruktur":"Konstruksi Infrastruktur","sipil":"Pekerjaan Sipil","mekanikal":"MEP","elektrikal":"Elektrikal"}[doc.projectType] || doc.projectType) : "Konstruksi"}

A. STANDAR REFERENSI TEKNIS
   - SNI (Standar Nasional Indonesia) yang berlaku untuk setiap jenis pekerjaan
   - Spesifikasi Umum Bina Marga 2018 (untuk pekerjaan jalan & jembatan)
   - PBI 1971 / SNI 2847:2019 (untuk pekerjaan beton bertulang)
   - SNI 1729:2020 (untuk konstruksi baja)
   - PUIL 2011 (untuk instalasi listrik)
   - SMACNA (untuk instalasi ducting HVAC)

B. MUTU MATERIAL UTAMA
   Material Beton:
   - Semen   : Tipe I / OPC — SNI 15-2049-2004 (Semen Portland)
   - Pasir   : Pasir beton bersih, gradasi sesuai SNI, FM 2.3–3.1
   - Agregat : Split / koral 2/3 atau 1/2 cm — SNI 03-1750-1990
   - Air     : Air bersih bebas bahan kimia berbahaya
   - Beton readymix: sertifikat dari batching plant + slump test tiap truck
   
   Material Besi:
   - Besi beton ulir (BJTD-40) — SNI 2052:2017
   - Besi beton polos (BJTP-24) — SNI 2052:2017
   - Weld mesh: SNI yang berlaku
   
   Material Lainnya:
   - Cat: Nippon Paint, Dulux, atau setara (cat tembok, besi, kayu)
   - Keramik: Produk ber-SNI dengan toleransi dimensi ≤ 0,1%
   - Pintu/Jendela: Aluminium 3 inch ekstrusi 6063-T5 atau setara

C. PENGENDALIAN MUTU (QA/QC)
   Pengujian Rutin:
   - Compression test beton: per 50 m³ atau per tahapan struktur
   - Slump test: setiap kedatangan truck readymix
   - Uji tarik besi: per 10 ton atau setiap penggantian batch
   - Sand cone / DCP: setiap 250 m² untuk pekerjaan timbunan
   
   Dokumen Mutu:
   - ITP (Inspection & Test Plan) disepakati sebelum mulai kerja
   - NCR (Non-Conformance Report) setiap ketidaksesuaian ditemukan
   - MIR (Material Inspection Request) sebelum material digunakan
`,

    "DAFTAR PERSONIL": `
DAFTAR PERSONIL INTI PROYEK
Nama Proyek : ${doc.projectName}
Lokasi      : ${doc.projectLocation || "[Lokasi]"}

═══════════════════════════════════════════════════════════════════════════════
No | Nama               | Jabatan               | Pendidikan | SKK/Sertifikasi
===|====================|=======================|============|=================
1  | [Nama PM]          | Project Manager       | S1 Sipil   | SKK Ahli Manpro Madya
2  | [Nama SM]          | Site Manager          | S1 Sipil   | SKK Ahli Sipil Madya
3  | [Nama QC]          | Quality Control Mgr   | S1 Teknik  | SKK Ahli Mutu Konstruksi
4  | [Nama K3]          | K3 / Safety Officer   | S1/D3      | AK3 Umum / SKK K3 Konstruksi
5  | [Nama Surveyor]    | Surveyor              | D3/S1      | SKK Ahli Geodesi Muda
6  | [Nama Pelaksana 1] | Pelaksana Lapangan    | D3/SMK     | SKT Pelaksana Gedung/Sipil
7  | [Nama Pelaksana 2] | Pelaksana Lapangan    | D3/SMK     | SKT Pelaksana Gedung/Sipil
8  | [Nama Logistik]    | Logistik & Pengadaan  | D3/S1      | [Sertifikat Logistik]
9  | [Nama Admin]       | Administrasi Proyek   | D3/S1      | [Sertifikat Administrasi]
10 | [Nama Mandor]      | Mandor Lapangan       | SMK/SMA    | SKT Mandor Konstruksi
═══════════════════════════════════════════════════════════════════════════════

Keterangan Khusus PJT (Penanggung Jawab Teknis):
- PJT yang ditunjuk: [Nama] | SKK: [Nomor SKK] | Berlaku s.d: [Tanggal]
- PJT TIDAK merangkap di perusahaan/proyek lain selama masa kontrak
- Perubahan personel inti WAJIB mendapat persetujuan PPK/Owner terlebih dahulu

Catatan: CV lengkap, scan KTP, ijazah, dan SKK dilampirkan sebagai dokumen terpisah
`,

    "DAFTAR PERALATAN": `
DAFTAR PERALATAN UTAMA
Nama Proyek : ${doc.projectName}
Lokasi      : ${doc.projectLocation || "[Lokasi]"}

═══════════════════════════════════════════════════════════════════════════════════
No | Jenis Peralatan        | Merk/Type         | Kapasitas    | Jml | Kondisi | Status
===|========================|===================|==============|=====|=========|========
1  | Excavator              | Komatsu PC 200    | 0.9 m³       | 2   | Baik    | Milik
2  | Dump Truck             | Mitsubishi / Hino | 8 ton        | 4   | Baik    | Milik/Sewa
3  | Vibro Roller           | Sakai             | 8 ton        | 1   | Baik    | Sewa
4  | Concrete Pump          | Putzmeister       | 60 m³/jam    | 1   | Baik    | Sewa
5  | Concrete Mixer Truck   | Imer 3 m³         | 3 m³         | 2   | Baik    | Sewa
6  | Mobile Crane           | Tadano            | 25 ton       | 1   | Baik    | Sewa
7  | Tower Crane (jika ada) | Liebherr / XCMG   | [Kapasitas]  | 1   | Baik    | Sewa
8  | Vibrator Beton         | Wacker            | 50mm & 70mm  | 4   | Baik    | Milik
9  | Generator Set          | Caterpillar/Perkins| 80 KVA      | 1   | Baik    | Milik
10 | Welding Machine        | Lincoln/Miller    | 300 Amp      | 2   | Baik    | Milik
11 | Water Pump             | Submersible       | 50 m³/jam    | 2   | Baik    | Milik
12 | Cutting Machine        | Makita/Bosch      | [Ukuran]     | 2   | Baik    | Milik
13 | Theodolite/Total Station| Leica/Topcon     | [Presisi]    | 1   | Baik    | Milik/Sewa
═══════════════════════════════════════════════════════════════════════════════════

Catatan:
• Bukti kepemilikan (BPKB/Nota) atau kontrak sewa dilampirkan untuk peralatan utama
• Kondisi peralatan: wajib operasional saat diperlukan (tidak boleh dalam perbaikan)
• Operator bersertifikat SIO (Surat Izin Operator) untuk alat berat kategori I & II
`,

    "RENCANA K3 KONSTRUKSI": `
RENCANA KESELAMATAN KONSTRUKSI (RKK)
Nama Proyek : ${doc.projectName}
Pemberi Kerja: ${doc.clientName || "[PPK/Owner]"}
Kontraktor  : ${doc.companyName || "[Nama Perusahaan]"}

Dasar Hukum:
• UU No. 1/1970 tentang Keselamatan Kerja
• PP No. 50/2012 tentang SMK3 (Sistem Manajemen K3)
• Peraturan Menteri PUPR tentang K3 Konstruksi
• SNI ISO 45001:2018 — Sistem Manajemen K3

A. KEPEMIMPINAN & PARTISIPASI
   - Penanggung Jawab K3 Proyek: [Nama K3 Officer]
   - Sertifikasi: AK3 Umum / SKK K3 Konstruksi
   - Komitmen manajemen: Kebijakan K3 ditandatangani direktur & dipasang di proyek

B. IDENTIFIKASI BAHAYA & PENILAIAN RISIKO
   Bahaya Prioritas Tinggi Proyek Ini:
   □ Pekerjaan di ketinggian (fall from height) — Gunakan harness dan safety net
   □ Pengoperasian alat berat — operator bersertifikat, designated lane
   □ Galian dalam — shoring/bracing, rambu peringatan, barrier
   □ Pengecoran beton — koordinasi pompa, PPE lengkap operator
   □ Bahaya listrik — grounding, ELCB, kabel insulasi baik
   □ Cuaca buruk — prosedur penghentian pekerjaan pada kondisi hujan deras/petir

C. PROGRAM K3 KONSTRUKSI
   - Toolbox Meeting K3: Setiap hari sebelum mulai kerja
   - Safety Patrol: Minimal 2x seminggu oleh K3 Officer
   - APD Standar Wajib: Helm, rompi, sepatu safety, sarung tangan, kacamata
   - APAR: 1 unit per 200 m² atau per lantai
   - P3K: 1 kotak per 25 pekerja, lokasi mudah diakses
   - Simcard darurat & nomor ambulans terpasang di direksi keet

D. PENANGANAN DARURAT
   - Prosedur evakuasi terpasang di semua titik strategis
   - Jalur evakuasi diberi tanda yang jelas
   - Nomor darurat: PLN (123), Pemadam (113), Ambulans (119), Polisi (110)
   - Laporan kecelakaan ke BPJS dan instansi K3 dalam 2×24 jam

E. PELAPORAN K3
   - Form JSA (Job Safety Analysis) sebelum pekerjaan berisiko tinggi
   - Laporan insiden (nearmiss, injury, fatal) — dilaporkan segera ke PPK
   - Statistik K3 bulanan: LTIR, TRIR, DART Rate
`,

    "RINCIAN HARGA PENAWARAN": `
RINCIAN HARGA PENAWARAN (BOQ)
Nama Pekerjaan : ${doc.projectName}
Lokasi         : ${doc.projectLocation || "[Lokasi]"}
Pemberi Kerja  : ${doc.clientName || "[PPK/Owner]"}
Nomor SBU      : ${doc.sbuNumber || "[Nomor SBU]"}

═══════════════════════════════════════════════════════════════════════════════════════
No  | Uraian Pekerjaan                          | Vol  | Sat  | H.Sat (Rp) | Jumlah (Rp)
====|===========================================|======|======|============|============
I.  PEKERJAAN PERSIAPAN
1   | Mobilisasi & Demobilisasi                 | 1    | Ls   | [Nominal]  | [Nominal]
2   | Papan nama proyek                         | 1    | Bh   | [Nominal]  | [Nominal]
3   | Barak kerja, gudang, direksi keet         | 1    | Ls   | [Nominal]  | [Nominal]
4   | Pengukuran & bowplank                     | 1    | Ls   | [Nominal]  | [Nominal]
    | SUB-TOTAL I                               |      |      |            | [Sub-Total]

II. PEKERJAAN TANAH
5   | Galian tanah biasa (sedalam [X] m)        | [Vol]| m³   | [Nominal]  | [Nominal]
6   | Galian tanah keras (sedalam [X] m)        | [Vol]| m³   | [Nominal]  | [Nominal]
7   | Urugan sirtu padat                        | [Vol]| m³   | [Nominal]  | [Nominal]
8   | Buangan tanah galian                      | [Vol]| m³   | [Nominal]  | [Nominal]
    | SUB-TOTAL II                              |      |      |            | [Sub-Total]

III. PEKERJAAN PONDASI & STRUKTUR
9   | Beton lantai kerja K-100 t=5cm            | [Vol]| m³   | [Nominal]  | [Nominal]
10  | Beton pondasi K-250 / K-300               | [Vol]| m³   | [Nominal]  | [Nominal]
11  | Besi tulangan ulir D-19 / D-22            | [Vol]| kg   | [Nominal]  | [Nominal]
12  | Bekisting pondasi (plywood 9mm)           | [Vol]| m²   | [Nominal]  | [Nominal]
13  | Beton kolom K-300 sesuai dimensi          | [Vol]| m³   | [Nominal]  | [Nominal]
14  | Beton balok & plat lantai K-300           | [Vol]| m³   | [Nominal]  | [Nominal]
    | SUB-TOTAL III                             |      |      |            | [Sub-Total]

IV. PEKERJAAN ARSITEKTUR (jika pekerjaan gedung)
15  | Pasangan bata ringan t=10cm               | [Vol]| m²   | [Nominal]  | [Nominal]
16  | Plesteran + Acian dinding                 | [Vol]| m²   | [Nominal]  | [Nominal]
17  | Pemasangan keramik lantai 60x60cm         | [Vol]| m²   | [Nominal]  | [Nominal]
18  | Pemasangan keramik dinding KM/WC          | [Vol]| m²   | [Nominal]  | [Nominal]
19  | Pengecatan dinding dalam & luar           | [Vol]| m²   | [Nominal]  | [Nominal]
20  | Pintu & jendela aluminium                 | [Vol]| m²   | [Nominal]  | [Nominal]
    | SUB-TOTAL IV                              |      |      |            | [Sub-Total]

V.  PEKERJAAN MEP (Mekanikal, Elektrikal, Plumbing)
21  | Instalasi listrik lengkap                 | 1    | Ls   | [Nominal]  | [Nominal]
22  | Instalasi air bersih & air kotor          | 1    | Ls   | [Nominal]  | [Nominal]
23  | Instalasi fire fighting (hydrant/sprinkler)| 1   | Ls   | [Nominal]  | [Nominal]
24  | Tata udara (AC / HVAC)                    | 1    | Ls   | [Nominal]  | [Nominal]
    | SUB-TOTAL V                               |      |      |            | [Sub-Total]

═══════════════════════════════════════════════════════════════════════════════════════
    | JUMLAH TOTAL SEBELUM PPN                  |      |      |            | [Nominal]
    | PPN 11%                                   |      |      |            | [Nominal]
    | JUMLAH TOTAL TERMASUK PPN                 |      |      |            | ${doc.projectValue || "[TOTAL PENAWARAN]"}
═══════════════════════════════════════════════════════════════════════════════════════

Terbilang: ${doc.projectValue ? "[Terbilang dalam huruf sesuai nilai penawaran]" : "[Nilai total dalam huruf]"}

Catatan:
- Analisa harga satuan terlampir mengacu pada AHSP (Analisa Harga Satuan Pekerjaan) Kementerian PUPR Terbaru
- Harga satuan sudah termasuk biaya tenaga kerja, material, peralatan, overhead, dan profit
- Volume pekerjaan berdasarkan gambar rencana yang tersedia; kontraktor bertanggung jawab untuk verifikasi lapangan
`,

    "ANALISA HARGA SATUAN": `
ANALISA HARGA SATUAN PEKERJAAN (AHSP)
Referensi: AHSP Bidang Cipta Karya & Binamarga Kementerian PUPR (Terbaru)
Proyek: ${doc.projectName}

════════════════════════════════════════════════════════════════════
ANALISA 1 — BETON MUTU K-300 PER M³ (Campuran Readymix)
════════════════════════════════════════════════════════════════════
A. BAHAN
   No | Uraian              | Koef. | Sat | H.Satuan (Rp) | Jumlah (Rp)
   ---|---------------------|-------|-----|---------------|------------
   1  | Beton readymix K-300 | 1.05 | m³  | [Rp/m³]      | [Nominal]
   2  | Besi beton ulir D-13 | 150  | kg  | [Rp/kg]      | [Nominal]
   3  | Kawat beton 1,6mm   | 2.25  | kg  | [Rp/kg]      | [Nominal]
   4  | Bekisting plywood   | 2.00  | m²  | [Rp/m²]      | [Nominal]
      |                     |       |     | TOTAL BAHAN   | [Nominal]

B. UPAH
   No | Jabatan             | Koef. | Sat | Upah (Rp)    | Jumlah (Rp)
   ---|---------------------|-------|-----|---------------|------------
   1  | Pekerja (Kelas A)   | 1.65  | OH  | [Rp/OH]      | [Nominal]
   2  | Tukang Beton        | 0.28  | OH  | [Rp/OH]      | [Nominal]
   3  | Kepala Tukang Beton | 0.028 | OH  | [Rp/OH]      | [Nominal]
   4  | Mandor              | 0.083 | OH  | [Rp/OH]      | [Nominal]
      |                     |       |     | TOTAL UPAH   | [Nominal]

C. PERALATAN
   No | Peralatan           | Koef. | Sat | Sewa (Rp)    | Jumlah (Rp)
   ---|---------------------|-------|-----|---------------|------------
   1  | Vibrator beton      | 0.33  | jam | [Rp/jam]     | [Nominal]
   2  | Water pump          | 0.08  | jam | [Rp/jam]     | [Nominal]
      |                     |       |     | TOTAL ALAT   | [Nominal]

   TOTAL A + B + C          =                              [Nominal]
   OVERHEAD (10%)           =                              [Nominal]
   PROFIT (10%)             =                              [Nominal]
   ════════════════════════════════════════════════════════════════════
   HARGA SATUAN PEKERJAAN   =                              [Rp/m³]

════════════════════════════════════════════════════════════════════
ANALISA 2 — PASANGAN BATA RINGAN (AAC) PER M²
════════════════════════════════════════════════════════════════════
A. BAHAN
   1 | Bata ringan AAC 60x20x10cm | 8.33 | bh  | [Rp/bh]  | [Nominal]
   2 | Mortar semen instan        | 11.5 | kg  | [Rp/kg]  | [Nominal]
     |                            |      |     | SUB-BAHAN | [Nominal]

B. UPAH
   1 | Pekerja             | 0.25  | OH  | [Rp/OH]   | [Nominal]
   2 | Tukang Batu         | 0.10  | OH  | [Rp/OH]   | [Nominal]
   3 | Mandor              | 0.01  | OH  | [Rp/OH]   | [Nominal]
     |                     |       |     | SUB-UPAH  | [Nominal]

   TOTAL (Bahan + Upah)    =                         [Nominal]
   Overhead + Profit (20%) =                         [Nominal]
   ════════════════════════════════════════════════════════════════════
   HARGA SATUAN PASANGAN   =                         [Rp/m²]

════════════════════════════════════════════════════════════════════
ANALISA 3 — PENGECATAN DINDING DALAM PER M²
════════════════════════════════════════════════════════════════════
A. BAHAN (3 lapis: 1 plamur + 1 undercoat + 2 topcoat)
   1 | Cat plamur           | 0.10  | kg  | [Rp/kg]  | [Nominal]
   2 | Cat dasar (undercoat)| 0.10  | L   | [Rp/L]   | [Nominal]
   3 | Cat akhir (topcoat)  | 0.20  | L   | [Rp/L]   | [Nominal]
     |                      |       |     | SUB-BAHAN | [Nominal]

B. UPAH
   1 | Pekerja             | 0.05  | OH  | [Rp/OH]   | [Nominal]
   2 | Tukang Cat          | 0.06  | OH  | [Rp/OH]   | [Nominal]
   3 | Mandor              | 0.006 | OH  | [Rp/OH]   | [Nominal]
     |                     |       |     | SUB-UPAH  | [Nominal]

   TOTAL (Bahan + Upah)    =                         [Nominal]
   Overhead + Profit (15%) =                         [Nominal]
   ════════════════════════════════════════════════════════════════════
   HARGA SATUAN PENGECATAN =                         [Rp/m²]
`,

    "REKAPITULASI BIAYA": `
REKAPITULASI BIAYA PENAWARAN
Nama Pekerjaan : ${doc.projectName}
Lokasi         : ${doc.projectLocation || "[Lokasi]"}
Pemberi Kerja  : ${doc.clientName || "[PPK/Owner]"}
Kontraktor     : ${doc.companyName || "[Nama Perusahaan]"}
NPWP           : ${doc.npwp || "[Nomor NPWP]"}
Nomor SBU      : ${doc.sbuNumber || "[Nomor SBU]"}

════════════════════════════════════════════════════════════════════
No  | Uraian                                          | Jumlah (Rp)
====|=================================================|=============
I   | PEKERJAAN PERSIAPAN                             | [Nominal]
II  | PEKERJAAN TANAH                                 | [Nominal]
III | PEKERJAAN PONDASI & STRUKTUR                    | [Nominal]
IV  | PEKERJAAN ARSITEKTUR                            | [Nominal]
V   | PEKERJAAN MEP (ME & Plumbing)                   | [Nominal]
VI  | PEKERJAAN JALAN & SARANA LUAR (jika ada)        | [Nominal]
VII | PEKERJAAN K3 KONSTRUKSI                         | [Nominal]
    |─────────────────────────────────────────────────|─────────────
    | TOTAL BIAYA LANGSUNG (Direct Cost)              | [Nominal]
════════════════════════════════════════════════════════════════════

RINCIAN KOMPONEN BIAYA:
1. Biaya Material                  :  [X]%  = Rp [Nominal]
2. Biaya Tenaga Kerja Langsung     :  [X]%  = Rp [Nominal]
3. Biaya Peralatan & Sewa          :  [X]%  = Rp [Nominal]
   ─────────────────────────────────────────────────────────────
   SUB-TOTAL BIAYA LANGSUNG        :         = Rp [Nominal]

4. Overhead Kantor (5%)            :          = Rp [Nominal]
5. Overhead Lapangan (5%)          :          = Rp [Nominal]
6. Biaya Administrasi & Jaminan    :          = Rp [Nominal]
7. Asuransi (CAR + JAMSOSTEK)      :          = Rp [Nominal]
   ─────────────────────────────────────────────────────────────
   SUB-TOTAL BIAYA TAK LANGSUNG    :          = Rp [Nominal]

8. Keuntungan / Profit (10%)       :          = Rp [Nominal]

════════════════════════════════════════════════════════════════════
   TOTAL SEBELUM PPN               :          = Rp [Nominal]
   PPN 11%                         :          = Rp [Nominal]
════════════════════════════════════════════════════════════════════
   NILAI PENAWARAN (TOTAL)         :          = Rp ${doc.projectValue || "[TOTAL PENAWARAN]"}
════════════════════════════════════════════════════════════════════

Terbilang: ${doc.projectValue ? "[Nilai terbilang dalam huruf]" : "[Nilai total penawaran dalam huruf]"}

Catatan:
• Nilai penawaran ini sudah final dan mengikat sesuai ketentuan dokumen pemilihan
• Rincian analisa harga satuan terlampir dalam dokumen terpisah
• Jaminan Penawaran (Bid Bond): [Nominal] — diterbitkan oleh [Bank/Surety]
• Masa jaminan: 90 hari kalender dari tanggal pemasukan penawaran

${doc.projectLocation || "[Kota]"}, ${today}

${doc.companyName || "[Nama Perusahaan]"}


Materai Rp 10.000,-


${doc.directorName || "[Nama Direktur]"}
Direktur
`,

    "SURAT KUASA": `
SURAT KUASA
Nomor: ${doc.companyName ? doc.companyName.substring(0, 3).toUpperCase() : "PT"}/SK/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}

${doc.projectLocation || "[Kota]"}, ${today}

Yang bertanda tangan di bawah ini:

Nama           : ${doc.directorName || "[Nama Direktur]"}
Jabatan        : Direktur ${doc.companyName || "[Nama Perusahaan]"}
Alamat Kantor  : ${doc.companyAddress || "[Alamat Perusahaan]"}
No. KTP        : [Nomor KTP Direktur]

Yang selanjutnya disebut sebagai PEMBERI KUASA, dengan ini memberikan KUASA kepada:

Nama           : [Nama Penerima Kuasa]
Jabatan        : [Jabatan Resmi di Perusahaan]
No. KTP        : [Nomor KTP Penerima Kuasa]
NPWP Pribadi   : [Nomor NPWP Penerima Kuasa]

Yang selanjutnya disebut sebagai PENERIMA KUASA

Untuk dan atas nama PEMBERI KUASA, PENERIMA KUASA diberi kuasa penuh untuk:
1. Menghadiri seluruh proses pengadaan pekerjaan "${doc.projectName}"
   yang diselenggarakan oleh ${doc.clientName || "[PPK/Panitia Pengadaan]"}
2. Menandatangani dokumen-dokumen administrasi dan teknis yang diperlukan
3. Mengajukan dan mengambil dokumen pengadaan
4. Melakukan klarifikasi teknis jika diperlukan
5. Mewakili perusahaan dalam seluruh tahapan proses lelang

Surat kuasa ini berlaku sejak ditandatangani hingga proses pengadaan selesai.
Segala sesuatu yang dilakukan oleh PENERIMA KUASA dalam batas wewenang di atas 
menjadi tanggung jawab penuh PEMBERI KUASA.

Demikian Surat Kuasa ini dibuat dengan sebenarnya untuk dipergunakan 
sebagaimana mestinya.

PEMBERI KUASA                            PENERIMA KUASA


Materai Rp 10.000,-


${doc.directorName || "[Nama Direktur]"}               [Nama Penerima Kuasa]
Direktur                                  [Jabatan]
`,

    "SURAT PERNYATAAN": `
SURAT PERNYATAAN BADAN USAHA
Nomor: ${doc.companyName ? doc.companyName.substring(0, 3).toUpperCase() : "PT"}/SP/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}

Yang bertanda tangan di bawah ini:

Nama           : ${doc.directorName || "[Nama Direktur]"}
Jabatan        : Direktur
Perusahaan     : ${doc.companyName || "[Nama Perusahaan]"}
Alamat         : ${doc.companyAddress || "[Alamat Perusahaan]"}
NPWP Perusahaan: ${doc.npwp || "[Nomor NPWP]"}
Nomor SBU      : ${doc.sbuNumber || "[Nomor SBU]"}
Klasifikasi    : ${doc.sbuClassification || "[Klasifikasi SBU]"}

Dalam rangka mengikuti pengadaan pekerjaan:
"${doc.projectName}"
Yang diselenggarakan oleh: ${doc.clientName || "[PPK/Panitia Pengadaan]"}

Dengan ini menyatakan bahwa:

1. Badan usaha yang saya wakili TIDAK SEDANG dalam proses pengawasan pengadilan 
   atas permohonan pailit atau kebangkrutan.

2. Kegiatan usaha badan usaha TIDAK SEDANG dihentikan, dibekukan, atau dicabut 
   izin usahanya oleh pihak berwenang.

3. Badan usaha dan jajaran direksi/pengurus TIDAK SEDANG menjalani sanksi 
   pidana berupa hukuman penjara yang memengaruhi operasional perusahaan.

4. Badan usaha dan seluruh pengurus TIDAK MASUK dalam Daftar Hitam (Blacklist) 
   yang dikelola oleh LKPP (Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah).

5. Badan usaha TIDAK SEDANG memiliki pertentangan kepentingan (conflict of interest) 
   dalam paket pekerjaan yang diikuti ini.

6. Data, dokumen, dan informasi yang kami sampaikan dalam dokumen penawaran 
   adalah BENAR, LENGKAP, dan DAPAT DIPERTANGGUNGJAWABKAN.

7. Apabila dikemudian hari ditemukan bahwa pernyataan ini TIDAK BENAR, kami 
   bersedia:
   a. Dikenai sanksi sesuai peraturan yang berlaku
   b. Didaftar-hitamkan selama 2 (dua) tahun dalam pengadaan pemerintah
   c. Dituntut secara hukum atas pemalsuan dokumen

Demikian surat pernyataan ini dibuat dengan sebenarnya, di atas materai, 
untuk digunakan sebagaimana mestinya.

${doc.projectLocation || "[Kota]"}, ${today}

Yang membuat pernyataan,
${doc.companyName || "[Nama Perusahaan]"}


Materai Rp 10.000,-


${doc.directorName || "[Nama Direktur]"}
Direktur

Mengetahui & Menyetujui,
[Jabatan yang berwenang]

_______________________
[Nama & Jabatan]
`,
  };

  return templates[section] || `\n[Isi dokumen ${section} akan dilengkapi sesuai kebutuhan proyek — hubungi tim DokumenProyek.com untuk pendampingan]\n`;
}
