import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User roles enum
export const UserRole = {
  USER: "user",
  GUIDE: "guide",
  ADMIN: "admin",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Booking status enum
export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

// Guide approval status enum
export const GuideStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const;

export type GuideStatusType = typeof GuideStatus[keyof typeof GuideStatus];

// Payment status enum
export const PaymentStatus = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

// Document type enum
export const DocumentType = {
  ID_CARD: "id_card",
  CERTIFICATE: "certificate",
  LICENSE: "license",
  PHOTO: "photo",
  OTHER: "other",
} as const;

export type DocumentTypeType = typeof DocumentType[keyof typeof DocumentType];

// Tour category enum
export const TourCategory = {
  ADVENTURE: "adventure",
  CULTURAL: "cultural",
  NATURE: "nature",
  FOOD: "food",
  HISTORICAL: "historical",
  BEACH: "beach",
  CITY: "city",
  WILDLIFE: "wildlife",
} as const;

export type TourCategoryType = typeof TourCategory[keyof typeof TourCategory];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default(UserRole.USER),
  avatarUrl: text("avatar_url"),
  phone: text("phone"),
  bio: text("bio"),
  location: text("location"),
  verified: boolean("verified").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Guide profiles table (extended info for guides)
export const guideProfiles = pgTable("guide_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  businessName: text("business_name"),
  specialties: text("specialties").array(),
  languages: text("languages").array(),
  experience: text("experience"),
  certifications: text("certifications"),
  bankAccount: text("bank_account"),
  taxId: text("tax_id"),
  status: text("status").notNull().default(GuideStatus.PENDING),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  totalEarnings: doublePrecision("total_earnings").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents table (for guide verification)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull().default(DocumentType.OTHER),
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(),
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tours table
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  price: doublePrecision("price").notNull(),
  duration: text("duration").notNull(),
  maxGroupSize: integer("max_group_size").notNull().default(10),
  minGroupSize: integer("min_group_size").default(1),
  category: text("category"),
  difficulty: text("difficulty"),
  includes: text("includes").array(),
  excludes: text("excludes").array(),
  requirements: text("requirements"),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  guideId: integer("guide_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tour images table (multiple images per tour)
export const tourImages = pgTable("tour_images", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").notNull().references(() => tours.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tour availability table (dates when tour is available)
export const tourAvailability = pgTable("tour_availability", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").notNull().references(() => tours.id),
  date: date("date").notNull(),
  startTime: text("start_time"),
  availableSpots: integer("available_spots").notNull(),
  bookedSpots: integer("booked_spots").default(0),
  priceOverride: doublePrecision("price_override"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  tourId: integer("tour_id").notNull().references(() => tours.id),
  availabilityId: integer("availability_id").references(() => tourAvailability.id),
  date: timestamp("date").notNull(),
  guests: integer("guests").notNull().default(1),
  subtotal: doublePrecision("subtotal").notNull(),
  commissionAmount: doublePrecision("commission_amount").notNull().default(0),
  commissionRate: doublePrecision("commission_rate").notNull().default(15),
  guideEarnings: doublePrecision("guide_earnings").notNull().default(0),
  totalPrice: doublePrecision("total_price").notNull(),
  status: text("status").notNull().default(BookingStatus.PENDING),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: integer("cancelled_by").references(() => users.id),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("USD"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  status: text("status").notNull().default(PaymentStatus.PENDING),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Commission payouts to guides
export const commissionPayouts = pgTable("commission_payouts", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("USD"),
  bookingsIncluded: integer("bookings_included").array(),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  status: text("status").notNull().default(PaymentStatus.PENDING),
  paidAt: timestamp("paid_at"),
  transactionId: text("transaction_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Platform settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by").references(() => users.id),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id).unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  tourId: integer("tour_id").notNull().references(() => tours.id),
  guideId: integer("guide_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  response: text("response"),
  responseAt: timestamp("response_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  guideProfile: one(guideProfiles, {
    fields: [users.id],
    references: [guideProfiles.userId],
  }),
  tours: many(tours),
  bookings: many(bookings),
  documents: many(documents),
  reviews: many(reviews),
}));

export const guideProfilesRelations = relations(guideProfiles, ({ one }) => ({
  user: one(users, {
    fields: [guideProfiles.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [guideProfiles.approvedBy],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [documents.verifiedBy],
    references: [users.id],
  }),
}));

export const toursRelations = relations(tours, ({ one, many }) => ({
  guide: one(users, {
    fields: [tours.guideId],
    references: [users.id],
  }),
  images: many(tourImages),
  availability: many(tourAvailability),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const tourImagesRelations = relations(tourImages, ({ one }) => ({
  tour: one(tours, {
    fields: [tourImages.tourId],
    references: [tours.id],
  }),
}));

export const tourAvailabilityRelations = relations(tourAvailability, ({ one, many }) => ({
  tour: one(tours, {
    fields: [tourAvailability.tourId],
    references: [tours.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  tour: one(tours, {
    fields: [bookings.tourId],
    references: [tours.id],
  }),
  availability: one(tourAvailability, {
    fields: [bookings.availabilityId],
    references: [tourAvailability.id],
  }),
  payment: one(payments),
  review: one(reviews),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const commissionPayoutsRelations = relations(commissionPayouts, ({ one }) => ({
  guide: one(users, {
    fields: [commissionPayouts.guideId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  tour: one(tours, {
    fields: [reviews.tourId],
    references: [tours.id],
  }),
  guide: one(users, {
    fields: [reviews.guideId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  verified: true,
  active: true,
});

export const insertGuideProfileSchema = createInsertSchema(guideProfiles).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  approvedBy: true,
  rating: true,
  reviewCount: true,
  totalEarnings: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  verified: true,
  verifiedAt: true,
  verifiedBy: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertTourImageSchema = createInsertSchema(tourImages).omit({
  id: true,
  createdAt: true,
});

export const insertTourAvailabilitySchema = createInsertSchema(tourAvailability).omit({
  id: true,
  createdAt: true,
  bookedSpots: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  cancelledAt: true,
  cancelledBy: true,
  cancelReason: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertCommissionPayoutSchema = createInsertSchema(commissionPayouts).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  response: true,
  responseAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Registration schema with password confirmation
export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  phone: z.string().optional(),
  role: z.enum([UserRole.USER, UserRole.GUIDE]).default(UserRole.USER),
});

// Guide registration schema (extended)
export const guideRegisterSchema = registerSchema.extend({
  businessName: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type GuideProfile = typeof guideProfiles.$inferSelect;
export type InsertGuideProfile = z.infer<typeof insertGuideProfileSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type TourImage = typeof tourImages.$inferSelect;
export type InsertTourImage = z.infer<typeof insertTourImageSchema>;
export type TourAvailability = typeof tourAvailability.$inferSelect;
export type InsertTourAvailability = z.infer<typeof insertTourAvailabilitySchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type CommissionPayout = typeof commissionPayouts.$inferSelect;
export type InsertCommissionPayout = z.infer<typeof insertCommissionPayoutSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GuideRegisterInput = z.infer<typeof guideRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// User without password for API responses
export type SafeUser = Omit<User, "password">;

// Extended types for API responses
export type TourWithGuide = Tour & { guide: SafeUser };
export type TourWithDetails = Tour & { 
  guide: SafeUser; 
  images: TourImage[];
  availability: TourAvailability[];
};
export type BookingWithDetails = Booking & { 
  user: SafeUser; 
  tour: Tour;
};
export type GuideWithProfile = SafeUser & { 
  guideProfile: GuideProfile | null;
  documents: Document[];
};
