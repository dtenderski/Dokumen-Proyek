import { 
  contactMessages, 
  modules, 
  userRoles, 
  benefits, 
  heroContent, 
  ctaContent,
  userProfiles,
  opportunities,
  products,
  orders,
  tenderDocuments,
  type ContactMessage, 
  type InsertContactMessage,
  type Module,
  type InsertModule,
  type UserRole,
  type InsertUserRole,
  type Benefit,
  type InsertBenefit,
  type HeroContent,
  type InsertHeroContent,
  type CtaContent,
  type InsertCtaContent,
  type UserProfile,
  type InsertUserProfile,
  type Opportunity,
  type InsertOpportunity,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type TenderDocument,
  type InsertTenderDocument,
  type Project,
  type InsertProject,
  type ProjectUpdate,
  type InsertProjectUpdate,
  projects,
  projectUpdates,
  transactions,
  type Transaction,
  type InsertTransaction,
  equipments,
  type Equipment,
  type InsertEquipment,
  equipmentRentals,
  type EquipmentRental,
  type InsertEquipmentRental,
  consultations,
  type Consultation,
  type InsertConsultation,
  generatedDocuments,
  type GeneratedDocument,
  type InsertGeneratedDocument,
  notifications,
  type Notification,
  type InsertNotification,
  agentSessions,
  type AgentSession,
  type InsertAgentSession,
  agentMessages,
  type AgentMessage,
  type InsertAgentMessage,
  documentVerifications,
  type DocumentVerification,
  type InsertDocumentVerification,
  savedCalculations,
  type SavedCalculation,
  type InsertSavedCalculation,
  chatSessions,
  type ChatSession,
  type InsertChatSession,
  chatMessages,
  type ChatMessage,
  type InsertChatMessage,
  projectDocuments,
  type ProjectDocument,
  type InsertProjectDocument,
  documentChatMessages,
  type DocumentChatMessage,
  type InsertDocumentChatMessage,
  userCompetencies,
  type UserCompetency,
  type InsertUserCompetency,
  consultationCases,
  type ConsultationCase,
  type InsertConsultationCase,
  consultationCaseMessages,
  type ConsultationCaseMessage,
  type InsertConsultationCaseMessage,
  workrooms,
  type Workroom,
  type InsertWorkroom,
  monitoringSessions,
  type MonitoringSession,
  type InsertMonitoringSession,
  monitoringFindings,
  type MonitoringFinding,
  type InsertMonitoringFinding,
  freelanceListings,
  type FreelanceListing,
  type InsertFreelanceListing,
  businessMemory,
  type BusinessMemory,
  type InsertBusinessMemory,
  pipelineSessions,
  type PipelineSession,
  type InsertPipelineSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, desc, lt, and, sql } from "drizzle-orm";

export interface IStorage {
  // Contact
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Modules
  getModules(): Promise<Module[]>;
  createModule(module: InsertModule): Promise<Module>;
  
  // User Roles
  getUserRoles(): Promise<UserRole[]>;
  createUserRole(role: InsertUserRole): Promise<UserRole>;
  
  // Benefits
  getBenefits(): Promise<Benefit[]>;
  createBenefit(benefit: InsertBenefit): Promise<Benefit>;
  
  // Hero
  getHeroContent(): Promise<HeroContent | null>;
  createHeroContent(hero: InsertHeroContent): Promise<HeroContent>;
  
  // CTA
  getCtaContent(): Promise<CtaContent | null>;
  createCtaContent(cta: InsertCtaContent): Promise<CtaContent>;
  
  // User Profiles
  getUserProfile(userId: string): Promise<UserProfile | null>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | null>;
  
