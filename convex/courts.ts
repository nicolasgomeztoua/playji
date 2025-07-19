import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createCourt = mutation({
  args: {
    venueId: v.id("venues"),
    name: v.string(),
    sport: v.string(),
    surface: v.string(),
    size: v.optional(v.string()),
    capacity: v.number(),
    pricePerHour: v.number(),
    amenities: v.array(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user owns the venue
    const venue = await ctx.db.get(args.venueId);
    if (!venue || venue.ownerId !== userId) {
      throw new Error("Not authorized to add courts to this venue");
    }

    const courtId = await ctx.db.insert("courts", {
      venueId: args.venueId,
      name: args.name,
      sport: args.sport,
      surface: args.surface,
      size: args.size,
      capacity: args.capacity,
      pricePerHour: args.pricePerHour,
      images: [],
      amenities: args.amenities,
      isActive: true,
      description: args.description,
    });

    return courtId;
  },
});

export const getCourtsByVenue = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, args) => {
    const courts = await ctx.db
      .query("courts")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return courts;
  },
});

export const getCourtsBySport = query({
  args: { 
    sport: v.string(),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const courts = await ctx.db
      .query("courts")
      .withIndex("by_sport", (q) => q.eq("sport", args.sport))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(args.limit || 20);

    // Get venue details for each court
    const courtsWithVenues = await Promise.all(
      courts.map(async (court) => {
        const venue = await ctx.db.get(court.venueId);
        return {
          ...court,
          venue,
        };
      })
    );

    // Filter by city if provided
    if (args.city) {
      return courtsWithVenues.filter(c => c.venue?.city === args.city);
    }

    return courtsWithVenues;
  },
});

export const getCourtById = query({
  args: { courtId: v.id("courts") },
  handler: async (ctx, args) => {
    const court = await ctx.db.get(args.courtId);
    if (!court || !court.isActive) {
      return null;
    }

    const venue = await ctx.db.get(court.venueId);
    
    // Get court images URLs
    const imageUrls = await Promise.all(
      court.images.map(async (imageId) => {
        const url = await ctx.storage.getUrl(imageId);
        return url;
      })
    );

    return {
      ...court,
      venue,
      imageUrls,
    };
  },
});
