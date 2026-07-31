import { pgTable, text, serial, timestamp, boolean, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Modules table for ecosystem section
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  icon: text("icon").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull(),
  type: text("type").default("default"), // default, featured, safety, circular
  featuredLabel: text("featured_label"),
  anchorId: text("anchor_id"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// User roles table
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  icon: text("icon").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true });
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

// Benefits table for "Why Choose Us" section
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const insertBenefitSchema = createInsertSchema(benefits).omit({ id: true });
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;
export type Benefit = typeof benefits.$inferSelect;

// Hero content table
export const heroContent = pgTable("hero_content", {
  id: serial("id").primaryKey(),
  badge: text("badge").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  primaryButtonText: text("primary_button_text").notNull(),
  secondaryButtonText: text("secondary_button_text").notNull(),
  backgroundImage: text("background_image"),
  isActive: boolean("is_active").default(true),
});

export const insertHeroContentSchema = createInsertSchema(heroContent).omit({ id: true });
export type InsertHeroContent = z.infer<typeof insertHeroContentSchema>;
export type HeroContent = typeof heroContent.$inferSelect;

// CTA section content
export const ctaContent = pgTable("cta_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  primaryButtonText: text("primary_button_text").notNull(),
  secondaryButtonText: text("secondary_button_text").notNull(),
  isActive: boolean("is_active").default(true),
});

export const insertCtaContentSchema = createInsertSchema(ctaContent).omit({ id: true });
export type InsertCtaContent = z.infer<typeof insertCtaContentSchema>;
export type CtaContent = typeof ctaContent.$inferSelect;

// Stakeholder types
export const stakeholderTypes = ["kontraktor", "konsultan", "vendor", "supplier", "tenaga_kerja", "masyarakat"] as const;
export type StakeholderType = typeof stakeholderTypes[number];