  // Opportunities
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | null>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | null>;
  getProductsByUser(userId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByBuyer(buyerId: string): Promise<Order[]>;
  getOrdersBySeller(sellerId: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | null>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string, escrowReleased?: boolean): Promise<Order | null>;
  
  // Tender Documents
  getTenderDocumentsByUser(userId: string): Promise<TenderDocument[]>;
  getTenderDocument(id: number): Promise<TenderDocument | null>;
  createTenderDocument(doc: InsertTenderDocument): Promise<TenderDocument>;
  updateTenderDocument(id: number, doc: Partial<InsertTenderDocument>): Promise<TenderDocument | null>;
  
  // Projects
  getProjectsByUser(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | null>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | null>;
  
  // Project Updates
  getProjectUpdates(projectId: number): Promise<ProjectUpdate[]>;
  createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate>;
  
  // Financial Transactions
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | null>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | null>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Equipment Rental
  getAllEquipments(): Promise<Equipment[]>;
  getEquipment(id: number): Promise<Equipment | null>;
  getEquipmentsByOwner(ownerId: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | null>;
  
  // Equipment Rentals
  getRentalsByRenter(renterId: string): Promise<EquipmentRental[]>;
  getRentalsByOwner(ownerId: string): Promise<EquipmentRental[]>;
  createRental(rental: InsertEquipmentRental): Promise<EquipmentRental>;
  updateRentalStatus(id: number, status: string): Promise<EquipmentRental | null>;

  // Consultations
  getConsultations(): Promise<Consultation[]>;
  getConsultationsByUser(userId: string): Promise<Consultation[]>;
  getConsultationsByService(serviceType: string): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | null>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultationStatus(id: number, status: string, adminNotes?: string): Promise<Consultation | null>;

  // Generated Documents
  getGeneratedDocumentsByUser(userId: string): Promise<GeneratedDocument[]>;
  getGeneratedDocument(id: number): Promise<GeneratedDocument | null>;
  createGeneratedDocument(doc: InsertGeneratedDocument): Promise<GeneratedDocument>;
  deleteGeneratedDocument(id: number): Promise<boolean>;

  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<Notification | null>;
  markAllNotificationsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<boolean>;

  // Agent Sessions
  getAgentSessionsByUser(userId: string): Promise<AgentSession[]>;
  getAgentSession(id: number): Promise<AgentSession | null>;
  createAgentSession(session: InsertAgentSession): Promise<AgentSession>;
  updateAgentSession(id: number, data: Partial<InsertAgentSession>): Promise<AgentSession | null>;
  deleteAgentSession(id: number): Promise<boolean>;

  // Agent Messages
  getAgentMessages(sessionId: number): Promise<AgentMessage[]>;
  createAgentMessage(message: InsertAgentMessage): Promise<AgentMessage>;
  clearAgentMessages(sessionId: number): Promise<void>;

  // Document Verifications
  getVerificationsByUser(userId: string): Promise<DocumentVerification[]>;
  getVerification(id: number): Promise<DocumentVerification | null>;
  createVerification(verification: InsertDocumentVerification): Promise<DocumentVerification>;
  updateVerificationStatus(id: number, status: string, result?: string): Promise<DocumentVerification | null>;

  // Saved Calculations
  getSavedCalculationsByUser(userId: string): Promise<SavedCalculation[]>;
  createSavedCalculation(calc: InsertSavedCalculation): Promise<SavedCalculation>;
  deleteSavedCalculation(id: number): Promise<boolean>;

  // Chat Sessions
  getChatSessionsByUser(userId: string): Promise<ChatSession[]>;
  getLatestChatSession(userId: string): Promise<ChatSession | null>;
  getChatSession(id: number): Promise<ChatSession | null>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, data: Partial<InsertChatSession>): Promise<ChatSession | null>;
  deleteChatSession(id: number): Promise<boolean>;
  pruneOldChatSessions(userId: string, maxSessions?: number, maxAgeDays?: number): Promise<void>;

  // Chat Messages
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Document Chat Messages (AI Dokumen history)
  getDocumentChatMessages(documentId: number): Promise<DocumentChatMessage[]>;
  createDocumentChatMessage(message: InsertDocumentChatMessage): Promise<DocumentChatMessage>;
  clearDocumentChatMessages(documentId: number, userId: string): Promise<void>;
  pruneDocumentChatMessages(documentId: number, maxMessages?: number): Promise<void>;
  clearProjectDocumentSummary(id: number): Promise<void>;
  getProjectDocument(id: number, userId: string): Promise<ProjectDocument | null>;

  // Business Memory
  getBusinessMemoryByUser(userId: string, activeOnly?: boolean): Promise<BusinessMemory[]>;
  getBusinessMemory(id: number): Promise<BusinessMemory | null>;
  createBusinessMemory(data: InsertBusinessMemory): Promise<BusinessMemory>;
  updateBusinessMemory(id: number, data: Partial<InsertBusinessMemory>): Promise<BusinessMemory | null>;
  deleteBusinessMemory(id: number): Promise<boolean>;

  // Pipeline Sessions (TenderaClaw & SBUClaw)
  getPipelineSessionsByUser(userId: string, pipelineType?: string): Promise<PipelineSession[]>;
  getPipelineSession(id: number): Promise<PipelineSession | null>;
  createPipelineSession(data: InsertPipelineSession): Promise<PipelineSession>;
  updatePipelineSession(id: number, data: Partial<InsertPipelineSession>): Promise<PipelineSession | null>;
  deletePipelineSession(id: number): Promise<boolean>;
  prunePipelineSessions(userId: string, pipelineType: string, maxSessions?: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getModules(): Promise<Module[]> {
    return await db
      .select()
      .from(modules)
      .where(eq(modules.isActive, true))
      .orderBy(asc(modules.sortOrder));
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }

  async getUserRoles(): Promise<UserRole[]> {
    return await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.isActive, true))
      .orderBy(asc(userRoles.sortOrder));
  }

  async createUserRole(role: InsertUserRole): Promise<UserRole> {
    const [newRole] = await db.insert(userRoles).values(role).returning();
    return newRole;
  }

  async getBenefits(): Promise<Benefit[]> {
    return await db
      .select()
      .from(benefits)
      .where(eq(benefits.isActive, true))
      .orderBy(asc(benefits.sortOrder));
  }

  async createBenefit(benefit: InsertBenefit): Promise<Benefit> {
    const [newBenefit] = await db.insert(benefits).values(benefit).returning();
    return newBenefit;
  }

  async getHeroContent(): Promise<HeroContent | null> {
    const [hero] = await db
      .select()
      .from(heroContent)
      .where(eq(heroContent.isActive, true))
      .limit(1);
    return hero || null;
  }

  async createHeroContent(hero: InsertHeroContent): Promise<HeroContent> {
    const [newHero] = await db.insert(heroContent).values(hero).returning();
    return newHero;
  }

  async updateHeroBackgroundImage(imageUrl: string): Promise<void> {
    await db.update(heroContent).set({ backgroundImage: imageUrl });
  }

  async getCtaContent(): Promise<CtaContent | null> {
    const [cta] = await db
      .select()
      .from(ctaContent)
      .where(eq(ctaContent.isActive, true))
      .limit(1);
    return cta || null;
  }

  async createCtaContent(cta: InsertCtaContent): Promise<CtaContent> {
    const [newCta] = await db.insert(ctaContent).values(cta).returning();
    return newCta;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || null;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile | null> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated || null;
  }

  async getOpportunities(): Promise<Opportunity[]> {
    return await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.status, "open"))
      .orderBy(desc(opportunities.createdAt));
  }

  async getOpportunity(id: number): Promise<Opportunity | null> {
    const [opp] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id));
    return opp || null;
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const [newOpp] = await db
      .insert(opportunities)
      .values(opportunity)
      .returning();
    return newOpp;
  }

  async getProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isAvailable, true))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | null> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product || null;
  }

  async getProductsByUser(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.sellerId, userId))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.buyerId, buyerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersBySeller(sellerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.sellerId, sellerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | null> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order || null;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string, escrowReleased?: boolean): Promise<Order | null> {
    const updateData: any = { status, updatedAt: new Date() };
    if (escrowReleased !== undefined) {
      updateData.escrowReleased = escrowReleased;
    }
    const [updated] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updated || null;
  }

  // Tender Documents
  async getTenderDocumentsByUser(userId: string): Promise<TenderDocument[]> {
    return await db
      .select()
      .from(tenderDocuments)
      .where(eq(tenderDocuments.userId, userId))
      .orderBy(desc(tenderDocuments.createdAt));
  }

  async getTenderDocument(id: number): Promise<TenderDocument | null> {
    const [doc] = await db
      .select()
      .from(tenderDocuments)
      .where(eq(tenderDocuments.id, id));
    return doc || null;
  }

  async createTenderDocument(doc: InsertTenderDocument): Promise<TenderDocument> {
    const [newDoc] = await db
      .insert(tenderDocuments)
      .values(doc)
      .returning();
    return newDoc;
  }

  async updateTenderDocument(id: number, doc: Partial<InsertTenderDocument>): Promise<TenderDocument | null> {
    const [updated] = await db
      .update(tenderDocuments)
      .set({ ...doc, updatedAt: new Date() })
      .where(eq(tenderDocuments.id, id))
      .returning();
    return updated || null;
  }

  // Projects
  async getProjectsByUser(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | null> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project || null;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | null> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated || null;
  }

  // Project Updates
  async getProjectUpdates(projectId: number): Promise<ProjectUpdate[]> {
    return await db
      .select()
      .from(projectUpdates)
      .where(eq(projectUpdates.projectId, projectId))
      .orderBy(desc(projectUpdates.createdAt));
  }

  async createProjectUpdate(update: InsertProjectUpdate): Promise<ProjectUpdate> {
    const [newUpdate] = await db
      .insert(projectUpdates)
      .values(update)
      .returning();
    return newUpdate;
  }

  // Financial Transactions
  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  async getTransaction(id: number): Promise<Transaction | null> {
    const [txn] = await db.select().from(transactions).where(eq(transactions.id, id));
    return txn ?? null;
  }

  async getTransactionsByProject(projectId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.projectId, projectId))
      .orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | null> {
    const [updated] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updated ?? null;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Equipment Rental
  async getAllEquipments(): Promise<Equipment[]> {
    return await db
      .select()
      .from(equipments)
      .where(eq(equipments.availability, "available"))
      .orderBy(desc(equipments.createdAt));
  }

  async getEquipment(id: number): Promise<Equipment | null> {
    const [equipment] = await db
      .select()
      .from(equipments)
      .where(eq(equipments.id, id));
    return equipment || null;
  }

  async getEquipmentsByOwner(ownerId: string): Promise<Equipment[]> {
    return await db
      .select()
      .from(equipments)
      .where(eq(equipments.ownerId, ownerId))
      .orderBy(desc(equipments.createdAt));
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db
      .insert(equipments)
      .values(equipment)
      .returning();
    return newEquipment;
  }

  async updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | null> {
    const [updated] = await db
      .update(equipments)
      .set(equipment)
      .where(eq(equipments.id, id))
      .returning();
    return updated || null;
  }

  // Equipment Rentals
  async getRentalsByRenter(renterId: string): Promise<EquipmentRental[]> {
    return await db
      .select()
      .from(equipmentRentals)
      .where(eq(equipmentRentals.renterId, renterId))
      .orderBy(desc(equipmentRentals.createdAt));
  }

  async getRentalsByOwner(ownerId: string): Promise<EquipmentRental[]> {
    return await db
      .select()
      .from(equipmentRentals)
      .where(eq(equipmentRentals.ownerId, ownerId))
      .orderBy(desc(equipmentRentals.createdAt));
  }

  async createRental(rental: InsertEquipmentRental): Promise<EquipmentRental> {
    const [newRental] = await db
      .insert(equipmentRentals)
      .values(rental)
      .returning();
    return newRental;
  }

  async updateRentalStatus(id: number, status: string): Promise<EquipmentRental | null> {
    const [updated] = await db
      .update(equipmentRentals)
      .set({ status })
      .where(eq(equipmentRentals.id, id))
      .returning();
    return updated || null;
  }

  // ─── Consultations ───────────────────────────────────────────────────────

  async getConsultations(): Promise<Consultation[]> {
    return await db.select().from(consultations).orderBy(desc(consultations.createdAt));
  }

  async getConsultationsByUser(userId: string): Promise<Consultation[]> {
    return await db.select().from(consultations).where(eq(consultations.userId, userId)).orderBy(desc(consultations.createdAt));
  }

  async getConsultationsByService(serviceType: string): Promise<Consultation[]> {
    return await db.select().from(consultations).where(eq(consultations.serviceType, serviceType)).orderBy(desc(consultations.createdAt));
  }

  async getConsultation(id: number): Promise<Consultation | null> {
    const [c] = await db.select().from(consultations).where(eq(consultations.id, id));
    return c || null;
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newC] = await db.insert(consultations).values(consultation).returning();
    return newC;
  }

  async updateConsultationStatus(id: number, status: string, adminNotes?: string): Promise<Consultation | null> {
    const [updated] = await db
      .update(consultations)
      .set({ status, ...(adminNotes !== undefined ? { adminNotes } : {}), updatedAt: new Date() })
      .where(eq(consultations.id, id))
      .returning();
    return updated || null;
  }

  // ─── Generated Documents ─────────────────────────────────────────────────

  async getGeneratedDocumentsByUser(userId: string): Promise<GeneratedDocument[]> {
    return await db.select().from(generatedDocuments).where(eq(generatedDocuments.userId, userId)).orderBy(desc(generatedDocuments.createdAt));
  }

  async getGeneratedDocument(id: number): Promise<GeneratedDocument | null> {
    const [doc] = await db.select().from(generatedDocuments).where(eq(generatedDocuments.id, id));
    return doc || null;
  }

  async createGeneratedDocument(doc: InsertGeneratedDocument): Promise<GeneratedDocument> {
    const [newDoc] = await db.insert(generatedDocuments).values(doc).returning();
    return newDoc;
  }

  async deleteGeneratedDocument(id: number): Promise<boolean> {
    const result = await db.delete(generatedDocuments).where(eq(generatedDocuments.id, id));
    return true;
  }

  // ─── Notifications ───────────────────────────────────────────────────────

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const rows = await db.select().from(notifications)
      .where(eq(notifications.userId, userId));
    return rows.filter(n => !n.isRead).length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newN] = await db.insert(notifications).values(notification).returning();
    return newN;
  }

  async markNotificationRead(id: number): Promise<Notification | null> {
    const [updated] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return updated || null;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: number): Promise<boolean> {
    await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }

  // ─── Agent Sessions ──────────────────────────────────────────────────────

  async getAgentSessionsByUser(userId: string): Promise<AgentSession[]> {
    return await db.select().from(agentSessions).where(eq(agentSessions.userId, userId)).orderBy(desc(agentSessions.updatedAt));
  }

  async getAgentSession(id: number): Promise<AgentSession | null> {
    const [s] = await db.select().from(agentSessions).where(eq(agentSessions.id, id));
    return s || null;
  }

  async createAgentSession(session: InsertAgentSession): Promise<AgentSession> {
    const [newS] = await db.insert(agentSessions).values(session).returning();
    return newS;
  }

  async updateAgentSession(id: number, data: Partial<InsertAgentSession>): Promise<AgentSession | null> {
    const [updated] = await db.update(agentSessions).set({ ...data, updatedAt: new Date() }).where(eq(agentSessions.id, id)).returning();
    return updated || null;
  }

  async deleteAgentSession(id: number): Promise<boolean> {
    await db.delete(agentMessages).where(eq(agentMessages.sessionId, id));
    await db.delete(agentSessions).where(eq(agentSessions.id, id));
    return true;
  }

  // ─── Agent Messages ──────────────────────────────────────────────────────

  async getAgentMessages(sessionId: number): Promise<AgentMessage[]> {
    return await db.select().from(agentMessages).where(eq(agentMessages.sessionId, sessionId)).orderBy(asc(agentMessages.createdAt));
  }

  async createAgentMessage(message: InsertAgentMessage): Promise<AgentMessage> {
    const [newM] = await db.insert(agentMessages).values(message).returning();
    return newM;
  }

  async clearAgentMessages(sessionId: number): Promise<void> {
    await db.delete(agentMessages).where(eq(agentMessages.sessionId, sessionId));
  }

  // ─── Document Verifications ──────────────────────────────────────────────

  async getVerificationsByUser(userId: string): Promise<DocumentVerification[]> {
    return await db.select().from(documentVerifications).where(eq(documentVerifications.userId, userId)).orderBy(desc(documentVerifications.createdAt));
  }

  async getVerification(id: number): Promise<DocumentVerification | null> {
    const [v] = await db.select().from(documentVerifications).where(eq(documentVerifications.id, id));
    return v || null;
  }

  async createVerification(verification: InsertDocumentVerification): Promise<DocumentVerification> {
    const [newV] = await db.insert(documentVerifications).values(verification).returning();
    return newV;
  }

  async updateVerificationStatus(id: number, status: string, result?: string): Promise<DocumentVerification | null> {
    const [updated] = await db
      .update(documentVerifications)
      .set({ status, ...(result !== undefined ? { verificationResult: result } : {}), verifiedAt: new Date() })
      .where(eq(documentVerifications.id, id))
      .returning();
    return updated || null;
  }

  // ─── Saved Calculations ──────────────────────────────────────────────────

  async getSavedCalculationsByUser(userId: string): Promise<SavedCalculation[]> {
    return await db.select().from(savedCalculations).where(eq(savedCalculations.userId, userId)).orderBy(desc(savedCalculations.createdAt));
  }

  async createSavedCalculation(calc: InsertSavedCalculation): Promise<SavedCalculation> {
    const [newC] = await db.insert(savedCalculations).values(calc).returning();
    return newC;
  }

  async deleteSavedCalculation(id: number): Promise<boolean> {
    await db.delete(savedCalculations).where(eq(savedCalculations.id, id));
    return true;
  }

  // ─── Chat Sessions ────────────────────────────────────────────────────────

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async getLatestChatSession(userId: string): Promise<ChatSession | null> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(1);
    return session || null;
  }

  async getChatSession(id: number): Promise<ChatSession | null> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session || null;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newS] = await db.insert(chatSessions).values(session).returning();
    // Auto-prune on each new session creation
    await this.pruneOldChatSessions(session.userId);
    return newS;
  }

  async updateChatSession(id: number, data: Partial<InsertChatSession>): Promise<ChatSession | null> {
    const [updated] = await db
      .update(chatSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return updated || null;
  }

  async deleteChatSession(id: number): Promise<boolean> {
    // chat_messages will cascade-delete via FK onDelete: "cascade"
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
    return true;
  }

  async pruneOldChatSessions(userId: string, maxSessions = 20, maxAgeDays = 90): Promise<void> {
    let totalDeleted = 0;

    // 1. Delete sessions older than maxAgeDays
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    const oldSessions = await db
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(and(eq(chatSessions.userId, userId), lt(chatSessions.updatedAt, cutoff)));
    if (oldSessions.length > 0) {
      await db
        .delete(chatSessions)
        .where(and(eq(chatSessions.userId, userId), lt(chatSessions.updatedAt, cutoff)));
      totalDeleted += oldSessions.length;
    }

    // 2. Keep only the most recent maxSessions sessions
    const remaining = await db
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));

    if (remaining.length > maxSessions) {
      const toDelete = remaining.slice(maxSessions).map((r) => r.id);
      for (const sid of toDelete) {
        await db.delete(chatSessions).where(eq(chatSessions.id, sid));
      }
      totalDeleted += toDelete.length;
    }

    // 3. Notify the user if any sessions were pruned
    if (totalDeleted > 0) {
      await this.createNotification({
        userId,
        title: "Riwayat chat dibersihkan otomatis",
        message: `${totalDeleted} sesi chat lama telah dihapus otomatis untuk menjaga performa akun Anda. Sistem menyimpan maksimal ${maxSessions} sesi terakhir dan hanya mempertahankan sesi yang dibuat dalam ${maxAgeDays} hari terakhir.`,
        type: "info",
        isRead: false,
      });
    }
  }

  // ─── Chat Messages ────────────────────────────────────────────────────────

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newM] = await db.insert(chatMessages).values(message).returning();
    // Bump session updatedAt
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.id, message.sessionId));
    return newM;
  }

  // ─── Project Documents (AI Query) ────────────────────────────────────────────

  async getProjectDocumentsByUser(userId: string): Promise<ProjectDocument[]> {
    return await db
      .select({ id: projectDocuments.id, userId: projectDocuments.userId, name: projectDocuments.name, originalFilename: projectDocuments.originalFilename, mimeType: projectDocuments.mimeType, fileSize: projectDocuments.fileSize, createdAt: projectDocuments.createdAt } as any)
      .from(projectDocuments)
      .where(eq(projectDocuments.userId, userId))
      .orderBy(desc(projectDocuments.createdAt));
  }

  async getProjectDocument(id: number, userId: string): Promise<ProjectDocument | null> {
    const [doc] = await db.select().from(projectDocuments).where(and(eq(projectDocuments.id, id), eq(projectDocuments.userId, userId)));
    return doc || null;
  }

  async createProjectDocument(doc: InsertProjectDocument): Promise<ProjectDocument> {
    const [newDoc] = await db.insert(projectDocuments).values(doc).returning();
    return newDoc;
  }

  async updateProjectDocumentName(id: number, userId: string, name: string): Promise<ProjectDocument | null> {
    const [updated] = await db
      .update(projectDocuments)
      .set({ name, summaryText: null })
      .where(and(eq(projectDocuments.id, id), eq(projectDocuments.userId, userId)))
      .returning();
    return updated ?? null;
  }

  async updateProjectDocumentSummary(id: number, summaryText: string): Promise<void> {
    await db
      .update(projectDocuments)
      .set({ summaryText })
      .where(eq(projectDocuments.id, id));
  }

  async clearProjectDocumentSummary(id: number): Promise<void> {
    await db
      .update(projectDocuments)
      .set({ summaryText: null })
      .where(eq(projectDocuments.id, id));
  }

  async deleteProjectDocument(id: number, userId: string): Promise<boolean> {
    // Run both deletes inside a single transaction so that either both
    // succeed or neither does.  This prevents the document from surviving
    // while its chat history is gone (data loss) or messages from being
    // left as orphans when the parent delete fails.
    return await db.transaction(async (tx) => {
      // Verify ownership inside the transaction so no concurrent rename or
      // re-assignment can slip between the ownership check and the delete.
      const [doc] = await tx
        .select({ id: projectDocuments.id })
        .from(projectDocuments)
        .where(and(eq(projectDocuments.id, id), eq(projectDocuments.userId, userId)));

      if (!doc) return false;

      // Remove all chat messages for this document first.  The FK has
      // ON DELETE CASCADE in the schema, but the constraint may not be
      // present on the live database if the column was added later, so we
      // delete explicitly to guarantee no orphans regardless of DB state.
      await tx
        .delete(documentChatMessages)
        .where(eq(documentChatMessages.documentId, id));

      await tx
        .delete(projectDocuments)
        .where(eq(projectDocuments.id, id));

      return true;
    });
  }

  // ─── Document Chat Messages (AI Dokumen history) ──────────────────────────────

  async getDocumentChatMessages(documentId: number): Promise<DocumentChatMessage[]> {
    return await db
      .select()
      .from(documentChatMessages)
      .where(eq(documentChatMessages.documentId, documentId))
      .orderBy(asc(documentChatMessages.createdAt));
  }

  async createDocumentChatMessage(message: InsertDocumentChatMessage): Promise<DocumentChatMessage> {
    const [newM] = await db.insert(documentChatMessages).values(message).returning();
    return newM;
  }

  async clearDocumentChatMessages(documentId: number, userId: string): Promise<void> {
    await db
      .delete(documentChatMessages)
      .where(and(eq(documentChatMessages.documentId, documentId), eq(documentChatMessages.userId, userId)));
  }

  async pruneDocumentChatMessages(documentId: number, maxMessages = 200): Promise<void> {
    // Count current messages for this document
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(documentChatMessages)
      .where(eq(documentChatMessages.documentId, documentId));

    if (count <= maxMessages) return;

    // Delete the oldest (count - maxMessages) rows
    const excess = count - maxMessages;
    await db.execute(sql`
      DELETE FROM ${documentChatMessages}
      WHERE id IN (
        SELECT id FROM ${documentChatMessages}
        WHERE ${documentChatMessages.documentId} = ${documentId}
        ORDER BY ${documentChatMessages.createdAt} ASC
        LIMIT ${excess}
      )
    `);
  }

  // ─── Klinik Konsultasi ────────────────────────────────────────────────────────

  async getConsultationCasesByUser(userId: string): Promise<ConsultationCase[]> {
    return await db
      .select()
      .from(consultationCases)
      .where(eq(consultationCases.userId, userId))
      .orderBy(desc(consultationCases.updatedAt));
  }

  async getConsultationCase(id: number): Promise<ConsultationCase | null> {
    const [c] = await db.select().from(consultationCases).where(eq(consultationCases.id, id));
    return c || null;
  }

  async createConsultationCase(data: InsertConsultationCase): Promise<ConsultationCase> {
    const [c] = await db.insert(consultationCases).values(data).returning();
    return c;
  }

  async updateConsultationCase(id: number, data: Partial<InsertConsultationCase>): Promise<ConsultationCase | null> {
    const [c] = await db
      .update(consultationCases)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consultationCases.id, id))
      .returning();
    return c || null;
  }

  async deleteConsultationCase(id: number): Promise<boolean> {
    await db.delete(consultationCaseMessages).where(eq(consultationCaseMessages.caseId, id));
    await db.delete(consultationCases).where(eq(consultationCases.id, id));
    return true;
  }

  async getCaseMessages(caseId: number): Promise<ConsultationCaseMessage[]> {
    return await db
      .select()
      .from(consultationCaseMessages)
      .where(eq(consultationCaseMessages.caseId, caseId))
      .orderBy(asc(consultationCaseMessages.createdAt));
  }

  // ─── Ekosistem Kompetensi ─────────────────────────────────────────────────────

  async getCompetenciesByUser(userId: string): Promise<UserCompetency[]> {
    return await db.select().from(userCompetencies)
      .where(eq(userCompetencies.userId, userId))
      .orderBy(desc(userCompetencies.createdAt));
  }

  async getCompetency(id: number): Promise<UserCompetency | null> {
    const [c] = await db.select().from(userCompetencies).where(eq(userCompetencies.id, id));
    return c || null;
  }

  async createCompetency(data: InsertUserCompetency): Promise<UserCompetency> {
    const [c] = await db.insert(userCompetencies).values(data).returning();
    return c;
  }

  async updateCompetency(id: number, data: Partial<InsertUserCompetency>): Promise<UserCompetency | null> {
    const [c] = await db.update(userCompetencies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userCompetencies.id, id))
      .returning();
    return c || null;
  }

  async deleteCompetency(id: number): Promise<boolean> {
    await db.delete(userCompetencies).where(eq(userCompetencies.id, id));
    return true;
  }

  async createCaseMessage(data: InsertConsultationCaseMessage): Promise<ConsultationCaseMessage> {
    const [m] = await db.insert(consultationCaseMessages).values(data).returning();
    await db.update(consultationCases).set({ updatedAt: new Date() }).where(eq(consultationCases.id, data.caseId));
    return m;
  }

  // ─── Workroom ───────────────────────────────────────────────────────────────
  async getWorkroomsByUser(userId: number): Promise<Workroom[]> {
    return db.select().from(workrooms).where(eq(workrooms.userId, userId)).orderBy(desc(workrooms.updatedAt));
  }

  async getWorkroom(id: number): Promise<Workroom | null> {
    const [w] = await db.select().from(workrooms).where(eq(workrooms.id, id));
    return w || null;
  }

  async createWorkroom(data: InsertWorkroom): Promise<Workroom> {
    const [w] = await db.insert(workrooms).values(data).returning();
    return w;
  }

  async updateWorkroom(id: number, data: Partial<InsertWorkroom>): Promise<Workroom | null> {
    const [w] = await db.update(workrooms).set({ ...data, updatedAt: new Date() }).where(eq(workrooms.id, id)).returning();
    return w || null;
  }

  async deleteWorkroom(id: number): Promise<boolean> {
    await db.delete(workrooms).where(eq(workrooms.id, id));
    return true;
  }

  // ─── MultiClaw Monitoring ────────────────────────────────────────────────────
  async createMonitoringSession(data: InsertMonitoringSession): Promise<MonitoringSession> {
    const [s] = await db.insert(monitoringSessions).values(data).returning();
    return s;
  }

  async completeMonitoringSession(id: number, summary: string, findingsCount: number, status: string): Promise<MonitoringSession | null> {
    const [s] = await db.update(monitoringSessions)
      .set({ status, summary, findingsCount, completedAt: new Date() })
      .where(eq(monitoringSessions.id, id))
      .returning();
    return s || null;
  }

  async getLatestSessionPerTeam(): Promise<MonitoringSession[]> {
    // Get the latest completed session for each team
    const teams = ["sbu-skk", "bujk", "tender", "freelance"];
    const results: MonitoringSession[] = [];
    for (const team of teams) {
      const [s] = await db.select().from(monitoringSessions)
        .where(eq(monitoringSessions.team, team))
        .orderBy(desc(monitoringSessions.startedAt))
        .limit(1);
      if (s) results.push(s);
    }
    return results;
  }

  async getMonitoringSessionsByTeam(team: string, limit = 10): Promise<MonitoringSession[]> {
    return db.select().from(monitoringSessions)
      .where(eq(monitoringSessions.team, team))
      .orderBy(desc(monitoringSessions.startedAt))
      .limit(limit);
  }

  async createMonitoringFindings(findings: InsertMonitoringFinding[]): Promise<MonitoringFinding[]> {
    if (!findings.length) return [];
    return db.insert(monitoringFindings).values(findings).returning();
  }

  async getFindingsByTeam(team: string, limit = 30): Promise<MonitoringFinding[]> {
    return db.select().from(monitoringFindings)
      .where(eq(monitoringFindings.team, team))
      .orderBy(desc(monitoringFindings.createdAt))
      .limit(limit);
  }

  async getMonitoringSession(id: number): Promise<MonitoringSession | null> {
    const [s] = await db.select().from(monitoringSessions)
      .where(eq(monitoringSessions.id, id));
    return s || null;
  }

  async getFindingsBySession(sessionId: number): Promise<MonitoringFinding[]> {
    return db.select().from(monitoringFindings)
      .where(eq(monitoringFindings.sessionId, sessionId))
      .orderBy(asc(monitoringFindings.id));
  }

  // ─── Freelance Listings ──────────────────────────────────────────────────────
  async getFreelanceListings(status = "active"): Promise<FreelanceListing[]> {
    return db.select().from(freelanceListings)
      .where(eq(freelanceListings.status, status))
      .orderBy(desc(freelanceListings.createdAt));
  }

  async getFreelanceListing(id: number): Promise<FreelanceListing | null> {
    const [l] = await db.select().from(freelanceListings).where(eq(freelanceListings.id, id));
    return l || null;
  }

  async createFreelanceListing(data: InsertFreelanceListing): Promise<FreelanceListing> {
    const [l] = await db.insert(freelanceListings).values(data).returning();
    return l;
  }

  async updateFreelanceListingStatus(id: number, status: string): Promise<FreelanceListing | null> {
    const [l] = await db.update(freelanceListings)
      .set({ status })
      .where(eq(freelanceListings.id, id))
      .returning();
    return l || null;
  }

  async deleteFreelanceListing(id: number): Promise<boolean> {
    await db.delete(freelanceListings).where(eq(freelanceListings.id, id));
    return true;
  }

  // ─── Business Memory ─────────────────────────────────────────────────────────
  async getBusinessMemoryByUser(userId: string, activeOnly = false): Promise<BusinessMemory[]> {
    const conditions = activeOnly
      ? and(eq(businessMemory.userId, userId), eq(businessMemory.isActive, true))
      : eq(businessMemory.userId, userId);
    return db.select().from(businessMemory)
      .where(conditions)
      .orderBy(desc(businessMemory.createdAt));
  }

  async getBusinessMemory(id: number): Promise<BusinessMemory | null> {
    const [row] = await db.select().from(businessMemory).where(eq(businessMemory.id, id));
    return row || null;
  }

  async createBusinessMemory(data: InsertBusinessMemory): Promise<BusinessMemory> {
    const [row] = await db.insert(businessMemory).values(data).returning();
    return row;
  }

  async updateBusinessMemory(id: number, data: Partial<InsertBusinessMemory>): Promise<BusinessMemory | null> {
    const [row] = await db.update(businessMemory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(businessMemory.id, id))
      .returning();
    return row || null;
  }

  async deleteBusinessMemory(id: number): Promise<boolean> {
    await db.delete(businessMemory).where(eq(businessMemory.id, id));
    return true;
  }

  // ─── Pipeline Sessions ───────────────────────────────────────────────────────
  async getPipelineSessionsByUser(userId: string, pipelineType?: string): Promise<PipelineSession[]> {
    const conditions = pipelineType
      ? and(eq(pipelineSessions.userId, userId), eq(pipelineSessions.pipelineType, pipelineType))
      : eq(pipelineSessions.userId, userId);
    return db.select().from(pipelineSessions)
      .where(conditions)
      .orderBy(desc(pipelineSessions.updatedAt))
      .limit(10);
  }

  async getPipelineSession(id: number): Promise<PipelineSession | null> {
    const [row] = await db.select().from(pipelineSessions).where(eq(pipelineSessions.id, id));
    return row || null;
  }

  async createPipelineSession(data: InsertPipelineSession): Promise<PipelineSession> {
    const [row] = await db.insert(pipelineSessions).values(data).returning();
    return row;
  }

  async prunePipelineSessions(userId: string, pipelineType: string, maxSessions = 10): Promise<void> {
    // Find the IDs of sessions beyond the cap (oldest first after the top N)
    const allSessions = await db
      .select({ id: pipelineSessions.id })
      .from(pipelineSessions)
      .where(and(eq(pipelineSessions.userId, userId), eq(pipelineSessions.pipelineType, pipelineType)))
      .orderBy(desc(pipelineSessions.updatedAt));

    if (allSessions.length > maxSessions) {
      const idsToDelete = allSessions.slice(maxSessions).map((s) => s.id);
      for (const id of idsToDelete) {
        await db.delete(pipelineSessions).where(eq(pipelineSessions.id, id));
      }
    }
  }

  async updatePipelineSession(id: number, data: Partial<InsertPipelineSession>): Promise<PipelineSession | null> {
    const [row] = await db.update(pipelineSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pipelineSessions.id, id))
      .returning();
    return row || null;
  }

  async deletePipelineSession(id: number): Promise<boolean> {
    await db.delete(pipelineSessions).where(eq(pipelineSessions.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
