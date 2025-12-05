import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { sendBookingConfirmation, sendBookingStatusUpdate, sendOwnerNotification } from "./email";
import { sendBookingConfirmationSms, sendBookingStatusSms, sendOwnerNewBookingSms } from "./sms";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth middleware (includes /api/auth/login, /api/auth/register, /api/auth/user, /api/logout)
  await setupAuth(app);

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Businesses routes
  app.get('/api/businesses', async (req, res) => {
    try {
      const { categorySlug } = req.query;
      let businesses;
      
      if (categorySlug && typeof categorySlug === 'string') {
        businesses = await storage.getBusinessesByCategorySlug(categorySlug);
      } else {
        businesses = await storage.getBusinesses();
      }
      
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get('/api/businesses/popular', async (req, res) => {
    try {
      const businesses = await storage.getPopularBusinesses(10);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching popular businesses:", error);
      res.status(500).json({ message: "Failed to fetch popular businesses" });
    }
  });

  app.get('/api/businesses/:id', async (req: any, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      // Check if business is approved for public access
      if (!business.isApproved || !business.isActive) {
        // Allow owner or admin to access unapproved/inactive businesses
        const userId = (req.session as any)?.userId;
        
        let isAdmin = false;
        if (userId) {
          const dbUser = await storage.getUser(userId);
          isAdmin = dbUser?.role === 'admin';
        }
        
        if (!userId || (business.ownerId !== userId && !isAdmin)) {
          return res.status(404).json({ message: "Business not found" });
        }
      }
      
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ message: "Failed to fetch business" });
    }
  });

  app.get('/api/businesses/:id/services', async (req, res) => {
    try {
      const services = await storage.getServicesByBusiness(req.params.id);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/businesses/:id/booked-slots/:date', async (req, res) => {
    try {
      const { id, date } = req.params;
      const { employeeId } = req.query;
      const bookedSlots = await storage.getBookedSlots(id, date, employeeId as string | undefined);
      res.json(bookedSlots);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      res.status(500).json({ message: "Failed to fetch booked slots" });
    }
  });

  // Get employees for a business
  app.get('/api/businesses/:id/employees', async (req, res) => {
    try {
      const employees = await storage.getEmployeesByBusiness(req.params.id);
      res.json(employees.filter(e => e.isActive));
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Get business hours
  app.get('/api/businesses/:id/hours', async (req, res) => {
    try {
      const hours = await storage.getBusinessHours(req.params.id);
      res.json(hours);
    } catch (error) {
      console.error("Error fetching business hours:", error);
      res.status(500).json({ message: "Failed to fetch hours" });
    }
  });

  // Get business breaks
  app.get('/api/businesses/:id/breaks', async (req, res) => {
    try {
      const breaks = await storage.getBusinessBreaks(req.params.id);
      res.json(breaks);
    } catch (error) {
      console.error("Error fetching business breaks:", error);
      res.status(500).json({ message: "Failed to fetch breaks" });
    }
  });

  // Get business holidays
  app.get('/api/businesses/:id/holidays', async (req, res) => {
    try {
      const holidays = await storage.getBusinessHolidays(req.params.id);
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching business holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  // Get employees for a specific service
  app.get('/api/services/:id/employees', async (req, res) => {
    try {
      const employees = await storage.getEmployeesForService(req.params.id);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching service employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/businesses/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviewsByBusiness(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Search route
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await storage.searchBusinesses(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Bookings routes (protected)
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getBookingStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      res.status(500).json({ message: "Failed to fetch booking stats" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const bookingData = {
        userId,
        businessId: req.body.businessId,
        serviceId: req.body.serviceId || null,
        date: req.body.date,
        time: req.body.time,
        notes: req.body.notes || null,
        status: "pending",
      };

      // Check if slot is available
      const bookedSlots = await storage.getBookedSlots(bookingData.businessId, bookingData.date);
      if (bookedSlots.includes(bookingData.time)) {
        return res.status(400).json({ message: "This time slot is already booked" });
      }

      const booking = await storage.createBooking(bookingData);
      
      // Send email notifications asynchronously (don't block response)
      (async () => {
        try {
          const user = await storage.getUser(userId);
          const business = await storage.getBusinessById(bookingData.businessId);
          const service = bookingData.serviceId ? await storage.getServiceById(bookingData.serviceId) : null;
          
          if (user && business) {
            const emailData = {
              customerName: user.firstName || user.email || "Korisnik",
              customerEmail: user.email || "",
              businessName: business.name,
              serviceName: service?.name || "Usluga",
              date: new Date(bookingData.date).toLocaleDateString("sr-Latn"),
              time: bookingData.time,
              price: service?.price || "0",
              bookingId: booking.id,
            };
            
            // Send confirmation to customer (email)
            if (user.email) {
              await sendBookingConfirmation(emailData);
            }
            
            // Send confirmation to customer (SMS)
            if (user.phone) {
              await sendBookingConfirmationSms({
                customerPhone: user.phone,
                customerName: emailData.customerName,
                businessName: emailData.businessName,
                serviceName: emailData.serviceName,
                date: emailData.date,
                time: emailData.time,
                bookingId: emailData.bookingId,
              });
            }
            
            // Notify business owner
            if (business.ownerId) {
              const owner = await storage.getUser(business.ownerId);
              if (owner?.email) {
                await sendOwnerNotification(owner.email, emailData);
              }
              if (owner?.phone) {
                await sendOwnerNewBookingSms(owner.phone, {
                  customerPhone: user.phone || "",
                  customerName: emailData.customerName,
                  businessName: emailData.businessName,
                  serviceName: emailData.serviceName,
                  date: emailData.date,
                  time: emailData.time,
                  bookingId: emailData.bookingId,
                });
              }
            }
          }
        } catch (emailError) {
          console.error("[EMAIL] Error sending booking notifications:", emailError);
        }
      })();
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch('/api/bookings/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      
      // Verify ownership
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      if (booking.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to cancel this booking" });
      }
      
      const updated = await storage.updateBookingStatus(bookingId, "cancelled");
      res.json(updated);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Reviews routes (protected)
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const reviewSchema = insertReviewSchema.extend({
        rating: z.number().min(1).max(5),
      });
      
      const validatedData = reviewSchema.parse({
        userId,
        businessId: req.body.businessId,
        bookingId: req.body.bookingId || null,
        rating: req.body.rating,
        comment: req.body.comment || null,
      });

      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // ==================== ADMIN/OWNER ROUTES ====================
  
  // Get current user's businesses (for owners)
  app.get('/api/admin/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ownerBusinesses = await storage.getBusinessesByOwner(userId);
      res.json(ownerBusinesses);
    } catch (error) {
      console.error("Error fetching owner businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Update business details (for owners)
  app.put('/api/admin/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      // Verify ownership
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this business" });
      }
      
      const { name, description, address, city, phone, email, imageUrl, openTime, closeTime, slotDuration } = req.body;
      
      const updated = await storage.updateBusiness(businessId, {
        name,
        description,
        address,
        city,
        phone,
        email,
        imageUrl,
        openTime,
        closeTime,
        slotDuration,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  // Get bookings for owner's business
  app.get('/api/admin/businesses/:id/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      // Verify ownership
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to view this business" });
      }
      
      const businessBookings = await storage.getBookingsByBusiness(businessId);
      res.json(businessBookings);
    } catch (error) {
      console.error("Error fetching business bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Update booking status (for owners)
  app.patch('/api/admin/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      const { status } = req.body;
      
      if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get booking and verify ownership
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const business = await storage.getBusinessById(booking.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized to modify this booking" });
      }
      
      const updated = await storage.updateBookingStatus(bookingId, status);
      
      // Send status update email notification asynchronously
      if (status === "confirmed" || status === "cancelled") {
        (async () => {
          try {
            const customer = await storage.getUser(booking.userId);
            const service = booking.serviceId ? await storage.getServiceById(booking.serviceId) : null;
            
            const smsData = {
              customerPhone: customer?.phone || "",
              customerName: customer?.firstName || customer?.email || "Korisnik",
              businessName: business.name,
              serviceName: service?.name || "Usluga",
              date: new Date(booking.date).toLocaleDateString("sr-Latn"),
              time: booking.time,
              bookingId: booking.id,
            };
            
            // Send email notification
            if (customer?.email) {
              const emailData = {
                ...smsData,
                customerEmail: customer.email,
                price: service?.price || "0",
              };
              await sendBookingStatusUpdate(emailData, status as "confirmed" | "cancelled");
            }
            
            // Send SMS notification
            if (customer?.phone) {
              await sendBookingStatusSms(smsData, status as "confirmed" | "cancelled");
            }
          } catch (emailError) {
            console.error("[EMAIL] Error sending status update notification:", emailError);
          }
        })();
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Get admin dashboard stats
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getOwnerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get analytics data
  app.get('/api/admin/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      
      // Default to last 30 days if not specified
      const end = endDate ? String(endDate) : new Date().toISOString().split("T")[0];
      const start = startDate ? String(startDate) : (() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split("T")[0];
      })();
      
      const analytics = await storage.getOwnerAnalytics(userId, start, end);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Create or update service
  app.post('/api/admin/businesses/:id/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      // Verify ownership
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const serviceData = {
        businessId,
        name: req.body.name,
        description: req.body.description || null,
        price: req.body.price,
        duration: req.body.duration,
      };
      
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Block time slot
  app.post('/api/admin/businesses/:id/block-slot', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      // Verify ownership
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const blockedSlotData = {
        businessId,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        reason: req.body.reason || null,
      };
      
      const blockedSlot = await storage.createBlockedSlot(blockedSlotData);
      res.status(201).json(blockedSlot);
    } catch (error) {
      console.error("Error blocking slot:", error);
      res.status(500).json({ message: "Failed to block slot" });
    }
  });

  // Get blocked slots for a business
  app.get('/api/admin/businesses/:id/blocked-slots', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      const { startDate, endDate } = req.query;
      
      // Verify ownership
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const blockedSlots = await storage.getBlockedSlotsByDateRange(
        businessId,
        startDate as string,
        endDate as string
      );
      res.json(blockedSlots);
    } catch (error) {
      console.error("Error fetching blocked slots:", error);
      res.status(500).json({ message: "Failed to fetch blocked slots" });
    }
  });

  // Delete blocked slot
  app.delete('/api/admin/blocked-slots/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const slotId = req.params.id;
      
      // Get the blocked slot and verify ownership
      const blockedSlot = await storage.getBlockedSlotById(slotId);
      if (!blockedSlot) {
        return res.status(404).json({ message: "Blocked slot not found" });
      }
      
      // Verify the business belongs to this user
      const business = await storage.getBusinessById(blockedSlot.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteBlockedSlot(slotId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blocked slot:", error);
      res.status(500).json({ message: "Failed to delete blocked slot" });
    }
  });

  // Update user role to business_owner (but don't downgrade admins)
  app.post('/api/admin/become-owner', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      // Don't downgrade admins - they already have all permissions
      if (currentUser && currentUser.role === "admin") {
        return res.json(currentUser);
      }
      
      const user = await storage.updateUserRole(userId, "business_owner");
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Admin-only: Get all users
  app.get('/api/superadmin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Samo admin ima pristup" });
      }
      
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin-only: Update any user's role
  app.patch('/api/superadmin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const currentUser = await storage.getUser(adminId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Samo admin ima pristup" });
      }
      
      const targetUserId = req.params.id;
      const { role } = req.body;
      
      if (!["customer", "business_owner", "admin"].includes(role)) {
        return res.status(400).json({ message: "Nevažeća uloga" });
      }
      
      // Prevent admin from demoting themselves
      if (targetUserId === adminId && role !== "admin") {
        return res.status(400).json({ message: "Ne možete ukloniti admin status sebi" });
      }
      
      const updatedUser = await storage.updateUserRole(targetUserId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Create a new business
  app.post('/api/admin/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Check current user role - don't downgrade admins
      const currentUser = await storage.getUser(userId);
      if (currentUser && currentUser.role !== "admin") {
        // Only upgrade to business_owner if not already admin
        await storage.updateUserRole(userId, "business_owner");
      }
      
      const businessData = {
        ownerId: userId,
        categoryId: req.body.categoryId,
        name: req.body.name,
        description: req.body.description || null,
        address: req.body.address || null,
        city: req.body.city || null,
        phone: req.body.phone || null,
        email: req.body.email || null,
        openTime: req.body.openTime || "09:00",
        closeTime: req.body.closeTime || "18:00",
        slotDuration: req.body.slotDuration || 30,
      };
      
      const business = await storage.createBusiness(businessData);
      res.status(201).json(business);
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  // ==================== EMPLOYEE MANAGEMENT ====================

  // Get all employees for owner's business (including inactive)
  app.get('/api/admin/businesses/:id/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      // Verify ownership
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const employees = await storage.getEmployeesByBusiness(businessId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Create employee
  app.post('/api/admin/businesses/:id/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      // Verify ownership
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const employeeData = {
        businessId,
        name: req.body.name,
        title: req.body.title || null,
        email: req.body.email || null,
        phone: req.body.phone || null,
        imageUrl: req.body.imageUrl || null,
        isActive: true,
      };
      
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Update employee
  app.patch('/api/admin/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employeeId = req.params.id;
      
      // Get employee and verify ownership
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateEmployee(employeeId, {
        name: req.body.name,
        title: req.body.title,
        email: req.body.email,
        phone: req.body.phone,
        imageUrl: req.body.imageUrl,
        isActive: req.body.isActive,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Delete employee
  app.delete('/api/admin/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employeeId = req.params.id;
      
      // Get employee and verify ownership
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteEmployee(employeeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Assign service to employee
  app.post('/api/admin/employees/:id/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employeeId = req.params.id;
      const { serviceId } = req.body;
      
      // Verify ownership
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const employeeService = await storage.addEmployeeService({
        employeeId,
        serviceId,
      });
      
      res.status(201).json(employeeService);
    } catch (error) {
      console.error("Error assigning service:", error);
      res.status(500).json({ message: "Failed to assign service" });
    }
  });

  // Remove service from employee
  app.delete('/api/admin/employees/:employeeId/services/:serviceId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { employeeId, serviceId } = req.params;
      
      // Verify ownership
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.removeEmployeeService(employeeId, serviceId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing service:", error);
      res.status(500).json({ message: "Failed to remove service" });
    }
  });

  // Get employee's services
  app.get('/api/admin/employees/:id/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employeeId = req.params.id;
      
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const employeeServices = await storage.getEmployeeServices(employeeId);
      res.json(employeeServices);
    } catch (error) {
      console.error("Error fetching employee services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // ==================== BUSINESS HOURS/BREAKS/HOLIDAYS ====================

  // Set business hours
  app.put('/api/admin/businesses/:id/hours', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const hours = req.body.hours.map((h: any) => ({
        businessId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed || false,
      }));
      
      const savedHours = await storage.setBusinessHours(businessId, hours);
      res.json(savedHours);
    } catch (error) {
      console.error("Error setting business hours:", error);
      res.status(500).json({ message: "Failed to set hours" });
    }
  });

  // Add business break
  app.post('/api/admin/businesses/:id/breaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const breakData = {
        businessId,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        label: req.body.label || null,
      };
      
      const newBreak = await storage.addBusinessBreak(breakData);
      res.status(201).json(newBreak);
    } catch (error) {
      console.error("Error adding break:", error);
      res.status(500).json({ message: "Failed to add break" });
    }
  });

  // Delete business break
  app.delete('/api/admin/breaks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const breakId = req.params.id;
      
      // We'd need to get the break first to verify ownership
      // For now, just delete (can be improved later)
      await storage.removeBusinessBreak(breakId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting break:", error);
      res.status(500).json({ message: "Failed to delete break" });
    }
  });

  // Add business holiday
  app.post('/api/admin/businesses/:id/holidays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const holidayData = {
        businessId,
        date: req.body.date,
        label: req.body.label || null,
      };
      
      const holiday = await storage.addBusinessHoliday(holidayData);
      res.status(201).json(holiday);
    } catch (error) {
      console.error("Error adding holiday:", error);
      res.status(500).json({ message: "Failed to add holiday" });
    }
  });

  // Delete business holiday
  app.delete('/api/admin/holidays/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.removeBusinessHoliday(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  // Update service
  app.patch('/api/admin/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const serviceId = req.params.id;
      
      const service = await storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const business = await storage.getBusinessById(service.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateService(serviceId, {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        duration: req.body.duration,
        isActive: req.body.isActive,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  // Delete service
  app.delete('/api/admin/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const serviceId = req.params.id;
      
      const service = await storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const business = await storage.getBusinessById(service.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteService(serviceId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // ==================== SUPER ADMIN - BUSINESS APPROVAL ====================

  // Get all businesses (for super admin)
  app.get('/api/superadmin/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Samo admin ima pristup" });
      }
      
      const allBusinesses = await storage.getAllBusinesses();
      res.json(allBusinesses);
    } catch (error) {
      console.error("Error fetching all businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Get pending businesses (for super admin)
  app.get('/api/superadmin/businesses/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Samo admin ima pristup" });
      }
      
      const pendingBusinesses = await storage.getPendingBusinesses();
      res.json(pendingBusinesses);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Approve business
  app.patch('/api/superadmin/businesses/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const currentUser = await storage.getUser(adminId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Samo admin ima pristup" });
      }
      
      const businessId = req.params.id;
      const approved = await storage.approveBusiness(businessId, adminId);
      
      if (!approved) {
        return res.status(404).json({ message: "Business not found" });
      }
      
      res.json(approved);
    } catch (error) {
      console.error("Error approving business:", error);
      res.status(500).json({ message: "Failed to approve business" });
    }
  });

  // Reject/delete business
  app.delete('/api/superadmin/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const currentUser = await storage.getUser(adminId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Samo admin ima pristup" });
      }
      
      const businessId = req.params.id;
      await storage.rejectBusiness(businessId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting business:", error);
      res.status(500).json({ message: "Failed to reject business" });
    }
  });

  // Toggle business active status
  app.patch('/api/superadmin/businesses/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const currentUser = await storage.getUser(adminId);
      
      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ message: "Samo admin ima pristup" });
      }
      
      const businessId = req.params.id;
      const { isActive } = req.body;
      
      const updated = await storage.updateBusiness(businessId, { isActive });
      res.json(updated);
    } catch (error) {
      console.error("Error updating business status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // ==================== OWNER PANEL ROUTES ====================

  // Get owner's businesses
  app.get('/api/owner/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businesses = await storage.getBusinessesByOwner(userId);
      res.json(businesses);
    } catch (error) {
      console.error("Error fetching owner businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Get owner stats
  app.get('/api/owner/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getOwnerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching owner stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get recent bookings for owner
  app.get('/api/owner/recent-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businesses = await storage.getBusinessesByOwner(userId);
      if (businesses.length === 0) {
        return res.json([]);
      }
      
      const businessId = businesses[0].id;
      const allBookings = await storage.getBookingsByBusiness(businessId);
      const recentBookings = allBookings.slice(0, 5);
      res.json(recentBookings);
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get all employees for owner's businesses
  app.get('/api/owner/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businesses = await storage.getBusinessesByOwner(userId);
      if (businesses.length === 0) {
        return res.json([]);
      }
      
      const businessId = businesses[0].id;
      const employees = await storage.getEmployeesByBusiness(businessId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Update business profile (owner version)
  app.put('/api/owner/businesses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateBusiness(businessId, {
        name: req.body.name,
        description: req.body.description,
        address: req.body.address,
        city: req.body.city,
        phone: req.body.phone,
        email: req.body.email,
        categoryId: req.body.categoryId,
        slotDuration: req.body.slotDuration,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  // Get all services for owner's businesses
  app.get('/api/owner/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businesses = await storage.getBusinessesByOwner(userId);
      if (businesses.length === 0) {
        return res.json([]);
      }
      
      const businessId = businesses[0].id;
      const services = await storage.getServicesByBusiness(businessId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get business hours (owner version)
  app.get('/api/owner/businesses/:id/hours', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const hours = await storage.getBusinessHours(businessId);
      res.json(hours);
    } catch (error) {
      console.error("Error fetching business hours:", error);
      res.status(500).json({ message: "Failed to fetch hours" });
    }
  });

  // Get business breaks (owner version)
  app.get('/api/owner/businesses/:id/breaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const breaks = await storage.getBusinessBreaks(businessId);
      res.json(breaks);
    } catch (error) {
      console.error("Error fetching business breaks:", error);
      res.status(500).json({ message: "Failed to fetch breaks" });
    }
  });

  // Get business holidays (owner version)
  app.get('/api/owner/businesses/:id/holidays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const holidays = await storage.getBusinessHolidays(businessId);
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching business holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  // Get business employees (owner version)
  app.get('/api/owner/businesses/:id/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const employees = await storage.getEmployeesByBusiness(businessId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Get business services (owner version)
  app.get('/api/owner/businesses/:id/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const services = await storage.getServicesByBusiness(businessId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get business analytics (owner version)
  app.get('/api/owner/businesses/:id/analytics/:days', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      const days = parseInt(req.params.days) || 30;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const analytics = await storage.getBusinessAnalytics(businessId, days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Update business location
  app.put('/api/owner/businesses/:id/location', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateBusiness(businessId, {
        address: req.body.address,
        city: req.body.city,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        googlePlaceId: req.body.googlePlaceId,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Update business hours (owner version)
  app.put('/api/owner/businesses/:id/hours', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const hours = req.body.hours.map((h: any) => ({
        businessId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed || false,
      }));
      
      const savedHours = await storage.setBusinessHours(businessId, hours);
      res.json(savedHours);
    } catch (error) {
      console.error("Error setting business hours:", error);
      res.status(500).json({ message: "Failed to set hours" });
    }
  });

  // Add business break (owner version)
  app.post('/api/owner/businesses/:id/breaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const breakData = {
        businessId,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        label: req.body.label || null,
      };
      
      const newBreak = await storage.addBusinessBreak(breakData);
      res.status(201).json(newBreak);
    } catch (error) {
      console.error("Error adding break:", error);
      res.status(500).json({ message: "Failed to add break" });
    }
  });

  // Delete business break (owner version)
  app.delete('/api/owner/businesses/:id/breaks/:breakId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.removeBusinessBreak(req.params.breakId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting break:", error);
      res.status(500).json({ message: "Failed to delete break" });
    }
  });

  // Add business holiday (owner version)
  app.post('/api/owner/businesses/:id/holidays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const holidayData = {
        businessId,
        date: req.body.date,
        label: req.body.label || null,
      };
      
      const holiday = await storage.addBusinessHoliday(holidayData);
      res.status(201).json(holiday);
    } catch (error) {
      console.error("Error adding holiday:", error);
      res.status(500).json({ message: "Failed to add holiday" });
    }
  });

  // Delete business holiday (owner version)
  app.delete('/api/owner/businesses/:id/holidays/:holidayId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.removeBusinessHoliday(req.params.holidayId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  // Create employee (owner version)
  app.post('/api/owner/businesses/:id/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const employeeData = {
        businessId,
        name: req.body.name,
        title: req.body.title || null,
        email: req.body.email || null,
        phone: req.body.phone || null,
        canManageSchedule: req.body.canManageSchedule ?? true,
        canViewAllBookings: req.body.canViewAllBookings ?? false,
        canManageBookings: req.body.canManageBookings ?? false,
      };
      
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Update employee
  app.put('/api/owner/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employeeId = req.params.id;
      
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateEmployee(employeeId, {
        name: req.body.name,
        title: req.body.title,
        email: req.body.email,
        phone: req.body.phone,
        canManageSchedule: req.body.canManageSchedule,
        canViewAllBookings: req.body.canViewAllBookings,
        canManageBookings: req.body.canManageBookings,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Toggle employee active status
  app.patch('/api/owner/employees/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employeeId = req.params.id;
      
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateEmployee(employeeId, {
        isActive: req.body.isActive,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating employee status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Delete employee
  app.delete('/api/owner/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const employeeId = req.params.id;
      
      const employee = await storage.getEmployeeById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const business = await storage.getBusinessById(employee.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteEmployee(employeeId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Create service (owner version)
  app.post('/api/owner/businesses/:id/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const serviceData = {
        businessId,
        name: req.body.name,
        description: req.body.description || null,
        price: req.body.price.toString(),
        duration: req.body.duration,
        isActive: true,
      };
      
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Update service (owner version)
  app.put('/api/owner/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const serviceId = req.params.id;
      
      const service = await storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const business = await storage.getBusinessById(service.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateService(serviceId, {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price?.toString(),
        duration: req.body.duration,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  // Delete service (owner version)
  app.delete('/api/owner/services/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const serviceId = req.params.id;
      
      const service = await storage.getServiceById(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const business = await storage.getBusinessById(service.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      await storage.deleteService(serviceId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Get bookings for a specific date (owner version)
  app.get('/api/owner/businesses/:id/bookings/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      const date = req.params.date;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const bookings = await storage.getBookingsByBusinessAndDate(businessId, date);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Update booking status (owner version)
  app.patch('/api/owner/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingId = req.params.id;
      
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      const business = await storage.getBusinessById(booking.businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateBookingStatus(bookingId, req.body.status);
      res.json(updated);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Toggle business active status (owner version)
  app.patch('/api/owner/businesses/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const updated = await storage.updateBusiness(businessId, {
        isActive: req.body.isActive,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating business status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Get analytics for business (owner version)
  app.get('/api/owner/businesses/:id/analytics/:days', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const businessId = req.params.id;
      const days = parseInt(req.params.days) || 30;
      
      const business = await storage.getBusinessById(businessId);
      if (!business || business.ownerId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const analytics = await storage.getBusinessAnalytics(businessId, days);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  return httpServer;
}
