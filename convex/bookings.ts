import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createBooking = mutation({
  args: {
    courtId: v.id("courts"),
    date: v.string(),
    timeSlot: v.string(),
    duration: v.number(),
    players: v.array(v.object({
      name: v.string(),
      phone: v.optional(v.string()),
      isRegistered: v.boolean(),
      userId: v.optional(v.id("users")),
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get court and venue details
    const court = await ctx.db.get(args.courtId);
    if (!court || !court.isActive) {
      throw new Error("Court not found or inactive");
    }

    const venue = await ctx.db.get(court.venueId);
    if (!venue || !venue.isActive) {
      throw new Error("Venue not found or inactive");
    }

    // Check availability
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("by_court", (q) => q.eq("courtId", args.courtId))
      .filter((q) => 
        q.and(
          q.eq(q.field("date"), args.date),
          q.eq(q.field("timeSlot"), args.timeSlot),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .first();

    if (existingBooking) {
      throw new Error("Time slot already booked");
    }

    // Calculate end time and total price
    const startHour = parseInt(args.timeSlot.split(":")[0]);
    const endHour = startHour + args.duration;
    const endTime = `${endHour.toString().padStart(2, "0")}:00`;
    const totalPrice = court.pricePerHour * args.duration;

    // Generate QR code (simple string for now)
    const qrCode = `PLAYJI-${Date.now()}-${args.courtId}`;

    const bookingId = await ctx.db.insert("bookings", {
      userId,
      courtId: args.courtId,
      venueId: court.venueId,
      date: args.date,
      timeSlot: args.timeSlot,
      duration: args.duration,
      endTime,
      totalPrice,
      status: "confirmed", // For MVP, auto-confirm
      paymentStatus: "pending",
      players: args.players,
      notes: args.notes,
      qrCode,
    });

    return bookingId;
  },
});

export const getUserBookings = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let bookings;
    if (args.status) {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_user_and_status", (q) => q.eq("userId", userId).eq("status", args.status!))
        .order("desc")
        .take(args.limit || 20);
    } else {
      bookings = await ctx.db
        .query("bookings")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(args.limit || 20);
    }

    // Get court and venue details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const court = await ctx.db.get(booking.courtId);
        const venue = await ctx.db.get(booking.venueId);
        return {
          ...booking,
          court,
          venue,
        };
      })
    );

    return bookingsWithDetails;
  },
});

export const getBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      return null;
    }

    // Check if user owns this booking or owns the venue
    const venue = await ctx.db.get(booking.venueId);
    if (booking.userId !== userId && venue?.ownerId !== userId) {
      throw new Error("Not authorized to view this booking");
    }

    const court = await ctx.db.get(booking.courtId);

    return {
      ...booking,
      court,
      venue,
    };
  },
});

export const cancelBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Not authorized to cancel this booking");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking already cancelled");
    }

    // Check if cancellation is allowed (e.g., at least 2 hours before)
    const bookingDateTime = new Date(`${booking.date}T${booking.timeSlot}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 2) {
      throw new Error("Cannot cancel booking less than 2 hours before start time");
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancelledAt: Date.now(),
      cancellationReason: args.reason,
    });

    return args.bookingId;
  },
});

export const getVenueBookings = query({
  args: {
    venueId: v.optional(v.id("venues")),
    date: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let bookings;

    if (args.venueId) {
      // Verify user owns the venue
      const venue = await ctx.db.get(args.venueId);
      if (!venue || venue.ownerId !== userId) {
        throw new Error("Not authorized to view bookings for this venue");
      }
      
      let query = ctx.db
        .query("bookings")
        .withIndex("by_venue", (q) => q.eq("venueId", args.venueId!));
      
      if (args.date) {
        query = query.filter((q) => q.eq(q.field("date"), args.date));
      }
      
      if (args.status) {
        query = query.filter((q) => q.eq(q.field("status"), args.status));
      }
      
      bookings = await query.order("desc").take(50);
    } else {
      // Get all venues owned by user
      const venues = await ctx.db
        .query("venues")
        .withIndex("by_owner", (q) => q.eq("ownerId", userId))
        .collect();
      
      if (venues.length === 0) {
        return [];
      }
      
      // Get bookings for first venue (simplified for demo)
      let query = ctx.db
        .query("bookings")
        .withIndex("by_venue", (q) => q.eq("venueId", venues[0]._id));
      
      if (args.date) {
        query = query.filter((q) => q.eq(q.field("date"), args.date));
      }
      
      if (args.status) {
        query = query.filter((q) => q.eq(q.field("status"), args.status));
      }
      
      bookings = await query.order("desc").take(50);
    }

    // Get court details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const court = await ctx.db.get(booking.courtId);
        return {
          ...booking,
          court,
        };
      })
    );

    return bookingsWithDetails;
  },
});
