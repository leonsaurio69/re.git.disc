import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { 
  registerSchema, loginSchema, insertTourSchema, insertBookingSchema,
  UserRole, BookingStatus 
} from "@shared/schema";
import { 
  hashPassword, comparePassword, generateToken, sanitizeUser,
  authenticate, requireRole, AuthRequest 
} from "./auth";
import { z } from "zod";

export async function registerRoutes(server: Server, app: Express): Promise<void> {
  
  // ==================== AUTH ROUTES ====================
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "El correo electrónico ya está registrado" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      });

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

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const isValidPassword = await comparePassword(data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const safeUser = sanitizeUser(user);
      const token = generateToken(safeUser);

      res.json({ user: safeUser, token });
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
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Error al obtener usuario" });
    }
  });

  // ==================== TOUR ROUTES ====================

  // Get all tours (public)
  app.get("/api/tours", async (req, res) => {
    try {
      const allTours = await storage.getAllTours();
      
      // Get guide info for each tour
      const toursWithGuides = await Promise.all(
        allTours.map(async (tour) => {
          const guide = await storage.getUserById(tour.guideId);
          return {
            ...tour,
            guide: guide ? sanitizeUser(guide) : null,
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
          return {
            ...tour,
            guide: guide ? sanitizeUser(guide) : null,
          };
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
      res.json({
        ...tour,
        guide: guide ? sanitizeUser(guide) : null,
      });
    } catch (error) {
      console.error("Get tour error:", error);
      res.status(500).json({ message: "Error al obtener tour" });
    }
  });

  // Create tour (guides only)
  app.post("/api/tours", authenticate, requireRole(UserRole.GUIDE, UserRole.ADMIN), async (req: AuthRequest, res) => {
    try {
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

      // Check ownership
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

      // Check ownership
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

  // ==================== BOOKING ROUTES ====================

  // Create booking (users)
  app.post("/api/bookings", authenticate, async (req: AuthRequest, res) => {
    try {
      const { tourId, date, guests } = req.body;
      
      const tour = await storage.getTourById(parseInt(tourId));
      if (!tour) {
        return res.status(404).json({ message: "Tour no encontrado" });
      }

      if (guests > tour.maxGroupSize) {
        return res.status(400).json({ message: `Máximo ${tour.maxGroupSize} personas por grupo` });
      }

      const totalPrice = tour.price * guests;
      const serviceFee = totalPrice * 0.1;

      const bookingData = insertBookingSchema.parse({
        userId: req.user!.userId,
        tourId: parseInt(tourId),
        date: new Date(date),
        guests,
        totalPrice: totalPrice + serviceFee,
        status: BookingStatus.PENDING,
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

  // Get my bookings (users)
  app.get("/api/bookings", authenticate, async (req: AuthRequest, res) => {
    try {
      const myBookings = await storage.getBookingsByUser(req.user!.userId);
      
      // Get tour info for each booking
      const bookingsWithTours = await Promise.all(
        myBookings.map(async (booking) => {
          const tour = await storage.getTourById(booking.tourId);
          return {
            ...booking,
            tour,
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

      // Check ownership or admin
      if (req.user!.role !== UserRole.ADMIN && booking.userId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso para ver esta reserva" });
      }

      const tour = await storage.getTourById(booking.tourId);
      const user = await storage.getUserById(booking.userId);

      res.json({
        ...booking,
        tour,
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
      const { status } = req.body;

      const booking = await storage.getBookingById(id);
      if (!booking) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }

      // Check if guide owns the tour
      if (req.user!.role === UserRole.GUIDE) {
        const tour = await storage.getTourById(booking.tourId);
        if (!tour || tour.guideId !== req.user!.userId) {
          return res.status(403).json({ message: "No tienes permiso para modificar esta reserva" });
        }
      }

      const updated = await storage.updateBookingStatus(id, status);
      res.json(updated);
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ message: "Error al actualizar reserva" });
    }
  });

  // Cancel booking (user who made it)
  app.delete("/api/bookings/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBookingById(id);

      if (!booking) {
        return res.status(404).json({ message: "Reserva no encontrada" });
      }

      // Check ownership or admin
      if (req.user!.role !== UserRole.ADMIN && booking.userId !== req.user!.userId) {
        return res.status(403).json({ message: "No tienes permiso para cancelar esta reserva" });
      }

      await storage.updateBookingStatus(id, BookingStatus.CANCELLED);
      res.json({ message: "Reserva cancelada correctamente" });
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

  // ==================== GUIDE ROUTES ====================

  // Get all guides (public)
  app.get("/api/guides", async (req, res) => {
    try {
      const guides = await storage.getGuides();
      res.json(guides.map(sanitizeUser));
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

  // ==================== ADMIN ROUTES ====================

  // Get all users (admin only)
  app.get("/api/admin/users", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers.map(sanitizeUser));
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
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

  // Get all bookings (admin only)
  app.get("/api/admin/bookings", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const allBookings = await storage.getAllBookings();
      
      const bookingsWithDetails = await Promise.all(
        allBookings.map(async (booking) => {
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
      console.error("Get all bookings error:", error);
      res.status(500).json({ message: "Error al obtener reservas" });
    }
  });

  // Update user (admin only)
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

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", authenticate, requireRole(UserRole.ADMIN), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Error al eliminar usuario" });
    }
  });
}
