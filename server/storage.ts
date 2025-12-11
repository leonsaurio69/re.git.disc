import { 
  users, tours, bookings, guideProfiles, documents, tourImages, tourAvailability,
  payments, commissionPayouts, settings, reviews,
  User, InsertUser, SafeUser,
  Tour, InsertTour,
  Booking, InsertBooking,
  GuideProfile, InsertGuideProfile,
  Document, InsertDocument,
  TourImage, InsertTourImage,
  TourAvailability, InsertTourAvailability,
  Payment, InsertPayment,
  CommissionPayout, InsertCommissionPayout,
  Review, InsertReview,
  Setting, InsertSetting,
  UserRole, BookingStatus, GuideStatus, PaymentStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray, gte, lte, like, or, not } from "drizzle-orm";

const DEFAULT_COMMISSION_RATE = 10; // 10% default commission

export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt' | 'password'>>;

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: UserUpdate): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getGuides(): Promise<User[]>;
  getActiveGuides(): Promise<User[]>;

  // Guide Profiles
  createGuideProfile(profile: InsertGuideProfile): Promise<GuideProfile>;
  getGuideProfile(userId: number): Promise<GuideProfile | undefined>;
  updateGuideProfile(userId: number, data: Partial<InsertGuideProfile>): Promise<GuideProfile | undefined>;
  getPendingGuides(): Promise<GuideProfile[]>;
  approveGuide(userId: number, approvedBy: number): Promise<GuideProfile | undefined>;
  rejectGuide(userId: number): Promise<GuideProfile | undefined>;

  // Documents
  createDocument(doc: InsertDocument): Promise<Document>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  verifyDocument(id: number, verifiedBy: number): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Tours
  createTour(tour: InsertTour): Promise<Tour>;
  getTourById(id: number): Promise<Tour | undefined>;
  getAllTours(): Promise<Tour[]>;
  getActiveTours(): Promise<Tour[]>;
  getToursByGuide(guideId: number): Promise<Tour[]>;
  getFeaturedTours(limit?: number): Promise<Tour[]>;
  searchTours(query: string, filters?: TourFilters): Promise<Tour[]>;
  updateTour(id: number, data: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;

  // Tour Images
  addTourImage(image: InsertTourImage): Promise<TourImage>;
  getTourImages(tourId: number): Promise<TourImage[]>;
  deleteTourImage(id: number): Promise<boolean>;
  setPrimaryImage(tourId: number, imageId: number): Promise<boolean>;

  // Tour Availability
  addTourAvailability(availability: InsertTourAvailability): Promise<TourAvailability>;
  getTourAvailability(tourId: number): Promise<TourAvailability[]>;
  updateTourAvailability(id: number, data: Partial<InsertTourAvailability>): Promise<TourAvailability | undefined>;
  deleteTourAvailability(id: number): Promise<boolean>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByTour(tourId: number): Promise<Booking[]>;
  getBookingsByGuide(guideId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string, cancelledBy?: number, reason?: string): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByBooking(bookingId: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined>;

  // Commission Payouts
  createPayout(payout: InsertCommissionPayout): Promise<CommissionPayout>;
  getPayoutsByGuide(guideId: number): Promise<CommissionPayout[]>;
  getPendingPayouts(): Promise<CommissionPayout[]>;
  updatePayoutStatus(id: number, status: string, transactionId?: string): Promise<CommissionPayout | undefined>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByTour(tourId: number): Promise<Review[]>;
  getReviewsByGuide(guideId: number): Promise<Review[]>;
  addReviewResponse(id: number, response: string): Promise<Review | undefined>;

  // Settings
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string, description?: string, updatedBy?: number): Promise<Setting>;
  getCommissionRate(): Promise<number>;

  // Dashboard stats
  getAdminStats(): Promise<AdminStats>;
  getGuideStats(guideId: number): Promise<GuideStats>;
  getRevenueByPeriod(startDate: Date, endDate: Date): Promise<RevenueStats>;
}

export interface TourFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  guideId?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalGuides: number;
  pendingGuides: number;
  approvedGuides: number;
  totalTours: number;
  activeTours: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalCommissions: number;
  guidePendingPayouts: number;
}

export interface GuideStats {
  totalTours: number;
  activeTours: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalCommissions: number;
  netEarnings: number;
  averageRating: number;
  reviewCount: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalCommissions: number;
  guideEarnings: number;
  bookingsCount: number;
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

