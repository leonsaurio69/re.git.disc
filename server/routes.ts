import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { 
  registerSchema, guideRegisterSchema, loginSchema, insertTourSchema, insertBookingSchema,
  insertGuideProfileSchema, insertDocumentSchema, insertTourImageSchema, insertTourAvailabilitySchema,
  insertReviewSchema,
  UserRole, BookingStatus, GuideStatus
} from "@shared/schema";
import { 
  hashPassword, comparePassword, generateToken, sanitizeUser,
  authenticate, requireRole, AuthRequest 
} from "./auth";
import { z } from "zod";

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  
  // ==================== AUTH ROUTES ====================
  
  // Register user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        role: data.role,
      });

      // If registering as guide, create profile
      if (data.role === UserRole.GUIDE) {
        await storage.createGuideProfile({ userId: user.id });
      }

      const safeUser = sanitizeUser(user);
      const token = generateToken(safeUser);

      res.status(201).json({ user: safeUser, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Error al registrar usuario" });
    }
  });

  // Register guide (extended registration)
  app.post("/api/auth/register/guide", async (req, res) => {
    try {
      const data = guideRegisterSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        location: data.location,
        role: UserRole.GUIDE,
      });

      // Create guide profile
      await storage.createGuideProfile({
        userId: user.id,
        businessName: data.businessName,
        specialties: data.specialties,
        languages: data.languages,
        experience: data.experience,
        status: GuideStatus.PENDING,
      });

      const safeUser = sanitizeUser(user);
      const token = generateToken(safeUser);

      res.status(201).json({ 
        user: safeUser, 
        token,
        message: "Registro exitoso. Tu cuenta está pendiente de aprobación." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Register guide error:", error);
      res.status(500).json({ message: "Error al registrar guía" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      if (!user.active) {
        return res.status(403).json({ message: "Tu cuenta está desactivada" });
      }

      const isValidPassword = await comparePassword(data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const safeUser = sanitizeUser(user);
      const token = generateToken(safeUser);

      // Get guide profile if user is a guide
      let guideProfile = null;
      if (user.role === UserRole.GUIDE) {
        guideProfile = await storage.getGuideProfile(user.id);
      }

      res.json({ user: safeUser, token, guideProfile });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticate, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      let guideProfile = null;
      if (user.role === UserRole.GUIDE) {
        guideProfile = await storage.getGuideProfile(user.id);
      }

      res.json({ ...sanitizeUser(user), guideProfile });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  });

  // ==================== GUIDE PROFILE ROUTES ====================

  // Get my guide profile
  app.get("/api/guide/profile", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getGuideProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ message: "Perfil no encontrado" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Get guide profile error:", error);
      res.status(500).json({ message: "Error al obtener perfil" });
    }
  });

  // Update my guide profile
  app.put("/api/guide/profile", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.updateGuideProfile(req.user!.userId, req.body);
      if (!profile) {
        return res.status(404).json({ message: "Perfil no encontrado" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Update guide profile error:", error);
      res.status(500).json({ message: "Error al actualizar perfil" });
    }
  });

  // ==================== DOCUMENT ROUTES ====================

  // Upload document
  app.post("/api/guide/documents", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const docData = insertDocumentSchema.parse({
        ...req.body,
        userId: req.user!.userId,
      });
      const doc = await storage.createDocument(docData);
      res.status(201).json(doc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Upload document error:", error);
      res.status(500).json({ message: "Error al subir documento" });
    }
  });

  // Get my documents
  app.get("/api/guide/documents", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const docs = await storage.getDocumentsByUser(req.user!.userId);
      res.json(docs);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Error al obtener documentos" });
    }
  });

  // Delete document
  app.delete("/api/guide/documents/:id", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.json({ message: "Documento eliminado" });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ message: "Error al eliminar documento" });
    }
  });

  // ==================== TOUR ROUTES ====================

  // Search tours (public)
  app.get("/api/tours/search", async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice, location } = req.query;
      const tours = await storage.searchTours(q as string || "", {
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        location: location as string,
      });
      
      const toursWithGuides = await Promise.all(
        tours.map(async (tour) => {
          const guide = await storage.getUserById(tour.guideId);
          return { ...tour, guide: guide ? sanitizeUser(guide) : null };
        })
      );

      res.json(toursWithGuides);
    } catch (error) {
      console.error("Search tours error:", error);
      res.status(500).json({ message: "Error al buscar tours" });
    }
  });

  // Get all tours (public)
  app.get("/api/tours", async (req, res) => {
    try {
      const allTours = await storage.getActiveTours();
      
      const toursWithGuides = await Promise.all(
        allTours.map(async (tour) => {
          const guide = await storage.getUserById(tour.guideId);
          const images = await storage.getTourImages(tour.id);
          return {
            ...tour,
            guide: guide ? sanitizeUser(guide) : null,
            images,
          };
        })
      );

      res.json(toursWithGuides);
    } catch (error) {
      console.error("Get tours error:", error);
      res.status(500).json({ message: "Error al obtener tours" });
    }
  });

  // Get featured tours (public)
  app.get("/api/tours/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const featuredTours = await storage.getFeaturedTours(limit);
      
      const toursWithGuides = await Promise.all(
        featuredTours.map(async (tour) => {
          const guide = await storage.getUserById(tour.guideId);
          return { ...tour, guide: guide ? sanitizeUser(guide) : null };
        })
      );

      res.json(toursWithGuides);
    } catch (error) {
      console.error("Get featured tours error:", error);
      res.status(500).json({ message: "Error al obtener tours destacados" });
    }
  });

  // Get single tour (public)
  app.get("/api/tours/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tour = await storage.getTourById(id);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      const guide = await storage.getUserById(tour.guideId);
      const guideProfile = guide ? await storage.getGuideProfile(guide.id) : null;
      const images = await storage.getTourImages(id);
      const availability = await storage.getTourAvailability(id);
      const reviews = await storage.getReviewsByTour(id);

      // Get user info for reviews
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUserById(review.userId);
          return { ...review, user: user ? sanitizeUser(user) : null };
        })
      );

      res.json({
        ...tour,
        guide: guide ? { ...sanitizeUser(guide), guideProfile } : null,
        images,
        availability,
        reviews: reviewsWithUsers,
      });
    } catch (error) {
      console.error("Get tour error:", error);
      res.status(500).json({ message: "Error al obtener tour" });
    }
  });

  // Create tour (guides only)
  app.post("/api/tours", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      // Check if guide is approved
      if (req.user!.role === UserRole.GUIDE) {
        const profile = await storage.getGuideProfile(req.user!.userId);
        if (!profile || profile.status !== GuideStatus.APPROVED) {
          return res.status(403).json({ message: "Tu cuenta debe estar aprobada para crear tours" });
        }
      }

      const tourData = insertTourSchema.parse({
        ...req.body,
        guideId: req.user!.userId,
      });

      const tour = await storage.createTour(tourData);
      res.status(201).json(tour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create tour error:", error);
      res.status(500).json({ message: "Error al crear tour" });
    }
  });

  // Update tour (owner or admin)
  app.put("/api/tours/:id", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTour = await storage.getTourById(id);

      if (!existingTour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (req.user!.role !== UserRole.ADMIN && existingTour.guideId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso para editar este tour" });
      }

      const tour = await storage.updateTour(id, req.body);
      res.json(tour);
    } catch (error) {
      console.error("Update tour error:", error);
      res.status(500).json({ message: "Error al actualizar tour" });
    }
  });

  // Delete tour (owner or admin)
  app.delete("/api/tours/:id", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTour = await storage.getTourById(id);

      if (!existingTour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (req.user!.role !== UserRole.ADMIN && existingTour.guideId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso para eliminar este tour" });
      }

      await storage.deleteTour(id);
      res.json({ message: "Tour eliminado correctamente" });
    } catch (error) {
      console.error("Delete tour error:", error);
      res.status(500).json({ message: "Error al eliminar tour" });
    }
  });

  // Toggle tour active status
  app.patch("/api/tours/:id/toggle", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const existingTour = await storage.getTourById(id);

      if (!existingTour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (req.user!.role !== UserRole.ADMIN && existingTour.guideId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso" });
      }

      const tour = await storage.updateTour(id, { active: !existingTour.active });
      res.json(tour);
    } catch (error) {
      console.error("Toggle tour error:", error);
      res.status(500).json({ message: "Error al cambiar estado del tour" });
    }
  });

  // Get my tours (guides)
  app.get("/api/guide/tours", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const myTours = await storage.getToursByGuide(req.user!.userId);
      res.json(myTours);
    } catch (error) {
      console.error("Get my tours error:", error);
      res.status(500).json({ message: "Error al obtener mis tours" });
    }
  });

  // ==================== TOUR IMAGES ROUTES ====================

  // Add tour image
  app.post("/api/tours/:id/images", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const tour = await storage.getTourById(tourId);

      if (!tour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (req.user!.role !== UserRole.ADMIN && tour.guideId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso" });
      }

      const imageData = insertTourImageSchema.parse({ ...req.body, tourId });
      const image = await storage.addTourImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Add tour image error:", error);
      res.status(500).json({ message: "Error al agregar imagen" });
    }
  });

  // Delete tour image
  app.delete("/api/tours/:tourId/images/:imageId", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const tourId = parseInt(req.params.tourId);
      const imageId = parseInt(req.params.imageId);
      const tour = await storage.getTourById(tourId);

      if (!tour || (req.user!.role !== UserRole.ADMIN && tour.guideId !== req.user!.userId)) {
        return res.status(403).json({ message: "No tienes permiso" });
      }

      await storage.deleteTourImage(imageId);
      res.json({ message: "Imagen eliminada" });
    } catch (error) {
      console.error("Delete tour image error:", error);
      res.status(500).json({ message: "Error al eliminar imagen" });
    }
  });

  // ==================== TOUR AVAILABILITY ROUTES ====================

  // Add tour availability
  app.post("/api/tours/:id/availability", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const tour = await storage.getTourById(tourId);

      if (!tour || (req.user!.role !== UserRole.ADMIN && tour.guideId !== req.user!.userId)) {
        return res.status(403).json({ message: "No tienes permiso" });
      }

      const availabilityData = insertTourAvailabilitySchema.parse({ ...req.body, tourId });
      const availability = await storage.addTourAvailability(availabilityData);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Add availability error:", error);
      res.status(500).json({ message: "Error al agregar disponibilidad" });
    }
  });

  // Get tour availability
  app.get("/api/tours/:id/availability", async (req, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const availability = await storage.getTourAvailability(tourId);
      res.json(availability);
    } catch (error) {
      console.error("Get availability error:", error);
      res.status(500).json({ message: "Error al obtener disponibilidad" });
    }
  });

  // Delete availability
  app.delete("/api/tours/:tourId/availability/:availId", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const availId = parseInt(req.params.availId);
      await storage.deleteTourAvailability(availId);
      res.json({ message: "Disponibilidad eliminada" });
    } catch (error) {
      console.error("Delete availability error:", error);
      res.status(500).json({ message: "Error al eliminar disponibilidad" });
    }
  });

  // ==================== STRIPE CHECKOUT ROUTES ====================

  // Create Stripe Checkout Session
  app.post("/api/checkout/create-session", authenticate, async (req: AuthRequest, res) => {
    try {
      const { tourId, date, guests, availabilityId } = req.body;
      const parsedTourId = parseInt(tourId);
      const bookingDate = new Date(date);
      
      const tour = await storage.getTourById(parsedTourId);
      if (!tour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (!tour.active) {
        return res.status(400).json({ message: "Este tour no está disponible" });
      }

      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        return res.status(400).json({ message: "No puedes reservar en fechas pasadas" });
      }

      // Check for duplicate booking
      const isDuplicate = await storage.checkDuplicateBooking(req.user!.userId, parsedTourId, bookingDate);
      if (isDuplicate) {
        return res.status(400).json({ message: "Ya tienes una reserva para este tour en esta fecha" });
      }

      // Validate availability if provided
      let parsedAvailabilityId: number | null = null;
      if (availabilityId) {
        parsedAvailabilityId = parseInt(availabilityId);
        const availableSpots = await storage.getAvailableSpots(parsedAvailabilityId);
        if (guests > availableSpots) {
          return res.status(400).json({ message: `Solo quedan ${availableSpots} cupos disponibles` });
        }
      }

      if (guests > tour.maxGroupSize) {
        return res.status(400).json({ message: `Máximo ${tour.maxGroupSize} personas por grupo` });
      }

      // Calculate prices with 15% commission
      const subtotal = tour.price * guests;
      const commissionRate = 15;
      const commissionAmount = Math.round(subtotal * (commissionRate / 100));
      const totalPrice = subtotal + commissionAmount;
      const guideEarnings = subtotal - commissionAmount;

      // Create booking with PENDING status
      const bookingData = insertBookingSchema.parse({
        userId: req.user!.userId,
        tourId: parsedTourId,
        availabilityId: parsedAvailabilityId,
        date: bookingDate,
        guests,
        subtotal,
        totalPrice,
        commissionAmount,
        commissionRate,
        guideEarnings,
        status: BookingStatus.PENDING,
        paymentStatus: 'pending',
      });

      const booking = await storage.createBooking(bookingData);

      // Create Stripe Checkout Session
      try {
        const { getUncachableStripeClient } = await import('./stripeClient');
        const stripe = await getUncachableStripeClient();

        const baseUrl = process.env.REPLIT_DEV_DOMAIN 
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : process.env.REPLIT_DEPLOYMENT === '1'
            ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`
            : 'http://localhost:5000';

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: tour.title,
                  description: `${guests} viajero${guests > 1 ? 's' : ''} - ${bookingDate.toLocaleDateString('es-ES')}`,
                },
                unit_amount: Math.round(totalPrice * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            bookingId: booking.id.toString(),
            tourId: tour.id.toString(),
            userId: req.user!.userId.toString(),
          },
          success_url: `${baseUrl}/checkout/success?booking_id=${booking.id}`,
          cancel_url: `${baseUrl}/checkout/cancel?booking_id=${booking.id}`,
        });

        // Update booking with Stripe session ID
        await storage.updateBookingStripeSession(booking.id, session.id);

        res.json({ url: session.url, bookingId: booking.id });
      } catch (stripeError: any) {
        // If Stripe fails, delete the orphaned booking
        console.error("Stripe error, cleaning up booking:", stripeError);
        await storage.deleteBooking(booking.id);
        throw stripeError;
      }
    } catch (error: any) {
      console.error("Create checkout session error:", error);
      res.status(500).json({ message: error.message || "Error al crear sesión de pago" });
    }
  });

  // ==================== BOOKING ROUTES ====================

  // Create booking
  app.post("/api/bookings", authenticate, async (req: AuthRequest, res) => {
    try {
      const { tourId, date, guests, availabilityId, notes } = req.body;
      const parsedTourId = parseInt(tourId);
      const bookingDate = new Date(date);
      
      const tour = await storage.getTourById(parsedTourId);
      if (!tour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (!tour.active) {
        return res.status(400).json({ message: "Este tour no está disponible" });
      }

      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        return res.status(400).json({ message: "No puedes reservar en fechas pasadas" });
      }

      // Check for duplicate booking
      const isDuplicate = await storage.checkDuplicateBooking(req.user!.userId, parsedTourId, bookingDate);
      if (isDuplicate) {
        return res.status(400).json({ message: "Ya tienes una reserva para este tour en esta fecha" });
      }

      // Validate availability if provided
      let parsedAvailabilityId: number | null = null;
      if (availabilityId) {
        parsedAvailabilityId = parseInt(availabilityId);
        const availableSpots = await storage.getAvailableSpots(parsedAvailabilityId);
        if (guests > availableSpots) {
          return res.status(400).json({ message: `Solo quedan ${availableSpots} cupos disponibles` });
        }
      }

      if (guests > tour.maxGroupSize) {
        return res.status(400).json({ message: `Máximo ${tour.maxGroupSize} personas por grupo` });
      }

      const subtotal = tour.price * guests;

      const bookingData = insertBookingSchema.parse({
        userId: req.user!.userId,
        tourId: parsedTourId,
        availabilityId: parsedAvailabilityId,
        date: bookingDate,
        guests,
        subtotal,
        totalPrice: subtotal,
        commissionAmount: 0,
        commissionRate: 10,
        guideEarnings: 0,
        status: BookingStatus.PENDING,
        notes,
      });

      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create booking error:", error);
      res.status(500).json({ message: "Error al crear reserva" });
    }
  });

  // Get my bookings
  app.get("/api/bookings", authenticate, async (req: AuthRequest, res) => {
    try {
      const myBookings = await storage.getBookingsByUser(req.user!.userId);
      
      const bookingsWithTours = await Promise.all(
        myBookings.map(async (booking) => {
          const tour = await storage.getTourById(booking.tourId);
          const guide = tour ? await storage.getUserById(tour.guideId) : null;
          return {
            ...booking,
            tour: tour ? { ...tour, guide: guide ? sanitizeUser(guide) : null } : null,
          };
        })
      );

      res.json(bookingsWithTours);
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Error al obtener reservas" });
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBookingById(id);

      if (!booking) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }

      // Check ownership, guide ownership, or admin
      const tour = await storage.getTourById(booking.tourId);
      const isOwner = booking.userId === req.user!.userId;
      const isGuide = tour && tour.guideId === req.user!.userId;
      const isAdmin = req.user!.role === UserRole.ADMIN;

      if (!isOwner && !isGuide && !isAdmin) {
        return res.status(403).json({ message: "No tienes permiso" });
      }

      const user = await storage.getUserById(booking.userId);
      const guide = tour ? await storage.getUserById(tour.guideId) : null;

      res.json({
        ...booking,
        tour: tour ? { ...tour, guide: guide ? sanitizeUser(guide) : null } : null,
        user: user ? sanitizeUser(user) : null,
      });
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Error al obtener reserva" });
    }
  });

  // Update booking status (guide or admin)
  app.patch("/api/bookings/:id/status", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, reason } = req.body;

      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }

      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
        [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        [BookingStatus.COMPLETED]: [],
        [BookingStatus.CANCELLED]: [],
      };

      if (!validTransitions[booking.status]?.includes(status)) {
        return res.status(400).json({ message: `No se puede cambiar de ${booking.status} a ${status}` });
      }

      if (req.user!.role === UserRole.GUIDE) {
        const tour = await storage.getTourById(booking.tourId);
        if (!tour || tour.guideId !== req.user!.userId) {
          return res.status(403).json({ message: "No tienes permiso" });
        }
      }

      // Handle spot management based on status change
      if (booking.availabilityId) {
        const previousStatus = booking.status;
        
        // When confirming: increment booked spots
        if (status === BookingStatus.CONFIRMED && previousStatus === BookingStatus.PENDING) {
          const availableSpots = await storage.getAvailableSpots(booking.availabilityId);
          if (booking.guests > availableSpots) {
            return res.status(400).json({ message: `Solo quedan ${availableSpots} cupos disponibles` });
          }
          await storage.incrementBookedSpots(booking.availabilityId, booking.guests);
        }
        
        // When cancelling a confirmed booking: decrement booked spots
        if (status === BookingStatus.CANCELLED && previousStatus === BookingStatus.CONFIRMED) {
          await storage.decrementBookedSpots(booking.availabilityId, booking.guests);
        }
      }

      const cancelledBy = status === BookingStatus.CANCELLED ? req.user!.userId : undefined;
      const updated = await storage.updateBookingStatus(id, status, cancelledBy, reason);
      res.json(updated);
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ message: "Error al actualizar reserva" });
    }
  });

  // Cancel my booking
  app.delete("/api/bookings/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body || {};
      const booking = await storage.getBookingById(id);

      if (!booking) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }

      if (req.user!.role !== UserRole.ADMIN && booking.userId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso" });
      }

      // Only pending bookings can be cancelled by users
      if (req.user!.role !== UserRole.ADMIN && booking.status !== BookingStatus.PENDING) {
        return res.status(400).json({ message: "Solo puedes cancelar reservas pendientes" });
      }

      // If booking was confirmed, restore spots
      if (booking.status === BookingStatus.CONFIRMED && booking.availabilityId) {
        await storage.decrementBookedSpots(booking.availabilityId, booking.guests);
      }

      await storage.updateBookingStatus(id, BookingStatus.CANCELLED, req.user!.userId, reason);
      res.json({ message: "Reserva cancelada" });
    } catch (error) {
      console.error("Cancel booking error:", error);
      res.status(500).json({ message: "Error al cancelar reserva" });
    }
  });

  // Get guide bookings
  app.get("/api/guide/bookings", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const guideBookings = await storage.getBookingsByGuide(req.user!.userId);
      
      const bookingsWithDetails = await Promise.all(
        guideBookings.map(async (booking) => {
          const tour = await storage.getTourById(booking.tourId);
          const user = await storage.getUserById(booking.userId);
          return {
            ...booking,
            tour,
            user: user ? sanitizeUser(user) : null,
          };
        })
      );

      res.json(bookingsWithDetails);
    } catch (error) {
      console.error("Get guide bookings error:", error);
      res.status(500).json({ message: "Error al obtener reservas" });
    }
  });

  // ==================== REVIEW ROUTES ====================

  // Create review (after completed booking)
  app.post("/api/reviews", authenticate, async (req: AuthRequest, res) => {
    try {
      const { bookingId, rating, comment } = req.body;
      
      const booking = await storage.getBookingById(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }

      if (booking.userId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso" });
      }

      if (booking.status !== BookingStatus.COMPLETED) {
        return res.status(400).json({ message: "Solo puedes reseñar tours completados" });
      }

      const tour = await storage.getTourById(booking.tourId);
      if (!tour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      const reviewData = insertReviewSchema.parse({
        bookingId: parseInt(bookingId),
        userId: req.user!.userId,
        tourId: tour.id,
        guideId: tour.guideId,
        rating,
        comment,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Create review error:", error);
      res.status(500).json({ message: "Error al crear reseña" });
    }
  });

  // Get tour reviews
  app.get("/api/tours/:id/reviews", async (req, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByTour(tourId);
      
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUserById(review.userId);
          return { ...review, user: user ? sanitizeUser(user) : null };
        })
      );

      res.json(reviewsWithUsers);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "Error al obtener reseñas" });
    }
  });

  // Add review response (guide only)
  app.patch("/api/reviews/:id/response", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { response } = req.body;
      const updated = await storage.addReviewResponse(id, response);
      res.json(updated);
    } catch (error) {
      console.error("Add response error:", error);
      res.status(500).json({ message: "Error al agregar respuesta" });
    }
  });

  // ==================== GUIDE ROUTES ====================

  // Get all approved guides (public)
  app.get("/api/guides", async (req, res) => {
    try {
      const guides = await storage.getActiveGuides();
      
      const guidesWithProfiles = await Promise.all(
        guides.map(async (guide) => {
          const profile = await storage.getGuideProfile(guide.id);
          const tourCount = (await storage.getToursByGuide(guide.id)).length;
          return {
            ...sanitizeUser(guide),
            guideProfile: profile,
            tourCount,
          };
        })
      );

      // Filter to only show approved guides
      const approvedGuides = guidesWithProfiles.filter(
        g => g.guideProfile?.status === GuideStatus.APPROVED
      );

      res.json(approvedGuides);
    } catch (error) {
      console.error("Get guides error:", error);
      res.status(500).json({ message: "Error al obtener guías" });
    }
  });

  // Get guide stats
  app.get("/api/guide/stats", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getGuideStats(req.user!.userId);
      res.json(stats);
    } catch (error) {
      console.error("Get guide stats error:", error);
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });

  // Get guide earnings
  app.get("/api/guide/earnings", authenticate, requireRole(UserRole.GUIDE), async (req: AuthRequest, res) => {
    try {
      const payouts = await storage.getPayoutsByGuide(req.user!.userId);
      const stats = await storage.getGuideStats(req.user!.userId);
      res.json({
        totalEarnings: stats.netEarnings,
        totalCommissions: stats.totalCommissions,
        payouts,
      });
    } catch (error) {
      console.error("Get earnings error:", error);
      res.status(500).json({ message: "Error al obtener ganancias" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // Get all users
  app.get("/api/admin/users", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      const usersWithProfiles = await Promise.all(
        allUsers.map(async (user) => {
          let guideProfile = null;
          if (user.role === UserRole.GUIDE) {
            guideProfile = await storage.getGuideProfile(user.id);
          }
          return { ...sanitizeUser(user), guideProfile };
        })
      );

      res.json(usersWithProfiles);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  // Get pending guides
  app.get("/api/admin/guides/pending", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const pendingProfiles = await storage.getPendingGuides();
      
      const pendingGuides = await Promise.all(
        pendingProfiles.map(async (profile) => {
          const user = await storage.getUserById(profile.userId);
          const docs = await storage.getDocumentsByUser(profile.userId);
          return {
            user: user ? sanitizeUser(user) : null,
            profile,
            documents: docs,
          };
        })
      );

      res.json(pendingGuides);
    } catch (error) {
      console.error("Get pending guides error:", error);
      res.status(500).json({ message: "Error al obtener guías pendientes" });
    }
  });

  // Approve guide
  app.post("/api/admin/guides/:userId/approve", authenticate, requireRole(UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.approveGuide(userId, req.user!.userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Guía no encontrado" });
      }

      res.json({ message: "Guía aprobado exitosamente", profile });
    } catch (error) {
      console.error("Approve guide error:", error);
      res.status(500).json({ message: "Error al aprobar guía" });
    }
  });

  // Reject guide
  app.post("/api/admin/guides/:userId/reject", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.rejectGuide(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Guía no encontrado" });
      }

      res.json({ message: "Guía rechazado", profile });
    } catch (error) {
      console.error("Reject guide error:", error);
      res.status(500).json({ message: "Error al rechazar guía" });
    }
  });

  // Verify document
  app.post("/api/admin/documents/:id/verify", authenticate, requireRole(UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const doc = await storage.verifyDocument(id, req.user!.userId);
      res.json(doc);
    } catch (error) {
      console.error("Verify document error:", error);
      res.status(500).json({ message: "Error al verificar documento" });
    }
  });

  // Get admin dashboard stats
  app.get("/api/admin/stats", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Get admin stats error:", error);
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });

  // Get all tours (admin)
  app.get("/api/admin/tours", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const allTours = await storage.getAllTours();
      
      const toursWithGuides = await Promise.all(
        allTours.map(async (tour) => {
          const guide = await storage.getUserById(tour.guideId);
          return { ...tour, guide: guide ? sanitizeUser(guide) : null };
        })
      );

      res.json(toursWithGuides);
    } catch (error) {
      console.error("Get all tours error:", error);
      res.status(500).json({ message: "Error al obtener tours" });
    }
  });

  // Get all bookings
  app.get("/api/admin/bookings", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      
      const bookingsWithDetails = await Promise.all(
        allBookings.map(async (booking) => {
          const tour = await storage.getTourById(booking.tourId);
          const user = await storage.getUserById(booking.userId);
          const guide = tour ? await storage.getUserById(tour.guideId) : null;
          return {
            ...booking,
            tour: tour ? { ...tour, guide: guide ? sanitizeUser(guide) : null } : null,
            user: user ? sanitizeUser(user) : null,
          };
        })
      );

      res.json(bookingsWithDetails);
    } catch (error) {
      console.error("Get all bookings error:", error);
      res.status(500).json({ message: "Error al obtener reservas" });
    }
  });

  // Get revenue stats
  app.get("/api/admin/revenue", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const stats = await storage.getRevenueByPeriod(start, end);
      res.json(stats);
    } catch (error) {
      console.error("Get revenue error:", error);
      res.status(500).json({ message: "Error al obtener ingresos" });
    }
  });

  // Update user (admin)
  app.patch("/api/admin/users/:id", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateUser(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json(sanitizeUser(updated));
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Error al actualizar usuario" });
    }
  });

  // Toggle user active status
  app.patch("/api/admin/users/:id/toggle", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const updated = await storage.updateUser(id, { active: !user.active });
      res.json(sanitizeUser(updated!));
    } catch (error) {
      console.error("Toggle user error:", error);
      res.status(500).json({ message: "Error al cambiar estado" });
    }
  });

  // Delete user (admin)
  app.delete("/api/admin/users/:id", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario eliminado" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });

  // ==================== SETTINGS ROUTES ====================

  // Get commission rate
  app.get("/api/admin/settings/commission", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const rate = await storage.getCommissionRate();
      res.json({ commissionRate: rate });
    } catch (error) {
      console.error("Get commission error:", error);
      res.status(500).json({ message: "Error al obtener comisión" });
    }
  });

  // Set commission rate
  app.put("/api/admin/settings/commission", authenticate, requireRole(UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
      const { rate } = req.body;
      if (rate < 0 || rate > 100) {
        return res.status(400).json({ message: "La comisión debe estar entre 0 y 100" });
      }
      
      await storage.setSetting("commission_rate", rate.toString(), "Porcentaje de comisión", req.user!.userId);
      res.json({ message: "Comisión actualizada", commissionRate: rate });
    } catch (error) {
      console.error("Set commission error:", error);
      res.status(500).json({ message: "Error al actualizar comisión" });
    }
  });

  // Get pending payouts
  app.get("/api/admin/payouts/pending", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const payouts = await storage.getPendingPayouts();
      res.json(payouts);
    } catch (error) {
      console.error("Get pending payouts error:", error);
      res.status(500).json({ message: "Error al obtener pagos pendientes" });
    }
  });
}
