import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface HomeProps {
  onNavigate: (page: "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard", venueId?: string, courtId?: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const venues = useQuery(api.venues.getVenues, { limit: 6 });
  const userProfile = useQuery(api.users.getUserProfile);
  const seedData = useMutation(api.seed.seedData);
  const [isSeeding, setIsSeeding] = useState(false);

  const sports = [
    { name: "Padel", icon: "🏓", color: "bg-blue-500" },
    { name: "Tennis", icon: "🎾", color: "bg-green-500" },
    { name: "Football", icon: "⚽", color: "bg-red-500" },
    { name: "Basketball", icon: "🏀", color: "bg-orange-500" },
    { name: "Volleyball", icon: "🏐", color: "bg-purple-500" },
  ];

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedData();
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#00D4AA] to-[#00B894] rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Bonjour {userProfile?.firstName || "Joueur"} ! 👋
        </h2>
        <p className="text-white/90 mb-4">
          Trouvez et réservez votre terrain de sport en quelques clics
        </p>
        <button
          onClick={() => onNavigate("search")}
          className="bg-white text-[#00D4AA] px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Rechercher un terrain
        </button>
      </div>

      {/* Quick Sports Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sports populaires</h3>
        <div className="grid grid-cols-3 gap-3">
          {sports.map((sport) => (
            <button
              key={sport.name}
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${sport.color} rounded-full flex items-center justify-center text-2xl mb-2`}>
                {sport.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{sport.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Venues */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Centres recommandés</h3>
          <button
            onClick={() => onNavigate("search")}
            className="text-[#00D4AA] text-sm font-medium"
          >
            Voir tout
          </button>
        </div>

        {venues === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-gray-500 mb-4">Aucun centre disponible pour le moment</p>
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-[#00D4AA] text-white px-4 py-2 rounded-lg hover:bg-[#00B894] transition-colors disabled:opacity-50"
            >
              {isSeeding ? "Chargement..." : "Charger des données d'exemple"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {venues.map((venue) => (
              <button
                key={venue._id}
                onClick={() => onNavigate("venue", venue._id)}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{venue.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{venue.city}</p>
                    <div className="flex items-center gap-2">
                      {venue.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">{venue.rating}</span>
                          <span className="text-sm text-gray-500">({venue.reviewCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">À partir de</div>
                    <div className="font-semibold text-[#00D4AA]">150 MAD/h</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("bookings")}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold text-gray-900">Mes réservations</div>
          <div className="text-sm text-gray-600">Gérer vos réservations</div>
        </button>

        <button
          onClick={() => onNavigate("search")}
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="text-2xl mb-2">📍</div>
          <div className="font-semibold text-gray-900">Près de moi</div>
          <div className="text-sm text-gray-600">Terrains à proximité</div>
        </button>
      </div>
    </div>
  );
}
