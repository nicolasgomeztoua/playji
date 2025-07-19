import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateAvailability = mutation({
  args: {
    courtId: v.id("courts"),
    startDate: v.string(),
    endDate: v.string(),
    timeSlots: v.array(v.string()),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user owns the court's venue
    const court = await ctx.db.get(args.courtId);
    if (!court) {
      throw new Error("Court not found");
    }

    const venue = await ctx.db.get(court.venueId);
    if (!venue || venue.ownerId !== userId) {
      throw new Error("Not authorized to manage this court");
    }

    const availabilityIds = [];
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];

      for (const timeSlot of args.timeSlots) {
        // Check if availability already exists
        const existing = await ctx.db
          .query("availability")
          .withIndex("by_court_date_time", (q) => 
            q.eq("courtId", args.courtId)
             .eq("date", dateString)
             .eq("timeSlot", timeSlot)
          )
          .unique();

        if (!existing) {
          const availabilityId = await ctx.db.insert("availability", {
            courtId: args.courtId,
            date: dateString,
            timeSlot,
            duration: args.duration,
            isAvailable: true,
            price: court.pricePerHour * args.duration,
          });
          availabilityIds.push(availabilityId);
        }
      }
    }

    return availabilityIds;
  },
});

export const getAvailability = query({
  args: {
    courtId: v.id("courts"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("availability")
      .withIndex("by_court_and_date", (q) => 
        q.eq("courtId", args.courtId).eq("date", args.date)
      )
      .collect();

    // Check for existing bookings
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_court", (q) => q.eq("courtId", args.courtId))
      .filter((q) => 
        q.and(
          q.eq(q.field("date"), args.date),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .collect();

    const bookedSlots = new Set(bookings.map(b => b.timeSlot));

    return availability.map(slot => ({
      ...slot,
      isAvailable: slot.isAvailable && !bookedSlots.has(slot.timeSlot),
    }));
  },
});

export const updateAvailability = mutation({
  args: {
    availabilityId: v.id("availability"),
    isAvailable: v.optional(v.boolean()),
    price: v.optional(v.number()),
    specialOffer: v.optional(v.object({
      type: v.string(),
      value: v.number(),
      description: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const availability = await ctx.db.get(args.availabilityId);
    if (!availability) {
      throw new Error("Availability slot not found");
    }

    // Verify user owns the court's venue
    const court = await ctx.db.get(availability.courtId);
    if (!court) {
      throw new Error("Court not found");
    }

    const venue = await ctx.db.get(court.venueId);
    if (!venue || venue.ownerId !== userId) {
      throw new Error("Not authorized to manage this court");
    }

    const updates: any = {};
    if (args.isAvailable !== undefined) updates.isAvailable = args.isAvailable;
    if (args.price !== undefined) updates.price = args.price;
    if (args.specialOffer !== undefined) updates.specialOffer = args.specialOffer;

    await ctx.db.patch(args.availabilityId, updates);
    return args.availabilityId;
  },
});
