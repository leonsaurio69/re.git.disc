import { 
  users, tours, bookings,
  User, InsertUser, SafeUser,
  Tour, InsertTour,
  Booking, InsertBooking,
  UserRole, BookingStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getGuides(): Promise<User[]>;

  // Tours
  createTour(tour: InsertTour): Promise<Tour>;
  getTourById(id: number): Promise<Tour | undefined>;
  getAllTours(): Promise<Tour[]>;
  getToursByGuide(guideId: number): Promise<Tour[]>;
  getFeaturedTours(limit?: number): Promise<Tour[]>;
  updateTour(id: number, data: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByTour(tourId: number): Promise<Booking[]>;
  getBookingsByGuide(guideId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;

  // Dashboard stats
  getAdminStats(): Promise<{
    totalUsers: number;
    totalGuides: number;
    totalTours: number;
    totalBookings: number;
    totalRevenue: number;
  }>;
  getGuideStats(guideId: number): Promise<{
    totalTours: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getGuides(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, UserRole.GUIDE));
  }

  // Tours
  async createTour(tour: InsertTour): Promise<Tour> {
    const [newTour] = await db.insert(tours).values(tour).returning();
    return newTour;
  }

  async getTourById(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour;
  }

  async getAllTours(): Promise<Tour[]> {
    return db.select().from(tours).orderBy(desc(tours.createdAt));
  }

  async getToursByGuide(guideId: number): Promise<Tour[]> {
    return db.select().from(tours).where(eq(tours.guideId, guideId)).orderBy(desc(tours.createdAt));
  }

  async getFeaturedTours(limit: number = 6): Promise<Tour[]> {
    return db.select().from(tours).where(eq(tours.featured, true)).limit(limit);
  }

  async updateTour(id: number, data: Partial<InsertTour>): Promise<Tour | undefined> {
    const [updated] = await db.update(tours).set(data).where(eq(tours.id, id)).returning();
    return updated;
  }

  async deleteTour(id: number): Promise<boolean> {
    const result = await db.delete(tours).where(eq(tours.id, id)).returning();
    return result.length > 0;
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByTour(tourId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.tourId, tourId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByGuide(guideId: number): Promise<Booking[]> {
    const guideTours = await this.getToursByGuide(guideId);
    const tourIds = guideTours.map(t => t.id);
    if (tourIds.length === 0) return [];
    
    const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    return allBookings.filter(b => tourIds.includes(b.tourId));
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updated] = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }

  // Dashboard stats
  async getAdminStats() {
    const allUsers = await db.select().from(users);
    const allTours = await db.select().from(tours);
    const allBookings = await db.select().from(bookings);

    const totalRevenue = allBookings
      .filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CONFIRMED)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      totalUsers: allUsers.filter(u => u.role === UserRole.USER).length,
      totalGuides: allUsers.filter(u => u.role === UserRole.GUIDE).length,
      totalTours: allTours.length,
      totalBookings: allBookings.length,
      totalRevenue,
    };
  }

  async getGuideStats(guideId: number) {
    const guideTours = await this.getToursByGuide(guideId);
    const guideBookings = await this.getBookingsByGuide(guideId);

    const totalRevenue = guideBookings
      .filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CONFIRMED)
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const averageRating = guideTours.length > 0
      ? guideTours.reduce((sum, t) => sum + (t.rating || 0), 0) / guideTours.length
      : 0;

    return {
      totalTours: guideTours.length,
      totalBookings: guideBookings.length,
      totalRevenue,
      averageRating,
    };
  }
}

export const storage = new DatabaseStorage();
