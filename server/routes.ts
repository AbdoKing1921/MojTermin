import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { sendBookingConfirmation, sendBookingStatusUpdate, sendOwnerNotification } from "./email";
import { sendBookingConfirmationSms, sendBookingStatusSms, sendOwnerNewBookingSms } from "./sms";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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

  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
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
      const bookedSlots = await storage.getBookedSlots(id, date);
      res.json(bookedSlots);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      res.status(500).json({ message: "Failed to fetch booked slots" });
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
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getBookingStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching booking stats:", error);
      res.status(500).json({ message: "Failed to fetch booking stats" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      const ownerBusinesses = await storage.getBusinessesByOwner(userId);
      res.json(ownerBusinesses);
    } catch (error) {
      console.error("Error fetching owner businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  // Get bookings for owner's business
  app.get('/api/admin/businesses/:id/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const stats = await storage.getOwnerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Create or update service
  app.post('/api/admin/businesses/:id/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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

  // Update user role to business_owner
  app.post('/api/admin/become-owner', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.updateUserRole(userId, "business_owner");
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Create a new business
  app.post('/api/admin/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // First, make user an owner if not already
      await storage.updateUserRole(userId, "business_owner");
      
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

  return httpServer;
}
