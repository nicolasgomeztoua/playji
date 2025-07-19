import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface SearchProps {
  onNavigate: (page: "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard", venueId?: string, courtId?: string) => void;
}

export function Search({ onNavigate }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const venues = useQuery(api.venues.searchVenues, {
    searchTerm: searchTerm || undefined,
    city: selectedCity || undefined,
    sport: selectedSport || undefined,
  });

  const cities = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger"];
  const sports = ["padel", "tennis", "football", "basketball", "volleyball"];

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

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un centre sportif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm min-w-0 flex-shrink-0"
          >
            <option value="">Toutes les villes</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm min-w-0 flex-shrink-0"
          >
            <option value="">Tous les sports</option>
            {sports.map((sport) => (
              <option key={sport} value={sport}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCity("");
              setSelectedSport("");
            }}
            className="px-4 py-2 text-[#00D4AA] text-sm font-medium whitespace-nowrap"
          >
            Effacer
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === "map"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Carte
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "map" ? (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-gray-600">Vue carte bientôt disponible</p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {venues === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.map((venue) => (
                  <button
                    key={venue._id}
                    onClick={() => onNavigate("venue", venue._id)}
                    className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {venue.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          📍 {venue.address}, {venue.city}
                        </p>
                        
                        {venue.rating && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">⭐</span>
                              <span className="text-sm font-medium">{venue.rating}</span>
                              <span className="text-sm text-gray-500">
                                ({venue.reviewCount} avis)
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                          {venue.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                            >
                              {amenity === "parking" && "🅿️ Parking"}
                              {amenity === "changing_rooms" && "👕 Vestiaires"}
                              {amenity === "showers" && "🚿 Douches"}
                              {amenity === "cafe" && "☕ Café"}
                              {amenity === "equipment_rental" && "🏓 Location"}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">À partir de</div>
                        <div className="font-semibold text-[#00D4AA]">150 MAD/h</div>
                      </div>
                    </div>

                    {/* Quick action */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">
                        Voir les terrains disponibles
                      </span>
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
      </div>
    </div>
  );
}
