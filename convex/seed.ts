import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingVenues = await ctx.db.query("venues").take(1);
    if (existingVenues.length > 0) {
      return "Data already seeded";
    }

    // Create sample venue owners
    const owner1Id = await ctx.db.insert("users", {
      email: "owner1@playji.ma",
      name: "Ahmed Benali",
    });

    const owner2Id = await ctx.db.insert("users", {
      email: "owner2@playji.ma", 
      name: "Fatima Alaoui",
    });

    // Create profiles for owners
    await ctx.db.insert("userProfiles", {
      userId: owner1Id,
      firstName: "Ahmed",
      lastName: "Benali",
      phone: "+212661234567",
      userType: "venue_owner",
      preferredSports: [],
      language: "fr",
      isVerified: true,
    });

    await ctx.db.insert("userProfiles", {
      userId: owner2Id,
      firstName: "Fatima",
      lastName: "Alaoui",
      phone: "+212662345678",
      userType: "venue_owner",
      preferredSports: [],
      language: "fr",
      isVerified: true,
    });

    // Sample venues in Casablanca
    const venues = [
      {
        ownerId: owner1Id,
        name: "Club Sportif Anfa",
        description: "Centre sportif moderne avec terrains de padel et tennis de haute qualité",
        address: "Boulevard d'Anfa, Casablanca",
        city: "Casablanca",
        region: "Casablanca-Settat",
        coordinates: { lat: 33.5731, lng: -7.6298 },
        phone: "+212522123456",
        email: "contact@clubanfa.ma",
        amenities: ["parking", "changing_rooms", "showers", "cafe", "equipment_rental"],
      },
      {
        ownerId: owner1Id,
        name: "Padel Center Maarif",
        description: "Premier centre de padel au Maroc avec 8 terrains couverts",
        address: "Rue Abou Hanifa, Maarif, Casablanca",
        city: "Casablanca",
        region: "Casablanca-Settat",
        coordinates: { lat: 33.5892, lng: -7.6114 },
        phone: "+212522234567",
        amenities: ["parking", "changing_rooms", "showers", "pro_shop"],
      },
      {
        ownerId: owner2Id,
        name: "Tennis Club Ain Diab",
        description: "Club de tennis historique avec vue sur l'océan",
        address: "Corniche Ain Diab, Casablanca",
        city: "Casablanca",
        region: "Casablanca-Settat",
        coordinates: { lat: 33.5469, lng: -7.6692 },
        phone: "+212522345678",
        amenities: ["parking", "changing_rooms", "restaurant", "swimming_pool"],
      },
      {
        ownerId: owner2Id,
        name: "Football Academy CIL",
        description: "Académie de football avec terrains synthétiques",
        address: "Californie, Casablanca",
        city: "Casablanca",
        region: "Casablanca-Settat",
        coordinates: { lat: 33.5650, lng: -7.6591 },
        phone: "+212522456789",
        amenities: ["parking", "changing_rooms", "equipment_rental"],
      },
      {
        ownerId: owner1Id,
        name: "Basketball Arena Hay Riad",
        description: "Salle de basketball moderne climatisée",
        address: "Hay Riad, Rabat",
        city: "Rabat",
        region: "Rabat-Salé-Kénitra",
        coordinates: { lat: 33.9716, lng: -6.8498 },
        phone: "+212537123456",
        amenities: ["parking", "changing_rooms", "showers", "cafe"],
      },
    ];

    const defaultOpeningHours = {
      monday: { open: "08:00", close: "22:00", closed: false },
      tuesday: { open: "08:00", close: "22:00", closed: false },
      wednesday: { open: "08:00", close: "22:00", closed: false },
      thursday: { open: "08:00", close: "22:00", closed: false },
      friday: { open: "08:00", close: "22:00", closed: false },
      saturday: { open: "08:00", close: "23:00", closed: false },
      sunday: { open: "08:00", close: "21:00", closed: false },
    };

    const venueIds = [];
    for (const venue of venues) {
      const venueId = await ctx.db.insert("venues", {
        ...venue,
        images: [],
        openingHours: defaultOpeningHours,
        isActive: true,
        isVerified: true,
        rating: 4.2 + Math.random() * 0.8,
        reviewCount: Math.floor(Math.random() * 50) + 10,
      });
      venueIds.push(venueId);
    }

    // Create courts for each venue
    const courts = [
      // Club Sportif Anfa
      { venueId: venueIds[0], name: "Court Padel 1", sport: "padel", surface: "artificial_grass", capacity: 4, pricePerHour: 200 },
      { venueId: venueIds[0], name: "Court Padel 2", sport: "padel", surface: "artificial_grass", capacity: 4, pricePerHour: 200 },
      { venueId: venueIds[0], name: "Court Tennis 1", sport: "tennis", surface: "clay", capacity: 2, pricePerHour: 150 },
      { venueId: venueIds[0], name: "Court Tennis 2", sport: "tennis", surface: "hard_court", capacity: 2, pricePerHour: 150 },
      
      // Padel Center Maarif
      { venueId: venueIds[1], name: "Padel Court A", sport: "padel", surface: "artificial_grass", capacity: 4, pricePerHour: 180 },
      { venueId: venueIds[1], name: "Padel Court B", sport: "padel", surface: "artificial_grass", capacity: 4, pricePerHour: 180 },
      { venueId: venueIds[1], name: "Padel Court C", sport: "padel", surface: "artificial_grass", capacity: 4, pricePerHour: 180 },
      
      // Tennis Club Ain Diab
      { venueId: venueIds[2], name: "Court Central", sport: "tennis", surface: "clay", capacity: 2, pricePerHour: 180 },
      { venueId: venueIds[2], name: "Court 2", sport: "tennis", surface: "clay", capacity: 2, pricePerHour: 160 },
      { venueId: venueIds[2], name: "Court 3", sport: "tennis", surface: "hard_court", capacity: 2, pricePerHour: 140 },
      
      // Football Academy CIL
      { venueId: venueIds[3], name: "Terrain Principal", sport: "football", surface: "artificial_grass", capacity: 22, pricePerHour: 300, size: "full" },
      { venueId: venueIds[3], name: "Terrain 7v7", sport: "football", surface: "artificial_grass", capacity: 14, pricePerHour: 200, size: "half" },
      
      // Basketball Arena Hay Riad
      { venueId: venueIds[4], name: "Court Principal", sport: "basketball", surface: "indoor", capacity: 10, pricePerHour: 250 },
    ];

    for (const court of courts) {
      await ctx.db.insert("courts", {
        ...court,
        images: [],
        amenities: ["lighting", "equipment_included"],
        isActive: true,
        description: `Terrain de ${court.sport} de qualité professionnelle`,
      });
    }

    return "Sample data seeded successfully";
  },
});
