import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface VenueDetailsProps {
  venueId: string;
  onNavigate: (page: "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard", venueId?: string, courtId?: string) => void;
}

export function VenueDetails({ venueId, onNavigate }: VenueDetailsProps) {
  const venue = useQuery(api.venues.getVenueById, { venueId: venueId as any });
  const courts = useQuery(api.courts.getCourtsByVenue, { venueId: venueId as any });
  const reviews = useQuery(api.reviews.getVenueReviews, { venueId: venueId as any, limit: 5 });
  const [selectedTab, setSelectedTab] = useState<"courts" | "info" | "reviews">("courts");

  if (venue === undefined) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Centre introuvable</h2>
        <p className="text-gray-600">Ce centre sportif n'existe pas ou n'est plus disponible.</p>
      </div>
    );
  }

  const getSportIcon = (sport: string) => {
    const icons: Record<string, string> = {
      padel: "🏓",
      tennis: "🎾", 
      football: "⚽",
      basketball: "🏀",
      volleyball: "🏐",
    };
    return icons[sport] || "🏃";
  };

  const formatOpeningHours = (day: string) => {
    const hours = venue.openingHours[day as keyof typeof venue.openingHours];
    if (hours.closed) return "Fermé";
    return `${hours.open} - ${hours.close}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hero Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-[#00D4AA] to-[#00B894] flex items-center justify-center">
          <div className="text-6xl">🏟️</div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white mb-1">{venue.name}</h1>
          <p className="text-white/90">📍 {venue.city}</p>
        </div>
      </div>

      {/* Rating and Quick Info */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          {venue.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-semibold">{venue.rating}</span>
                <span className="text-gray-500">({venue.reviewCount} avis)</span>
              </div>
            </div>
          )}
          <div className="text-right">
            <div className="text-sm text-gray-500">À partir de</div>
            <div className="font-semibold text-[#00D4AA]">150 MAD/h</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2">
          {venue.amenities.map((amenity) => (
            <span
              key={amenity}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {amenity === "parking" && "🅿️ Parking"}
              {amenity === "changing_rooms" && "👕 Vestiaires"}
              {amenity === "showers" && "🚿 Douches"}
              {amenity === "cafe" && "☕ Café"}
              {amenity === "equipment_rental" && "🏓 Location"}
              {amenity === "restaurant" && "🍽️ Restaurant"}
              {amenity === "swimming_pool" && "🏊 Piscine"}
              {amenity === "pro_shop" && "🛍️ Boutique"}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setSelectedTab("courts")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === "courts"
                ? "border-[#00D4AA] text-[#00D4AA]"
                : "border-transparent text-gray-600"
            }`}
          >
            Terrains ({courts?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab("info")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === "info"
                ? "border-[#00D4AA] text-[#00D4AA]"
                : "border-transparent text-gray-600"
            }`}
          >
            Infos
          </button>
          <button
            onClick={() => setSelectedTab("reviews")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === "reviews"
                ? "border-[#00D4AA] text-[#00D4AA]"
                : "border-transparent text-gray-600"
            }`}
          >
            Avis ({venue.reviewCount || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedTab === "courts" && (
          <div className="p-4">
            {courts === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : courts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏟️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun terrain disponible
                </h3>
                <p className="text-gray-600">
                  Ce centre n'a pas encore de terrains configurés.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courts.map((court) => (
                  <button
                    key={court._id}
                    onClick={() => onNavigate("booking", venueId, court._id)}
                    className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getSportIcon(court.sport)}</span>
                          <h3 className="font-semibold text-gray-900">{court.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {court.sport.charAt(0).toUpperCase() + court.sport.slice(1)} • {court.surface}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>👥 {court.capacity} joueurs max</span>
                          {court.size && <span>📏 {court.size}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#00D4AA]">
                          {court.pricePerHour} MAD/h
                        </div>
                      </div>
                    </div>

                    {court.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {court.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {amenity === "lighting" && "💡 Éclairage"}
                            {amenity === "covered" && "🏠 Couvert"}
                            {amenity === "equipment_included" && "🏓 Équipement inclus"}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Voir les créneaux</span>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === "info" && (
          <div className="p-4 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{venue.description}</p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span>📍</span>
                  <span className="text-gray-600">{venue.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>📞</span>
                  <span className="text-gray-600">{venue.phone}</span>
                </div>
                {venue.email && (
                  <div className="flex items-center gap-3">
                    <span>✉️</span>
                    <span className="text-gray-600">{venue.email}</span>
                  </div>
                )}
                {venue.website && (
                  <div className="flex items-center gap-3">
                    <span>🌐</span>
                    <span className="text-[#00D4AA]">{venue.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Horaires d'ouverture</h3>
              <div className="space-y-2">
                {Object.entries(venue.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-gray-600 capitalize">
                      {day === "monday" && "Lundi"}
                      {day === "tuesday" && "Mardi"}
                      {day === "wednesday" && "Mercredi"}
                      {day === "thursday" && "Jeudi"}
                      {day === "friday" && "Vendredi"}
                      {day === "saturday" && "Samedi"}
                      {day === "sunday" && "Dimanche"}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatOpeningHours(day)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === "reviews" && (
          <div className="p-4">
            {reviews === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun avis pour le moment
                </h3>
                <p className="text-gray-600">
                  Soyez le premier à laisser un avis sur ce centre.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {review.user?.firstName} {review.user?.lastName}
                          </span>
                          {review.isVerified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Vérifié
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= review.rating ? "text-yellow-500" : "text-gray-300"}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review._creationTime).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-gray-600 mb-3">{review.comment}</p>
                    )}

                    {/* Aspect ratings */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Propreté</span>
                        <span className="font-medium">{review.aspects.cleanliness}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Installations</span>
                        <span className="font-medium">{review.aspects.facilities}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Personnel</span>
                        <span className="font-medium">{review.aspects.staff}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rapport qualité/prix</span>
                        <span className="font-medium">{review.aspects.value}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