  async updateUser(id: number, data: UserUpdate): Promise<User | undefined> {
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

  async getActiveGuides(): Promise<User[]> {
    const guides = await db.select().from(users).where(
      and(eq(users.role, UserRole.GUIDE), eq(users.active, true))
    );
    return guides;
  }

  // Guide Profiles
  async createGuideProfile(profile: InsertGuideProfile): Promise<GuideProfile> {
    const [newProfile] = await db.insert(guideProfiles).values(profile).returning();
    return newProfile;
  }

  async getGuideProfile(userId: number): Promise<GuideProfile | undefined> {
    const [profile] = await db.select().from(guideProfiles).where(eq(guideProfiles.userId, userId));
    return profile;
  }

  async updateGuideProfile(userId: number, data: Partial<InsertGuideProfile>): Promise<GuideProfile | undefined> {
    const [updated] = await db.update(guideProfiles).set(data).where(eq(guideProfiles.userId, userId)).returning();
    return updated;
  }

  async getPendingGuides(): Promise<GuideProfile[]> {
    return db.select().from(guideProfiles).where(eq(guideProfiles.status, GuideStatus.PENDING));
  }

  async approveGuide(userId: number, approvedBy: number): Promise<GuideProfile | undefined> {
    const [updated] = await db.update(guideProfiles).set({
      status: GuideStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy,
    }).where(eq(guideProfiles.userId, userId)).returning();
    
    if (updated) {
      await db.update(users).set({ verified: true }).where(eq(users.id, userId));
    }
    return updated;
  }

  async rejectGuide(userId: number): Promise<GuideProfile | undefined> {
    const [updated] = await db.update(guideProfiles).set({
      status: GuideStatus.REJECTED,
    }).where(eq(guideProfiles.userId, userId)).returning();
    return updated;
  }

  // Documents
  async createDocument(doc: InsertDocument): Promise<Document> {
    const [newDoc] = await db.insert(documents).values(doc).returning();
    return newDoc;
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
  }

  async verifyDocument(id: number, verifiedBy: number): Promise<Document | undefined> {
    const [updated] = await db.update(documents).set({
      verified: true,
      verifiedAt: new Date(),
      verifiedBy,
    }).where(eq(documents.id, id)).returning();
    return updated;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
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

  async getActiveTours(): Promise<Tour[]> {
    return db.select().from(tours).where(eq(tours.active, true)).orderBy(desc(tours.createdAt));
  }

  async getToursByGuide(guideId: number): Promise<Tour[]> {
    return db.select().from(tours).where(eq(tours.guideId, guideId)).orderBy(desc(tours.createdAt));
  }

  async getFeaturedTours(limit: number = 6): Promise<Tour[]> {
    return db.select().from(tours).where(and(eq(tours.featured, true), eq(tours.active, true))).limit(limit);
  }

  async searchTours(query: string, filters?: TourFilters): Promise<Tour[]> {
    let conditions = [eq(tours.active, true)];
    
    if (query) {
      conditions.push(
        or(
          like(tours.title, `%${query}%`),
          like(tours.location, `%${query}%`),
          like(tours.description, `%${query}%`)
        ) as any
      );
    }
    
    if (filters?.category) {
      conditions.push(eq(tours.category, filters.category));
    }
    if (filters?.minPrice) {
      conditions.push(gte(tours.price, filters.minPrice));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(tours.price, filters.maxPrice));
    }
    if (filters?.location) {
      conditions.push(like(tours.location, `%${filters.location}%`));
    }
    if (filters?.guideId) {
      conditions.push(eq(tours.guideId, filters.guideId));
    }

    return db.select().from(tours).where(and(...conditions)).orderBy(desc(tours.createdAt));
  }

  async updateTour(id: number, data: Partial<InsertTour>): Promise<Tour | undefined> {
    const updateData = { ...data, updatedAt: new Date() };
    const [updated] = await db.update(tours).set(updateData).where(eq(tours.id, id)).returning();
    return updated;
  }

  async deleteTour(id: number): Promise<boolean> {
    const result = await db.delete(tours).where(eq(tours.id, id)).returning();
    return result.length > 0;
  }

  // Tour Images
  async addTourImage(image: InsertTourImage): Promise<TourImage> {
    const [newImage] = await db.insert(tourImages).values(image).returning();
    return newImage;
  }

  async getTourImages(tourId: number): Promise<TourImage[]> {
    return db.select().from(tourImages).where(eq(tourImages.tourId, tourId)).orderBy(tourImages.sortOrder);
  }

  async deleteTourImage(id: number): Promise<boolean> {
    const result = await db.delete(tourImages).where(eq(tourImages.id, id)).returning();
    return result.length > 0;
  }

  async setPrimaryImage(tourId: number, imageId: number): Promise<boolean> {
    await db.update(tourImages).set({ isPrimary: false }).where(eq(tourImages.tourId, tourId));
    const [updated] = await db.update(tourImages).set({ isPrimary: true }).where(eq(tourImages.id, imageId)).returning();
    return !!updated;
  }

  // Tour Availability
  async addTourAvailability(availability: InsertTourAvailability): Promise<TourAvailability> {
    const [newAvailability] = await db.insert(tourAvailability).values(availability).returning();
    return newAvailability;
  }

  async getTourAvailability(tourId: number): Promise<TourAvailability[]> {
    return db.select().from(tourAvailability).where(eq(tourAvailability.tourId, tourId)).orderBy(tourAvailability.date);
  }

  async updateTourAvailability(id: number, data: Partial<InsertTourAvailability>): Promise<TourAvailability | undefined> {
    const [updated] = await db.update(tourAvailability).set(data).where(eq(tourAvailability.id, id)).returning();
    return updated;
  }

  async deleteTourAvailability(id: number): Promise<boolean> {
    const result = await db.delete(tourAvailability).where(eq(tourAvailability.id, id)).returning();
    return result.length > 0;
  }

  async getAvailabilityById(id: number): Promise<TourAvailability | undefined> {
    const [avail] = await db.select().from(tourAvailability).where(eq(tourAvailability.id, id));
    return avail;
  }

  async updateAvailabilitySpots(id: number, bookedSpots: number): Promise<TourAvailability | undefined> {
    const [updated] = await db.update(tourAvailability)
      .set({ bookedSpots })
      .where(eq(tourAvailability.id, id))
      .returning();
    return updated;
  }

  async incrementBookedSpots(availabilityId: number, guests: number): Promise<boolean> {
    const avail = await this.getAvailabilityById(availabilityId);
    if (!avail) return false;
    const newBookedSpots = (avail.bookedSpots || 0) + guests;
    await this.updateAvailabilitySpots(availabilityId, newBookedSpots);
    return true;
  }

  async decrementBookedSpots(availabilityId: number, guests: number): Promise<boolean> {
    const avail = await this.getAvailabilityById(availabilityId);
    if (!avail) return false;
    const newBookedSpots = Math.max(0, (avail.bookedSpots || 0) - guests);
    await this.updateAvailabilitySpots(availabilityId, newBookedSpots);
    return true;
  }

  async checkDuplicateBooking(userId: number, tourId: number, date: Date): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existing = await db.select().from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.tourId, tourId),
          gte(bookings.date, startOfDay),
          lte(bookings.date, endOfDay),
          not(eq(bookings.status, BookingStatus.CANCELLED))
        )
      );
    return existing.length > 0;
  }

  async getAvailableSpots(availabilityId: number): Promise<number> {
    const avail = await this.getAvailabilityById(availabilityId);
    if (!avail) return 0;
    return avail.availableSpots - (avail.bookedSpots || 0);
  }

  // Bookings
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const commissionRate = await this.getCommissionRate();
    const commissionAmount = booking.subtotal * (commissionRate / 100);
    const guideEarnings = booking.subtotal - commissionAmount;
    
    const bookingWithCommission = {
      ...booking,
      commissionRate,
      commissionAmount,
      guideEarnings,
      totalPrice: booking.subtotal,
    };
    
    const [newBooking] = await db.insert(bookings).values(bookingWithCommission).returning();
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
    
    return db.select().from(bookings).where(inArray(bookings.tourId, tourIds)).orderBy(desc(bookings.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: number, status: string, cancelledBy?: number, reason?: string): Promise<Booking | undefined> {
    const updateData: any = { status };
    if (status === BookingStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      if (cancelledBy) updateData.cancelledBy = cancelledBy;
      if (reason) updateData.cancelReason = reason;
    }
    const [updated] = await db.update(bookings).set(updateData).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPaymentByBooking(bookingId: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.bookingId, bookingId));
    return payment;
  }

  async updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment | undefined> {
    const updateData: any = { status };
    if (status === PaymentStatus.PAID) {
      updateData.paidAt = new Date();
    }
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    const [updated] = await db.update(payments).set(updateData).where(eq(payments.id, id)).returning();
    return updated;
  }

  // Commission Payouts
  async createPayout(payout: InsertCommissionPayout): Promise<CommissionPayout> {
    const [newPayout] = await db.insert(commissionPayouts).values(payout).returning();
    return newPayout;
  }

  async getPayoutsByGuide(guideId: number): Promise<CommissionPayout[]> {
    return db.select().from(commissionPayouts).where(eq(commissionPayouts.guideId, guideId)).orderBy(desc(commissionPayouts.createdAt));
  }

  async getPendingPayouts(): Promise<CommissionPayout[]> {
    return db.select().from(commissionPayouts).where(eq(commissionPayouts.status, PaymentStatus.PENDING));
  }

  async updatePayoutStatus(id: number, status: string, transactionId?: string): Promise<CommissionPayout | undefined> {
    const updateData: any = { status };
    if (status === PaymentStatus.PAID) {
      updateData.paidAt = new Date();
    }
    if (transactionId) {
      updateData.transactionId = transactionId;
    }
    const [updated] = await db.update(commissionPayouts).set(updateData).where(eq(commissionPayouts.id, id)).returning();
    return updated;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update tour rating
    const tourReviews = await this.getReviewsByTour(review.tourId);
    const avgRating = tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length;
    await db.update(tours).set({ 
      rating: avgRating, 
      reviewCount: tourReviews.length 
    }).where(eq(tours.id, review.tourId));
    
    // Update guide profile rating
    const guideReviews = await this.getReviewsByGuide(review.guideId);
    const guideAvgRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length;
    await db.update(guideProfiles).set({ 
      rating: guideAvgRating, 
      reviewCount: guideReviews.length 
    }).where(eq(guideProfiles.userId, review.guideId));
    
    return newReview;
  }

  async getReviewsByTour(tourId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.tourId, tourId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByGuide(guideId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.guideId, guideId)).orderBy(desc(reviews.createdAt));
  }

  async addReviewResponse(id: number, response: string): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set({
      response,
      responseAt: new Date(),
    }).where(eq(reviews.id, id)).returning();
    return updated;
  }

  // Settings
  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value;
  }

  async setSetting(key: string, value: string, description?: string, updatedBy?: number): Promise<Setting> {
    const existing = await this.getSetting(key);
    if (existing !== undefined) {
      const [updated] = await db.update(settings).set({
        value,
        description,
        updatedAt: new Date(),
        updatedBy,
      }).where(eq(settings.key, key)).returning();
      return updated;
    } else {
      const [newSetting] = await db.insert(settings).values({
        key,
        value,
        description,
        updatedBy,
      }).returning();
      return newSetting;
    }
  }

  async getCommissionRate(): Promise<number> {
    const rate = await this.getSetting("commission_rate");
    return rate ? parseFloat(rate) : DEFAULT_COMMISSION_RATE;
  }

  // Dashboard stats
  async getAdminStats(): Promise<AdminStats> {
    const allUsers = await db.select().from(users);
    const allProfiles = await db.select().from(guideProfiles);
    const allTours = await db.select().from(tours);
    const allBookings = await db.select().from(bookings);
    const pendingPayouts = await this.getPendingPayouts();

    const completedBookings = allBookings.filter(
      b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CONFIRMED
    );
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalCommissions = completedBookings.reduce((sum, b) => sum + b.commissionAmount, 0);
    const guidePendingPayouts = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers: allUsers.filter(u => u.role === UserRole.USER).length,
      totalGuides: allUsers.filter(u => u.role === UserRole.GUIDE).length,
      pendingGuides: allProfiles.filter(p => p.status === GuideStatus.PENDING).length,
      approvedGuides: allProfiles.filter(p => p.status === GuideStatus.APPROVED).length,
      totalTours: allTours.length,
      activeTours: allTours.filter(t => t.active).length,
      totalBookings: allBookings.length,
      pendingBookings: allBookings.filter(b => b.status === BookingStatus.PENDING).length,
      confirmedBookings: allBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      completedBookings: completedBookings.length,
      totalRevenue,
      totalCommissions,
      guidePendingPayouts,
    };
  }

  async getGuideStats(guideId: number): Promise<GuideStats> {
    const guideTours = await this.getToursByGuide(guideId);
    const guideBookings = await this.getBookingsByGuide(guideId);
    const guideProfile = await this.getGuideProfile(guideId);

    const completedBookings = guideBookings.filter(
      b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CONFIRMED
    );
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalCommissions = completedBookings.reduce((sum, b) => sum + b.commissionAmount, 0);
    const netEarnings = completedBookings.reduce((sum, b) => sum + b.guideEarnings, 0);

    return {
      totalTours: guideTours.length,
      activeTours: guideTours.filter(t => t.active).length,
      totalBookings: guideBookings.length,
      pendingBookings: guideBookings.filter(b => b.status === BookingStatus.PENDING).length,
      totalRevenue,
      totalCommissions,
      netEarnings,
      averageRating: guideProfile?.rating || 0,
      reviewCount: guideProfile?.reviewCount || 0,
    };
  }

  async getRevenueByPeriod(startDate: Date, endDate: Date): Promise<RevenueStats> {
    const allBookings = await db.select().from(bookings).where(
      and(
        gte(bookings.createdAt, startDate),
        lte(bookings.createdAt, endDate),
        or(eq(bookings.status, BookingStatus.CONFIRMED), eq(bookings.status, BookingStatus.COMPLETED))
      )
    );

    const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalCommissions = allBookings.reduce((sum, b) => sum + b.commissionAmount, 0);
    const guideEarnings = allBookings.reduce((sum, b) => sum + b.guideEarnings, 0);

    return {
      totalRevenue,
      totalCommissions,
      guideEarnings,
      bookingsCount: allBookings.length,
    };
  }
}

export const storage = new DatabaseStorage();
