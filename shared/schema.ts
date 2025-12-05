import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  role: varchar("role").default("customer"), // customer, business_owner, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameEn: varchar("name_en").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: varchar("description"),
  icon: varchar("icon").notNull(),
  gradient: varchar("gradient").notNull(),
  iconColor: varchar("icon_color").notNull(),
  textColor: varchar("text_color").notNull(),
  subtextColor: varchar("subtext_color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Businesses table
export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id),
  categoryId: varchar("category_id").references(() => categories.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  address: varchar("address"),
  city: varchar("city"),
  phone: varchar("phone"),
  email: varchar("email"),
  imageUrl: varchar("image_url"),
  coverImage: varchar("cover_image"), // Hero/cover image for business page
  galleryImages: text("gallery_images").array(), // Multiple gallery images
  latitude: decimal("latitude", { precision: 10, scale: 7 }), // Map coordinates
  longitude: decimal("longitude", { precision: 10, scale: 7 }), // Map coordinates
  googlePlaceId: varchar("google_place_id"), // For Google Maps integration
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  distance: varchar("distance"),
  isSponsored: boolean("is_sponsored").default(false),
  isActive: boolean("is_active").default(true),
  isApproved: boolean("is_approved").default(false), // Admin must approve
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  openTime: time("open_time").default("09:00"),
  closeTime: time("close_time").default("18:00"),
  slotDuration: integer("slot_duration").default(30), // minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employees (staff) for each business
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // Links to user for login
  name: varchar("name").notNull(),
  title: varchar("title"), // e.g., "Frizer", "Brijač", "Kozmetičar"
  email: varchar("email"),
  phone: varchar("phone"),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  canManageSchedule: boolean("can_manage_schedule").default(true), // Can edit own schedule
  canViewAllBookings: boolean("can_view_all_bookings").default(false), // Can see all business bookings
  canManageBookings: boolean("can_manage_bookings").default(false), // Can confirm/cancel bookings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table: which services each employee can provide
export const employeeServices = pgTable("employee_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business hours per day of week (0=Sunday, 1=Monday, etc.)
export const businessHours = pgTable("business_hours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  isClosed: boolean("is_closed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Break/pause times per day of week
export const businessBreaks = pgTable("business_breaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  label: varchar("label"), // e.g., "Ručak"
  createdAt: timestamp("created_at").defaultNow(),
});

// Holidays and special closed days
export const businessHolidays = pgTable("business_holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  date: date("date").notNull(),
  label: varchar("label"), // e.g., "Nova Godina", "Bajram"
  createdAt: timestamp("created_at").defaultNow(),
});

// Services offered by businesses
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id),
  employeeId: varchar("employee_id").references(() => employees.id), // Optional employee
  date: date("date").notNull(),
  time: time("time").notNull(),
  endTime: time("end_time"), // Calculated based on service duration
  status: varchar("status").default("pending"), // pending, confirmed, completed, cancelled
  notes: text("notes"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  smsNotificationSent: boolean("sms_notification_sent").default(false),
  emailNotificationSent: boolean("email_notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Time slots blocked by business owners
export const blockedSlots = pgTable("blocked_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  employeeId: varchar("employee_id").references(() => employees.id), // Optional - for specific employee
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  reason: varchar("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [businesses.approvedBy],
    references: [users.id],
    relationName: "approvedBusinesses",
  }),
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id],
  }),
  services: many(services),
  employees: many(employees),
  businessHours: many(businessHours),
  businessBreaks: many(businessBreaks),
  businessHolidays: many(businessHolidays),
  bookings: many(bookings),
  reviews: many(reviews),
  blockedSlots: many(blockedSlots),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  business: one(businesses, {
    fields: [employees.businessId],
    references: [businesses.id],
  }),
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  employeeServices: many(employeeServices),
  bookings: many(bookings),
  blockedSlots: many(blockedSlots),
}));

export const employeeServicesRelations = relations(employeeServices, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeServices.employeeId],
    references: [employees.id],
  }),
  service: one(services, {
    fields: [employeeServices.serviceId],
    references: [services.id],
  }),
}));

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  business: one(businesses, {
    fields: [businessHours.businessId],
    references: [businesses.id],
  }),
}));

export const businessBreaksRelations = relations(businessBreaks, ({ one }) => ({
  business: one(businesses, {
    fields: [businessBreaks.businessId],
    references: [businesses.id],
  }),
}));

export const businessHolidaysRelations = relations(businessHolidays, ({ one }) => ({
  business: one(businesses, {
    fields: [businessHolidays.businessId],
    references: [businesses.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  business: one(businesses, {
    fields: [services.businessId],
    references: [businesses.id],
  }),
  employeeServices: many(employeeServices),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [bookings.businessId],
    references: [businesses.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  employee: one(employees, {
    fields: [bookings.employeeId],
    references: [employees.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [reviews.businessId],
    references: [businesses.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

export const blockedSlotsRelations = relations(blockedSlots, ({ one }) => ({
  business: one(businesses, {
    fields: [blockedSlots.businessId],
    references: [businesses.id],
  }),
  employee: one(employees, {
    fields: [blockedSlots.employeeId],
    references: [employees.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeServiceSchema = createInsertSchema(employeeServices).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessHoursSchema = createInsertSchema(businessHours).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessBreaksSchema = createInsertSchema(businessBreaks).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessHolidaysSchema = createInsertSchema(businessHolidays).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertBlockedSlotSchema = createInsertSchema(blockedSlots).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type EmployeeService = typeof employeeServices.$inferSelect;
export type InsertEmployeeService = z.infer<typeof insertEmployeeServiceSchema>;

export type BusinessHour = typeof businessHours.$inferSelect;
export type InsertBusinessHour = z.infer<typeof insertBusinessHoursSchema>;

export type BusinessBreak = typeof businessBreaks.$inferSelect;
export type InsertBusinessBreak = z.infer<typeof insertBusinessBreaksSchema>;

export type BusinessHoliday = typeof businessHolidays.$inferSelect;
export type InsertBusinessHoliday = z.infer<typeof insertBusinessHolidaysSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type BlockedSlot = typeof blockedSlots.$inferSelect;
export type InsertBlockedSlot = z.infer<typeof insertBlockedSlotSchema>;
