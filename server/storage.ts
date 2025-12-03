import {
  users,
  categories,
  businesses,
  services,
  bookings,
  reviews,
  blockedSlots,
  employees,
  employeeServices,
  businessHours,
  businessBreaks,
  businessHolidays,
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
  type Employee,
  type InsertEmployee,
  type EmployeeService,
  type InsertEmployeeService,
  type BusinessHour,
  type InsertBusinessHour,
  type BusinessBreak,
  type InsertBusinessBreak,
  type BusinessHoliday,
  type InsertBusinessHoliday,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, ilike, or, sql, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Business operations
  getBusinesses(categoryId?: string): Promise<Business[]>;
  getAllBusinesses(): Promise<Business[]>; // For admin - includes unapproved
  getPendingBusinesses(): Promise<Business[]>; // For admin - only unapproved
  getBusinessesByCategorySlug(slug: string): Promise<Business[]>;
  getPopularBusinesses(limit?: number): Promise<Business[]>;
  getBusinessById(id: string): Promise<Business | undefined>;
  searchBusinesses(query: string): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  getBusinessesByOwner(ownerId: string): Promise<Business[]>;
  approveBusiness(id: string, adminId: string): Promise<Business | undefined>;
  rejectBusiness(id: string): Promise<void>;
  
  // Employee operations
  getEmployeesByBusiness(businessId: string): Promise<Employee[]>;
  getEmployeeById(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<void>;
  
  // Employee services operations
  getEmployeeServices(employeeId: string): Promise<EmployeeService[]>;
  addEmployeeService(employeeService: InsertEmployeeService): Promise<EmployeeService>;
  removeEmployeeService(employeeId: string, serviceId: string): Promise<void>;
  getEmployeesForService(serviceId: string): Promise<Employee[]>;
  
  // Business hours operations
  getBusinessHours(businessId: string): Promise<BusinessHour[]>;
  setBusinessHours(businessId: string, hours: InsertBusinessHour[]): Promise<BusinessHour[]>;
  
  // Business breaks operations
  getBusinessBreaks(businessId: string): Promise<BusinessBreak[]>;
  addBusinessBreak(breakData: InsertBusinessBreak): Promise<BusinessBreak>;
  removeBusinessBreak(id: string): Promise<void>;
  
  // Business holidays operations
  getBusinessHolidays(businessId: string): Promise<BusinessHoliday[]>;
  addBusinessHoliday(holiday: InsertBusinessHoliday): Promise<BusinessHoliday>;
  removeBusinessHoliday(id: string): Promise<void>;
  
  // Service operations
  getServicesByBusiness(businessId: string): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;
  
  // Booking operations
  getBookingsByUser(userId: string): Promise<(Booking & { business?: Business; employee?: Employee })[]>;
  getBookingsByBusiness(businessId: string): Promise<(Booking & { user?: User; employee?: Employee; service?: Service })[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getBookedSlots(businessId: string, date: string, employeeId?: string): Promise<{ time: string; endTime: string | null }[]>;
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
  
  // Analytics
  getOwnerAnalytics(ownerId: string, startDate: string, endDate: string): Promise<{
    bookingsByDate: { date: string; count: number; revenue: number }[];
    bookingsByStatus: { status: string; count: number }[];
    bookingsByService: { serviceName: string; count: number; revenue: number }[];
    totalRevenue: number;
    averageBookingValue: number;
    completionRate: number;
  }>;
  
  // Review operations
  getReviewsByBusiness(businessId: string): Promise<(Review & { user?: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Blocked slots operations
  getBlockedSlots(businessId: string, date: string, employeeId?: string): Promise<BlockedSlot[]>;
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

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
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

  // Business operations - only approved and active for public
  async getBusinesses(categoryId?: string): Promise<Business[]> {
    if (categoryId) {
      return db.select().from(businesses).where(
        and(
          eq(businesses.categoryId, categoryId),
          eq(businesses.isActive, true),
          eq(businesses.isApproved, true)
        )
      );
    }
    return db.select().from(businesses).where(
      and(
        eq(businesses.isActive, true),
        eq(businesses.isApproved, true)
      )
    );
  }

  // For admin - get all businesses including unapproved
  async getAllBusinesses(): Promise<Business[]> {
    return db.select().from(businesses).orderBy(desc(businesses.createdAt));
  }

  // For admin - get only pending (unapproved) businesses
  async getPendingBusinesses(): Promise<Business[]> {
    return db.select().from(businesses).where(eq(businesses.isApproved, false)).orderBy(desc(businesses.createdAt));
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
      .where(
        and(
          eq(businesses.isActive, true),
          eq(businesses.isApproved, true)
        )
      )
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
          eq(businesses.isApproved, true),
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
    const [newBusiness] = await db.insert(businesses).values({
      ...business,
      isApproved: false, // Requires admin approval
    }).returning();
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

  async approveBusiness(id: string, adminId: string): Promise<Business | undefined> {
    const [updated] = await db
      .update(businesses)
      .set({
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: adminId,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))
      .returning();
    return updated;
  }

  async rejectBusiness(id: string): Promise<void> {
    await db.delete(businesses).where(eq(businesses.id, id));
  }

  // Employee operations
  async getEmployeesByBusiness(businessId: string): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.businessId, businessId)).orderBy(asc(employees.name));
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set({ ...employee, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return updated;
  }

  async deleteEmployee(id: string): Promise<void> {
    // First delete employee services
    await db.delete(employeeServices).where(eq(employeeServices.employeeId, id));
    // Then delete employee
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Employee services operations
  async getEmployeeServices(employeeId: string): Promise<EmployeeService[]> {
    return db.select().from(employeeServices).where(eq(employeeServices.employeeId, employeeId));
  }

  async addEmployeeService(employeeService: InsertEmployeeService): Promise<EmployeeService> {
    const [newEmployeeService] = await db.insert(employeeServices).values(employeeService).returning();
    return newEmployeeService;
  }

  async removeEmployeeService(employeeId: string, serviceId: string): Promise<void> {
    await db.delete(employeeServices).where(
      and(
        eq(employeeServices.employeeId, employeeId),
        eq(employeeServices.serviceId, serviceId)
      )
    );
  }

  async getEmployeesForService(serviceId: string): Promise<Employee[]> {
    const empServices = await db.select().from(employeeServices).where(eq(employeeServices.serviceId, serviceId));
    if (empServices.length === 0) return [];
    
    const employeeIds = empServices.map(es => es.employeeId);
    return db.select().from(employees).where(
      and(
        inArray(employees.id, employeeIds),
        eq(employees.isActive, true)
      )
    );
  }

  // Business hours operations
  async getBusinessHours(businessId: string): Promise<BusinessHour[]> {
    return db.select().from(businessHours).where(eq(businessHours.businessId, businessId)).orderBy(asc(businessHours.dayOfWeek));
  }

  async setBusinessHours(businessId: string, hours: InsertBusinessHour[]): Promise<BusinessHour[]> {
    // Delete existing hours
    await db.delete(businessHours).where(eq(businessHours.businessId, businessId));
    // Insert new hours
    if (hours.length === 0) return [];
    const inserted = await db.insert(businessHours).values(hours).returning();
    return inserted;
  }

  // Business breaks operations
  async getBusinessBreaks(businessId: string): Promise<BusinessBreak[]> {
    return db.select().from(businessBreaks).where(eq(businessBreaks.businessId, businessId)).orderBy(asc(businessBreaks.dayOfWeek), asc(businessBreaks.startTime));
  }

  async addBusinessBreak(breakData: InsertBusinessBreak): Promise<BusinessBreak> {
    const [newBreak] = await db.insert(businessBreaks).values(breakData).returning();
    return newBreak;
  }

  async removeBusinessBreak(id: string): Promise<void> {
    await db.delete(businessBreaks).where(eq(businessBreaks.id, id));
  }

  // Business holidays operations
  async getBusinessHolidays(businessId: string): Promise<BusinessHoliday[]> {
    return db.select().from(businessHolidays).where(eq(businessHolidays.businessId, businessId)).orderBy(asc(businessHolidays.date));
  }

  async addBusinessHoliday(holiday: InsertBusinessHoliday): Promise<BusinessHoliday> {
    const [newHoliday] = await db.insert(businessHolidays).values(holiday).returning();
    return newHoliday;
  }

  async removeBusinessHoliday(id: string): Promise<void> {
    await db.delete(businessHolidays).where(eq(businessHolidays.id, id));
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

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    // First delete employee services associations
    await db.delete(employeeServices).where(eq(employeeServices.serviceId, id));
    // Then delete service
    await db.delete(services).where(eq(services.id, id));
  }

  // Booking operations
  async getBookingsByUser(userId: string): Promise<(Booking & { business?: Business; employee?: Employee })[]> {
    const result = await db
      .select({
        booking: bookings,
        business: businesses,
        employee: employees,
      })
      .from(bookings)
      .leftJoin(businesses, eq(bookings.businessId, businesses.id))
      .leftJoin(employees, eq(bookings.employeeId, employees.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.date), desc(bookings.time));
    
    return result.map(r => ({
      ...r.booking,
      business: r.business || undefined,
      employee: r.employee || undefined,
    }));
  }

  async getBookingsByBusiness(businessId: string): Promise<(Booking & { user?: User; employee?: Employee; service?: Service })[]> {
    const result = await db
      .select({
        booking: bookings,
        user: users,
        employee: employees,
        service: services,
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(employees, eq(bookings.employeeId, employees.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.businessId, businessId))
      .orderBy(desc(bookings.date), desc(bookings.time));
    
    return result.map(r => ({
      ...r.booking,
      user: r.user || undefined,
      employee: r.employee || undefined,
      service: r.service || undefined,
    }));
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookedSlots(businessId: string, date: string, employeeId?: string): Promise<{ time: string; endTime: string | null }[]> {
    let conditions = and(
      eq(bookings.businessId, businessId),
      eq(bookings.date, date),
      or(eq(bookings.status, "pending"), eq(bookings.status, "confirmed"))
    );
    
    if (employeeId) {
      conditions = and(conditions, eq(bookings.employeeId, employeeId));
    }
    
    const result = await db
      .select({ time: bookings.time, endTime: bookings.endTime })
      .from(bookings)
      .where(conditions);
    
    return result;
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

  async getOwnerAnalytics(ownerId: string, startDate: string, endDate: string): Promise<{
    bookingsByDate: { date: string; count: number; revenue: number }[];
    bookingsByStatus: { status: string; count: number }[];
    bookingsByService: { serviceName: string; count: number; revenue: number }[];
    totalRevenue: number;
    averageBookingValue: number;
    completionRate: number;
  }> {
    // Get all owner's businesses
    const ownerBusinesses = await this.getBusinessesByOwner(ownerId);
    const businessIds = ownerBusinesses.map(b => b.id);
    
    if (businessIds.length === 0) {
      return {
        bookingsByDate: [],
        bookingsByStatus: [],
        bookingsByService: [],
        totalRevenue: 0,
        averageBookingValue: 0,
        completionRate: 0,
      };
    }
    
    // Get all bookings for owner's businesses - filter only by business ownership in query
    const allBookingsRaw = await db
      .select({
        booking: bookings,
        service: services,
      })
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(
        or(...businessIds.map(id => eq(bookings.businessId, id)))
      );
    
    // Filter by date range using proper Date comparison (handles edge cases like month boundaries)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const allBookings = allBookingsRaw.filter(({ booking }) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startDateObj && bookingDate <= endDateObj;
    });
    
    // Bookings by date
    const dateMap = new Map<string, { count: number; revenue: number }>();
    allBookings.forEach(({ booking }) => {
      const date = booking.date;
      const current = dateMap.get(date) || { count: 0, revenue: 0 };
      current.count++;
      if (booking.status === "completed" || booking.status === "confirmed") {
        current.revenue += parseFloat(booking.totalPrice || "0") || 0;
      }
      dateMap.set(date, current);
    });
    const bookingsByDate = Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Bookings by status
    const statusMap = new Map<string, number>();
    allBookings.forEach(({ booking }) => {
      const status = booking.status || "pending";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    const bookingsByStatus = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }));
    
    // Bookings by service
    const serviceMap = new Map<string, { count: number; revenue: number }>();
    allBookings.forEach(({ booking, service }) => {
      const serviceName = service?.name || "Bez usluge";
      const current = serviceMap.get(serviceName) || { count: 0, revenue: 0 };
      current.count++;
      if (booking.status === "completed" || booking.status === "confirmed") {
        current.revenue += parseFloat(booking.totalPrice || "0") || 0;
      }
      serviceMap.set(serviceName, current);
    });
    const bookingsByService = Array.from(serviceMap.entries())
      .map(([serviceName, data]) => ({ serviceName, ...data }))
      .sort((a, b) => b.count - a.count);
    
    // Totals
    const completedBookings = allBookings.filter(
      ({ booking }) => booking.status === "completed" || booking.status === "confirmed"
    );
    const totalRevenue = completedBookings.reduce(
      (sum, { booking }) => sum + (parseFloat(booking.totalPrice || "0") || 0), 0
    );
    const averageBookingValue = completedBookings.length > 0 
      ? totalRevenue / completedBookings.length 
      : 0;
    const completionRate = allBookings.length > 0
      ? (completedBookings.length / allBookings.length) * 100
      : 0;
    
    return {
      bookingsByDate,
      bookingsByStatus,
      bookingsByService,
      totalRevenue,
      averageBookingValue,
      completionRate,
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
  async getBlockedSlots(businessId: string, date: string, employeeId?: string): Promise<BlockedSlot[]> {
    let conditions = and(
      eq(blockedSlots.businessId, businessId),
      eq(blockedSlots.date, date)
    );
    
    if (employeeId) {
      conditions = and(conditions, eq(blockedSlots.employeeId, employeeId));
    }
    
    return db.select().from(blockedSlots).where(conditions);
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
