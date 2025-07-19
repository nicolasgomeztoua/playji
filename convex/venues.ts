import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createVenue = mutation({
  args: {
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
    amenities: v.array(v.string()),
    openingHours: v.object({
      monday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      tuesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      wednesday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      thursday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      friday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      saturday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
      sunday: v.object({ open: v.string(), close: v.string(), closed: v.boolean() }),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is a venue owner
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.userType !== "venue_owner") {
      throw new Error("Only venue owners can create venues");
    }

    const venueId = await ctx.db.insert("venues", {
      ownerId: userId,
      name: args.name,
      description: args.description,
      address: args.address,
      city: args.city,
      region: args.region,
      coordinates: args.coordinates,
      phone: args.phone,
      email: args.email,
      website: args.website,
      images: [],
      amenities: args.amenities,
      openingHours: args.openingHours,
      isActive: true,
      isVerified: false,
    });

    return venueId;
  },
});

export const getVenues = query({
  args: {
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let venues;

    if (args.city) {
      venues = await ctx.db
        .query("venues")
        .withIndex("by_city", (q) => q.eq("city", args.city!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(args.limit || 20);
    } else if (args.region) {
      venues = await ctx.db
        .query("venues")
        .withIndex("by_region", (q) => q.eq("region", args.region!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(args.limit || 20);
    } else {
      venues = await ctx.db
        .query("venues")
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(args.limit || 20);
    }

    return venues;
  },
});

export const getVenueById = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.venueId);
    if (!venue || !venue.isActive) {
      return null;
    }

    // Get venue images URLs
    const imageUrls = await Promise.all(
      venue.images.map(async (imageId) => {
        const url = await ctx.storage.getUrl(imageId);
        return url;
      })
    );

    return {
      ...venue,
      imageUrls,
    };
  },
});

export const searchVenues = query({
  args: {
    searchTerm: v.optional(v.string()),
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    sport: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let venues;

    if (args.searchTerm) {
      venues = await ctx.db
        .query("venues")
        .withSearchIndex("search_venues", (q) =>
          q.search("name", args.searchTerm!)
            .eq("isActive", true)
            .eq("city", args.city || "")
        )
        .take(20);
    } else {
      if (args.city) {
        venues = await ctx.db
          .query("venues")
          .withIndex("by_city", (q) => q.eq("city", args.city!))
          .filter((q) => q.eq(q.field("isActive"), true))
          .take(20);
      } else {
        venues = await ctx.db
          .query("venues")
          .filter((q) => q.eq(q.field("isActive"), true))
          .take(20);
      }
    }

    // If sport filter is provided, filter venues that have courts for that sport
    if (args.sport) {
      const venueIds = venues.map(v => v._id);
      const courts = await ctx.db
        .query("courts")
        .withIndex("by_sport", (q) => q.eq("sport", args.sport!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const venuesWithSport = new Set(courts.map(c => c.venueId));
      venues = venues.filter(v => venuesWithSport.has(v._id));
    }

    return venues;
  },
});

export const getMyVenues = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const venues = await ctx.db
      .query("venues")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    return venues;
  },
});
