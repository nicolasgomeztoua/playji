import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createReview = mutation({
  args: {
    venueId: v.id("venues"),
    bookingId: v.optional(v.id("bookings")),
    rating: v.number(),
    comment: v.optional(v.string()),
    aspects: v.object({
      cleanliness: v.number(),
      facilities: v.number(),
      staff: v.number(),
      value: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user has already reviewed this venue
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("venueId"), args.venueId))
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this venue");
    }

    // If booking ID provided, verify user owns the booking
    let isVerified = false;
    if (args.bookingId) {
      const booking = await ctx.db.get(args.bookingId);
      if (booking && booking.userId === userId && booking.status === "completed") {
        isVerified = true;
      }
    }

    const reviewId = await ctx.db.insert("reviews", {
      userId,
      venueId: args.venueId,
      bookingId: args.bookingId,
      rating: args.rating,
      comment: args.comment,
      aspects: args.aspects,
      isVerified,
    });

    // Update venue rating
    await updateVenueRating(ctx, args.venueId);

    return reviewId;
  },
});

export const getVenueReviews = query({
  args: {
    venueId: v.id("venues"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .order("desc")
      .take(args.limit || 20);

    // Get user details for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user_id", (q) => q.eq("userId", review.userId))
          .unique();
        
        return {
          ...review,
          user: userProfile ? {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
          } : null,
        };
      })
    );

    return reviewsWithUsers;
  },
});

async function updateVenueRating(ctx: any, venueId: string) {
  const reviews = await ctx.db
    .query("reviews")
    .withIndex("by_venue", (q: any) => q.eq("venueId", venueId))
    .collect();

  if (reviews.length === 0) return;

  const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await ctx.db.patch(venueId, {
    rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    reviewCount: reviews.length,
  });
}
