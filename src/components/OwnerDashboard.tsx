import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface OwnerDashboardProps {
  onNavigate: (page: "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard", venueId?: string, courtId?: string) => void;
}

export function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const userProfile = useQuery(api.users.getUserProfile);
  const myVenues = useQuery(api.venues.getMyVenues);
  const venueBookings = useQuery(api.bookings.getVenueBookings, {});
  const [activeTab, setActiveTab] = useState<"overview" | "venues" | "bookings">("overview");

  // Check if user is a venue owner
  if (userProfile && userProfile.userType !== "venue_owner") {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600">Cette section est réservée aux propriétaires de centres sportifs.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  // Calculate stats
  const totalVenues = myVenues?.length || 0;
  const totalBookings = venueBookings?.length || 0;
  const todayBookings = venueBookings?.filter(b => b.date === new Date().toISOString().split('T')[0]).length || 0;
  const totalRevenue = venueBookings?.reduce((sum, booking) => sum + booking.totalPrice, 0) || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Gérez vos centres sportifs et réservations</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#00D4AA] text-[#00D4AA]"
                : "border-transparent text-gray-600"
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab("venues")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "venues"
                ? "border-[#00D4AA] text-[#00D4AA]"
                : "border-transparent text-gray-600"
            }`}
          >
            Mes centres ({totalVenues})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "bookings"
                ? "border-[#00D4AA] text-[#00D4AA]"
                : "border-transparent text-gray-600"
            }`}
          >
            Réservations ({totalBookings})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xl">🏢</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalVenues}</div>
                    <div className="text-sm text-gray-600">Centres</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xl">📅</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{todayBookings}</div>
                    <div className="text-sm text-gray-600">Aujourd'hui</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xl">📊</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalBookings}</div>
                    <div className="text-sm text-gray-600">Total réservations</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-xl">💰</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalRevenue}</div>
                    <div className="text-sm text-gray-600">MAD total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Réservations récentes</h3>
              {venueBookings === undefined ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : venueBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucune réservation pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {venueBookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.court?.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(booking.date)} • {formatTime(booking.timeSlot)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#00D4AA]">{booking.totalPrice} MAD</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-2xl">➕</span>
                  <div>
                    <div className="font-medium text-gray-900">Ajouter un centre</div>
                    <div className="text-sm text-gray-600">Créer un nouveau centre sportif</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <div className="font-medium text-gray-900">Gérer les créneaux</div>
                    <div className="text-sm text-gray-600">Configurer la disponibilité</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "venues" && (
          <div className="space-y-4">
            {myVenues === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : myVenues.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucun centre enregistré
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par ajouter votre premier centre sportif
                </p>
                <button className="bg-[#00D4AA] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#00B894] transition-colors">
                  Ajouter un centre
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myVenues.map((venue) => (
                  <button
                    key={venue._id}
                    onClick={() => onNavigate("venue", venue._id)}
                    className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{venue.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">📍 {venue.address}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            venue.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {venue.isActive ? "Actif" : "Inactif"}
                          </span>
                          {venue.isVerified && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Vérifié
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        {venue.rating && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-medium">{venue.rating}</span>
                          </div>
                        )}
                        <div className="text-sm text-gray-500">{venue.reviewCount || 0} avis</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Voir les détails</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {venueBookings === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : venueBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aucune réservation
                </h3>
                <p className="text-gray-600">
                  Les réservations de vos centres apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {venueBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {booking.court?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {booking.court?.sport} • {booking.players.length} joueur(s)
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📅</span>
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>⏰</span>
                        <span>{formatTime(booking.timeSlot)} - {formatTime(booking.endTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>💰</span>
                        <span className="font-semibold text-[#00D4AA]">{booking.totalPrice} MAD</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Voir détails
                      </button>
                      {booking.status === "confirmed" && (
                        <button className="py-2 px-4 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
                          Annuler
                        </button>
                      )}
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
