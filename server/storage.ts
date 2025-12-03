import {
  users,
  categories,
  businesses,
  services,
  bookings,
  reviews,
  blockedSlots,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Business,
  type InsertBusiness,
  type Service,
  type InsertService,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type BlockedSlot,
  type InsertBlockedSlot,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, or, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Business operations
  getBusinesses(categoryId?: string): Promise<Business[]>;
  getBusinessesByCategorySlug(slug: string): Promise<Business[]>;
  getPopularBusinesses(limit?: number): Promise<Business[]>;
  getBusinessById(id: string): Promise<Business | undefined>;
  searchBusinesses(query: string): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  getBusinessesByOwner(ownerId: string): Promise<Business[]>;
  
  // Service operations
  getServicesByBusiness(businessId: string): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  
  // Booking operations
  getBookingsByUser(userId: string): Promise<(Booking & { business?: Business })[]>;
  getBookingsByBusiness(businessId: string): Promise<(Booking & { user?: User })[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getBookedSlots(businessId: string, date: string): Promise<string[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  getBookingStats(userId: string): Promise<{ total: number; upcoming: number }>;
  
  // Owner stats
  getOwnerStats(ownerId: string): Promise<{
    totalBookings: number;
    todayBookings: number;
    pendingBookings: number;
    revenue: number;
  }>;
  
  // Review operations
  getReviewsByBusiness(businessId: string): Promise<(Review & { user?: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Blocked slots operations
  getBlockedSlots(businessId: string, date: string): Promise<BlockedSlot[]>;
  getBlockedSlotsByDateRange(businessId: string, startDate: string, endDate: string): Promise<BlockedSlot[]>;
  getBlockedSlotById(id: string): Promise<BlockedSlot | undefined>;
  createBlockedSlot(blockedSlot: InsertBlockedSlot): Promise<BlockedSlot>;
  deleteBlockedSlot(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Business operations
  async getBusinesses(categoryId?: string): Promise<Business[]> {
    if (categoryId) {
      return db.select().from(businesses).where(eq(businesses.categoryId, categoryId));
    }
    return db.select().from(businesses).where(eq(businesses.isActive, true));
  }

  async getBusinessesByCategorySlug(slug: string): Promise<Business[]> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return [];
    return this.getBusinesses(category.id);
  }

  async getPopularBusinesses(limit = 10): Promise<Business[]> {
    return db
      .select()
      .from(businesses)
      .where(eq(businesses.isActive, true))
      .orderBy(desc(businesses.rating), desc(businesses.reviewCount))
      .limit(limit);
  }

  async getBusinessById(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async searchBusinesses(query: string): Promise<Business[]> {
    const searchTerm = `%${query}%`;
    return db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.isActive, true),
          or(
            ilike(businesses.name, searchTerm),
            ilike(businesses.description, searchTerm),
            ilike(businesses.city, searchTerm)
          )
        )
      )
      .limit(20);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const [updated] = await db
      .update(businesses)
      .set({ ...business, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return updated;
  }

  async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
    return db.select().from(businesses).where(eq(businesses.ownerId, ownerId));
  }

  // Service operations
  async getServicesByBusiness(businessId: string): Promise<Service[]> {
    return db.select().from(services).where(eq(services.businessId, businessId));
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  // Booking operations
  async getBookingsByUser(userId: string): Promise<(Booking & { business?: Business })[]> {
    const result = await db
      .select({
        booking: bookings,
        business: businesses,
      })
      .from(bookings)
      .leftJoin(businesses, eq(bookings.businessId, businesses.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.date), desc(bookings.time));
    
    return result.map(r => ({
      ...r.booking,
      business: r.business || undefined,
    }));
  }

  async getBookingsByBusiness(businessId: string): Promise<(Booking & { user?: User })[]> {
    const result = await db
      .select({
        booking: bookings,
        user: users,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.businessId, businessId))
      .orderBy(desc(bookings.date), desc(bookings.time));
    
    return result.map(r => ({
      ...r.booking,
      user: r.user || undefined,
    }));
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookedSlots(businessId: string, date: string): Promise<string[]> {
    const result = await db
      .select({ time: bookings.time })
      .from(bookings)
      .where(
        and(
          eq(bookings.businessId, businessId),
          eq(bookings.date, date),
          or(eq(bookings.status, "pending"), eq(bookings.status, "confirmed"))
        )
      );
    return result.map(r => r.time);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async getBookingStats(userId: string): Promise<{ total: number; upcoming: number }> {
    const today = new Date().toISOString().split("T")[0];
    
    const allBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));
    
    const upcomingBookings = allBookings.filter(
      b => b.date >= today && (b.status === "pending" || b.status === "confirmed")
    );
    
    return {
      total: allBookings.length,
      upcoming: upcomingBookings.length,
    };
  }

  async getOwnerStats(ownerId: string): Promise<{
    totalBookings: number;
    todayBookings: number;
    pendingBookings: number;
    revenue: number;
  }> {
    const today = new Date().toISOString().split("T")[0];
    
    // Get all owner's businesses
    const ownerBusinesses = await this.getBusinessesByOwner(ownerId);
    const businessIds = ownerBusinesses.map(b => b.id);
    
    if (businessIds.length === 0) {
      return { totalBookings: 0, todayBookings: 0, pendingBookings: 0, revenue: 0 };
    }
    
    // Get all bookings for owner's businesses
    const allBookings = await db
      .select()
      .from(bookings)
      .where(
        or(...businessIds.map(id => eq(bookings.businessId, id)))
      );
    
    const todayBookings = allBookings.filter(b => b.date === today);
    const pendingBookings = allBookings.filter(b => b.status === "pending");
    const completedBookings = allBookings.filter(b => b.status === "completed" || b.status === "confirmed");
    
    const revenue = completedBookings.reduce((sum, b) => {
      return sum + (parseFloat(b.totalPrice || "0") || 0);
    }, 0);
    
    return {
      totalBookings: allBookings.length,
      todayBookings: todayBookings.length,
      pendingBookings: pendingBookings.length,
      revenue,
    };
  }

  // Review operations
  async getReviewsByBusiness(businessId: string): Promise<(Review & { user?: User })[]> {
    const result = await db
      .select({
        review: reviews,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.businessId, businessId))
      .orderBy(desc(reviews.createdAt));
    
    return result.map(r => ({
      ...r.review,
      user: r.user || undefined,
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update business rating and review count
    const allReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.businessId, review.businessId));
    
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await db
      .update(businesses)
      .set({
        rating: avgRating.toFixed(1),
        reviewCount: allReviews.length,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, review.businessId));
    
    return newReview;
  }

  // Blocked slots operations
  async getBlockedSlots(businessId: string, date: string): Promise<BlockedSlot[]> {
    return db
      .select()
      .from(blockedSlots)
      .where(
        and(
          eq(blockedSlots.businessId, businessId),
          eq(blockedSlots.date, date)
        )
      );
  }

  async getBlockedSlotsByDateRange(businessId: string, startDate: string, endDate: string): Promise<BlockedSlot[]> {
    return db
      .select()
      .from(blockedSlots)
      .where(
        and(
          eq(blockedSlots.businessId, businessId),
          gte(blockedSlots.date, startDate),
          lte(blockedSlots.date, endDate)
        )
      )
      .orderBy(asc(blockedSlots.date), asc(blockedSlots.startTime));
  }

  async getBlockedSlotById(id: string): Promise<BlockedSlot | undefined> {
    const [slot] = await db.select().from(blockedSlots).where(eq(blockedSlots.id, id));
    return slot;
  }

  async createBlockedSlot(blockedSlot: InsertBlockedSlot): Promise<BlockedSlot> {
    const [newBlockedSlot] = await db.insert(blockedSlots).values(blockedSlot).returning();
    return newBlockedSlot;
  }

  async deleteBlockedSlot(id: string): Promise<void> {
    await db.delete(blockedSlots).where(eq(blockedSlots.id, id));
  }
}

export const storage = new DatabaseStorage();