// User profiles table - extended info for stakeholders
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  stakeholderType: text("stakeholder_type").notNull(),
  companyName: text("company_name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  description: text("description"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// Opportunities table - tender, project, jobs
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // tender, subcontract, supply, rental, labor
  location: text("location"),
  budget: text("budget"),
  deadline: timestamp("deadline"),
  requirements: text("requirements").array(),
  targetStakeholders: text("target_stakeholders").array(),
  status: text("status").default("open"), // open, closed, awarded
  postedBy: varchar("posted_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, createdAt: true });
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

// Products/Services for marketplace
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: varchar("seller_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // material, equipment, service
  price: text("price"),
  unit: text("unit"),
  location: text("location"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders for marketplace (with escrow status)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  buyerId: varchar("buyer_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  quantity: integer("quantity").default(1),
  totalPrice: text("total_price"),
  status: text("status").default("pending"), // pending, paid, escrow, shipped, delivered, completed, cancelled, refunded
  paymentMethod: text("payment_method"),
  shippingAddress: text("shipping_address"),
  notes: text("notes"),
  escrowReleased: boolean("escrow_released").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Tender Documents
export const tenderDocuments = pgTable("tender_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  projectName: text("project_name").notNull(),
  projectType: text("project_type").notNull(), // gedung, infrastruktur, sipil, mekanikal, elektrikal
  projectValue: text("project_value"),
  projectLocation: text("project_location"),
  clientName: text("client_name"),
  deadline: timestamp("deadline"),
  documentType: text("document_type").notNull(), // administrasi, teknis, harga, semua
  companyName: text("company_name"),
  companyAddress: text("company_address"),
  npwp: text("npwp"),
  sbuNumber: text("sbu_number"),
  sbuClassification: text("sbu_classification"),
  directorName: text("director_name"),
  generatedContent: text("generated_content"),
  status: text("status").default("draft"), // draft, generated, submitted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTenderDocumentSchema = createInsertSchema(tenderDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTenderDocument = z.infer<typeof insertTenderDocumentSchema>;
export type TenderDocument = typeof tenderDocuments.$inferSelect;

// Projects for monitoring
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  clientName: text("client_name"),
  location: text("location"),
  contractValue: text("contract_value"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("planning"), // planning, ongoing, completed, delayed, cancelled
  progress: integer("progress").default(0), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Project Progress Updates
export const projectUpdates = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  progressDelta: integer("progress_delta").default(0), // % change
  updateType: text("update_type").default("progress"), // progress, issue, milestone, expense
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectUpdateSchema = createInsertSchema(projectUpdates).omit({ id: true, createdAt: true });
export type InsertProjectUpdate = z.infer<typeof insertProjectUpdateSchema>;
export type ProjectUpdate = typeof projectUpdates.$inferSelect;

// Financial Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  projectId: integer("project_id"),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(), // material, labor, equipment, overhead, payment_received, etc.
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // in smallest unit (rupiah)
  date: timestamp("date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Equipment Rental
export const equipments = pgTable("equipments", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // excavator, crane, truck, mixer, scaffolding, etc.
  brand: text("brand"),
  model: text("model"),
  yearManufactured: integer("year_manufactured"),
  condition: text("condition").notNull(), // excellent, good, fair
  description: text("description"),
  dailyRate: integer("daily_rate").notNull(), // per day in rupiah
  weeklyRate: integer("weekly_rate"), // optional
  monthlyRate: integer("monthly_rate"), // optional
  location: text("location").notNull(),
  specifications: text("specifications"), // JSON string
  images: text("images").array(),
  availability: text("availability").default("available"), // available, rented, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEquipmentSchema = createInsertSchema(equipments).omit({ id: true, createdAt: true });
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipments.$inferSelect;

// Equipment Rentals (Bookings)
export const equipmentRentals = pgTable("equipment_rentals", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").notNull(),
  renterId: varchar("renter_id").notNull(),
  ownerId: varchar("owner_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending"), // pending, confirmed, active, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEquipmentRentalSchema = createInsertSchema(equipmentRentals).omit({ id: true, createdAt: true });
export type InsertEquipmentRental = z.infer<typeof insertEquipmentRentalSchema>;
export type EquipmentRental = typeof equipmentRentals.$inferSelect;

// ─── Consultations ─────────────────────────────────────────────────────────
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  serviceType: text("service_type").notNull(), // legalitas | perizinan | sbu | skk | iso-smk3 | tender | proyek
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  companyName: text("company_name"),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending | contacted | in_progress | completed | cancelled
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;

// ─── Generated Documents ───────────────────────────────────────────────────
export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  templateId: text("template_id").notNull(),
  templateName: text("template_name").notNull(),
  kategori: text("kategori").notNull(), // tender | proyek | umum
  formData: text("form_data").notNull(), // JSON string
  generatedContent: text("generated_content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments).omit({ id: true, createdAt: true });
export type InsertGeneratedDocument = z.infer<typeof insertGeneratedDocumentSchema>;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;

// ─── Notifications ─────────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"), // info | warning | success | error
  isRead: boolean("is_read").default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ─── Agent Chat Sessions ───────────────────────────────────────────────────
export const agentSessions = pgTable("agent_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  activeAgents: text("active_agents").array(),
  status: text("status").default("active"), // active | archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAgentSessionSchema = createInsertSchema(agentSessions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAgentSession = z.infer<typeof insertAgentSessionSchema>;
export type AgentSession = typeof agentSessions.$inferSelect;

// ─── Agent Chat Messages ───────────────────────────────────────────────────
export const agentMessages = pgTable("agent_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(), // user | orchestrator | agent
  agentId: text("agent_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAgentMessageSchema = createInsertSchema(agentMessages).omit({ id: true, createdAt: true });
export type InsertAgentMessage = z.infer<typeof insertAgentMessageSchema>;
export type AgentMessage = typeof agentMessages.$inferSelect;

// ─── Document Verifications ────────────────────────────────────────────────
export const documentVerifications = pgTable("document_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  documentType: text("document_type").notNull(), // sbu | skk | nib | npwp | kontrak | lainnya
  documentNumber: text("document_number").notNull(),
  issuerName: text("issuer_name"),
  holderName: text("holder_name").notNull(),
  requestNotes: text("request_notes"),
  status: text("status").default("pending"), // pending | verified | not_found | expired | invalid
  verificationResult: text("verification_result"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentVerificationSchema = createInsertSchema(documentVerifications).omit({ id: true, createdAt: true, verifiedAt: true });
export type InsertDocumentVerification = z.infer<typeof insertDocumentVerificationSchema>;
export type DocumentVerification = typeof documentVerifications.$inferSelect;

// ─── AI Chat Sessions ──────────────────────────────────────────────────────
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull().default("Percakapan Baru"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

// ─── AI Chat Messages ──────────────────────────────────────────────────────
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// ─── Saved Calculations (Mini Apps) ───────────────────────────────────────
export const savedCalculations = pgTable("saved_calculations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  calcType: text("calc_type").notNull(), // jaminan | denda | hps | ahsp | boq | termin | punchlist | threshold
  title: text("title").notNull(),
  inputData: text("input_data").notNull(), // JSON string
  resultSummary: text("result_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedCalculationSchema = createInsertSchema(savedCalculations).omit({ id: true, createdAt: true });
export type InsertSavedCalculation = z.infer<typeof insertSavedCalculationSchema>;
export type SavedCalculation = typeof savedCalculations.$inferSelect;

// ─── Project Documents (AI Query) ────────────────────────────────────────────
export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  contentText: text("content_text").notNull(),
  summaryText: text("summary_text"), // Cached AI summary (3-5 bullet points)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectDocumentSchema = createInsertSchema(projectDocuments).omit({ id: true, createdAt: true });
export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;
export type ProjectDocument = typeof projectDocuments.$inferSelect;

// ─── Document Chat Messages (AI Dokumen history) ──────────────────────────────
export const documentChatMessages = pgTable("document_chat_messages", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => projectDocuments.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentChatMessageSchema = createInsertSchema(documentChatMessages).omit({ id: true, createdAt: true });
export type InsertDocumentChatMessage = z.infer<typeof insertDocumentChatMessageSchema>;
export type DocumentChatMessage = typeof documentChatMessages.$inferSelect;

// ─── Klinik Konsultasi ────────────────────────────────────────────────────────
export const consultationCases = pgTable("consultation_cases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  serviceType: text("service_type").notNull(), // sbu|skk|legalitas|perizinan|iso|tender|proyek|umum
  status: text("status").default("open").notNull(), // open|analyzing|in_review|completed|closed
  description: text("description"),
  aiAnalysis: text("ai_analysis"),
  priority: text("priority").default("normal").notNull(), // normal|urgent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultationCaseMessages = pgTable("consultation_case_messages", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  role: text("role").notNull(), // user|ai
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConsultationCaseSchema = createInsertSchema(consultationCases).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConsultationCase = z.infer<typeof insertConsultationCaseSchema>;
export type ConsultationCase = typeof consultationCases.$inferSelect;

export const insertConsultationCaseMessageSchema = createInsertSchema(consultationCaseMessages).omit({ id: true, createdAt: true });
export type InsertConsultationCaseMessage = z.infer<typeof insertConsultationCaseMessageSchema>;
export type ConsultationCaseMessage = typeof consultationCaseMessages.$inferSelect;

// ─── Ekosistem Kompetensi ─────────────────────────────────────────────────────
export const userCompetencies = pgTable("user_competencies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),           // skk | sbu
  name: text("name").notNull(),           // e.g. "Ahli Teknik Bangunan Gedung"
  level: text("level"),                   // SKK: Muda/Madya/Utama | SBU: K1/K2/M1/M2/B1/B2
  subclassification: text("subclassification"), // Kode KBLI / bidang
  certificateNumber: text("certificate_number"),
  issuer: text("issuer"),                 // LPJK / LSP / etc.
  issuedDate: timestamp("issued_date"),
  expiryDate: timestamp("expiry_date"),
  status: text("status").default("active").notNull(), // active|expired|expiring_soon|pending
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserCompetencySchema = createInsertSchema(userCompetencies).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserCompetency = z.infer<typeof insertUserCompetencySchema>;
export type UserCompetency = typeof userCompetencies.$inferSelect;

// ─── Workroom ─────────────────────────────────────────────────────────────────
export const workrooms = pgTable("workrooms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // tender | perizinan | sbu | k3 | sertifikasi
  name: text("name").notNull(),
  currentStage: integer("current_stage").notNull().default(0),
  status: text("status").notNull().default("active"), // active | completed
  stageData: text("stage_data").notNull().default("{}"), // JSON
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWorkroomSchema = createInsertSchema(workrooms).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkroom = z.infer<typeof insertWorkroomSchema>;
export type Workroom = typeof workrooms.$inferSelect;

// ─── MultiClaw Monitoring ─────────────────────────────────────────────────────
export const monitoringSessions = pgTable("monitoring_sessions", {
  id: serial("id").primaryKey(),
  team: text("team").notNull(),             // sbu-skk | bujk | tender | freelance
  triggeredBy: text("triggered_by").notNull().default("manual"), // manual | schedule
  userId: text("user_id"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull().default("running"), // running | completed | failed
  summary: text("summary"),
  findingsCount: integer("findings_count").default(0),
});

export const monitoringFindings = pgTable("monitoring_findings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  team: text("team").notNull(),
  category: text("category"),
  title: text("title").notNull(),
  description: text("description"),
  urgency: text("urgency").default("info"),  // high | medium | low | info
  sourceUrl: text("source_url"),
  entityName: text("entity_name"),
  entityCode: text("entity_code"),
  expiryDate: text("expiry_date"),
  extraData: text("extra_data"),             // JSON string
  createdAt: timestamp("created_at").defaultNow(),
});

export const freelanceListings = pgTable("freelance_listings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  listingType: text("listing_type").notNull(), // offer (SKK cari kerja) | seek (BUJK cari SKK)
  category: text("category").notNull(),        // SKK | BUJK
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  contact: text("contact"),
  budget: text("budget"),
  requirements: text("requirements"),
  status: text("status").default("active"),   // active | closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMonitoringSessionSchema = createInsertSchema(monitoringSessions).omit({ id: true, startedAt: true });
export type InsertMonitoringSession = z.infer<typeof insertMonitoringSessionSchema>;
export type MonitoringSession = typeof monitoringSessions.$inferSelect;

export const insertMonitoringFindingSchema = createInsertSchema(monitoringFindings).omit({ id: true, createdAt: true });
export type InsertMonitoringFinding = z.infer<typeof insertMonitoringFindingSchema>;
export type MonitoringFinding = typeof monitoringFindings.$inferSelect;

export const insertFreelanceListingSchema = createInsertSchema(freelanceListings).omit({ id: true, createdAt: true });
export type InsertFreelanceListing = z.infer<typeof insertFreelanceListingSchema>;
export type FreelanceListing = typeof freelanceListings.$inferSelect;

// ─── Business Memory ──────────────────────────────────────────────────────────
// Stores past business failures, patterns, and risks so the platform can
// proactively warn users when they repeat potentially costly mistakes.
export const MEMORY_CATEGORIES = [
  "kegagalan_tender",
  "dokumen_kadaluarsa",
  "penolakan_sbu",
  "penolakan_skk",
  "masalah_perizinan",
  "kegagalan_proyek",
  "risiko_kontrak",
  "catatan_vendor",
  "lainnya",
] as const;
export type MemoryCategory = typeof MEMORY_CATEGORIES[number];

export const businessMemory = pgTable("business_memory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(), // one of MEMORY_CATEGORIES
  title: text("title").notNull(),        // short summary shown in warning banners
  description: text("description").notNull(), // full detail, used by AI
  tags: text("tags").array(),            // optional: serviceType tags e.g. ["sbu","tender"]
  isActive: boolean("is_active").default(true).notNull(), // user can archive entries
  eventDate: timestamp("event_date"),    // when the event occurred (optional)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBusinessMemorySchema = createInsertSchema(businessMemory).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBusinessMemory = z.infer<typeof insertBusinessMemorySchema>;
export type BusinessMemory = typeof businessMemory.$inferSelect;

// ─── Pipeline Sessions (TenderaClaw & SBUClaw) ────────────────────────────────
export const pipelineSessions = pgTable("pipeline_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  pipelineType: text("pipeline_type").notNull(), // tendera | sbu
  title: text("title").notNull(),                // auto-generated from input
  stage: integer("stage").notNull().default(0),
  inputData: text("input_data").notNull().default("{}"),   // JSON string
  results: text("results").notNull().default("{}"),        // JSON string keyed by stage number
  draftType: text("draft_type"),                // TenderaClaw only
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPipelineSessionSchema = createInsertSchema(pipelineSessions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPipelineSession = z.infer<typeof insertPipelineSessionSchema>;
export type PipelineSession = typeof pipelineSessions.$inferSelect;
