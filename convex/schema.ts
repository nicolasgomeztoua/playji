import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Extended user profiles
  userProfiles: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    preferredSports: v.array(v.string()),
    location: v.optional(v.object({
      city: v.string(),
      region: v.string(),
      coordinates: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
    })),
    profileImage: v.optional(v.id("_storage")),
    userType: v.union(v.literal("player"), v.literal("venue_owner")),
    language: v.optional(v.string()), // "fr", "ar", "en"
    isVerified: v.optional(v.boolean()),
  }).index("by_user_id", ["userId"]),

  // Venue owners (business profiles)
  venueOwners: defineTable({
    userId: v.id("users"),
    businessName: v.string(),
    businessType: v.string(), // "individual", "company", "club"
    taxId: v.optional(v.string()),
    businessAddress: v.string(),
    businessPhone: v.string(),
    businessEmail: v.string(),
    bankDetails: v.optional(v.object({
      accountHolder: v.string(),
      iban: v.string(),
      bank: v.string(),
    })),
    isApproved: v.boolean(),
    approvedAt: v.optional(v.number()),
  }).index("by_user_id", ["userId"]),

  // Venues (sports facilities)
  venues: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.string(),
    address: v.string(),
    city: v.string(),
    region: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    phone: v.string(),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    images: v.array(v.id("_storage")),
    amenities: v.array(v.string()), // ["parking", "changing_rooms", "showers", "cafe", "equipment_rental"]
    openingHours: v.object({
      monday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      tuesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      wednesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      thursday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      friday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      saturday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      sunday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
    }),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    isActive: v.boolean(),
    isVerified: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_city", ["city"])
    .index("by_region", ["region"])
    .searchIndex("search_venues", {
      searchField: "name",
      filterFields: ["city", "region", "isActive"],
    }),

  // Courts within venues
  courts: defineTable({
    venueId: v.id("venues"),
    name: v.string(),
    sport: v.string(), // "padel", "football", "tennis", "basketball", "volleyball"
    surface: v.string(), // "artificial_grass", "clay", "hard_court", "indoor", "outdoor"
    size: v.optional(v.string()), // "full", "half", "mini"
    capacity: v.number(), // max players
    pricePerHour: v.number(), // in MAD
    images: v.array(v.id("_storage")),
    amenities: v.array(v.string()), // ["lighting", "covered", "equipment_included"]
    isActive: v.boolean(),
    description: v.optional(v.string()),
  })
    .index("by_venue", ["venueId"])
    .index("by_sport", ["sport"])
    .index("by_venue_and_sport", ["venueId", "sport"]),

  // Court availability slots
  availability: defineTable({
    courtId: v.id("courts"),
    date: v.string(), // YYYY-MM-DD
    timeSlot: v.string(), // "09:00"
    duration: v.number(), // in hours (1 or 2)
    isAvailable: v.boolean(),
    price: v.number(), // can override court base price
    specialOffer: v.optional(v.object({
      type: v.string(), // "discount", "happy_hour"
      value: v.number(), // percentage or fixed amount
      description: v.string(),
    })),
  })
    .index("by_court_and_date", ["courtId", "date"])
    .index("by_court_date_time", ["courtId", "date", "timeSlot"]),

  // Bookings
  bookings: defineTable({
    userId: v.id("users"),
    courtId: v.id("courts"),
    venueId: v.id("venues"),
    date: v.string(), // YYYY-MM-DD
    timeSlot: v.string(), // "09:00"
    duration: v.number(), // in hours
    endTime: v.string(), // calculated end time
    totalPrice: v.number(),
    status: v.string(), // "pending", "confirmed", "cancelled", "completed", "no_show"
    paymentStatus: v.string(), // "pending", "paid", "refunded", "failed"
    paymentMethod: v.optional(v.string()), // "card", "cash", "bank_transfer"
    paymentId: v.optional(v.string()),
    players: v.array(v.object({
      name: v.string(),
      phone: v.optional(v.string()),
      isRegistered: v.boolean(),
      userId: v.optional(v.id("users")),
    })),
    notes: v.optional(v.string()),
    qrCode: v.optional(v.string()),
    cancelledAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    refundAmount: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_court", ["courtId"])
    .index("by_venue", ["venueId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  // Reviews and ratings
  reviews: defineTable({
    userId: v.id("users"),
    venueId: v.id("venues"),
    bookingId: v.optional(v.id("bookings")),
    rating: v.number(), // 1-5
    comment: v.optional(v.string()),
    aspects: v.object({
      cleanliness: v.number(),
      facilities: v.number(),
      staff: v.number(),
      value: v.number(),
    }),
    images: v.optional(v.array(v.id("_storage"))),
    isVerified: v.boolean(), // true if from actual booking
    response: v.optional(v.object({
      text: v.string(),
      respondedAt: v.number(),
      respondedBy: v.id("users"),
    })),
  })
    .index("by_venue", ["venueId"])
    .index("by_user", ["userId"])
    .index("by_booking", ["bookingId"]),

  // Favorites
  favorites: defineTable({
    userId: v.id("users"),
    venueId: v.id("venues"),
  })
    .index("by_user", ["userId"])
    .index("by_venue", ["venueId"])
    .index("by_user_and_venue", ["userId", "venueId"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "booking_confirmed", "booking_reminder", "venue_update", "review_request"
    title: v.string(),
    message: v.string(),
    data: v.optional(v.object({
      bookingId: v.optional(v.id("bookings")),
      venueId: v.optional(v.id("venues")),
      actionUrl: v.optional(v.string()),
    })),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),

  // Analytics events
  analytics: defineTable({
    userId: v.optional(v.id("users")),
    event: v.string(), // "venue_view", "search", "booking_attempt", "booking_completed"
    properties: v.object({
      venueId: v.optional(v.id("venues")),
      courtId: v.optional(v.id("courts")),
      searchQuery: v.optional(v.string()),
      filters: v.optional(v.object({
        sport: v.optional(v.string()),
        city: v.optional(v.string()),
        date: v.optional(v.string()),
        priceRange: v.optional(v.array(v.number())),
      })),
      bookingValue: v.optional(v.number()),
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
    }),
    sessionId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_event", ["event"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
