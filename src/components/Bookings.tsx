import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface BookingsProps {
  onNavigate: (page: "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard", venueId?: string, courtId?: string) => void;
}

export function Bookings({ onNavigate }: BookingsProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  const upcomingBookings = useQuery(api.bookings.getUserBookings, {
    status: "confirmed",
    limit: 10,
  });
  
  const pastBookings = useQuery(api.bookings.getUserBookings, {
    status: "completed",
    limit: 10,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove seconds
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

  const currentBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Mes réservations</h1>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "upcoming"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "past"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Historique
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentBookings === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {activeTab === "upcoming" ? "📅" : "📋"}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === "upcoming" 
                ? "Aucune réservation à venir"
                : "Aucun historique"
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "upcoming"
                ? "Réservez votre premier terrain dès maintenant"
                : "Vos réservations passées apparaîtront ici"
              }
            </p>
            {activeTab === "upcoming" && (
              <button
                onClick={() => onNavigate("search")}
                className="bg-[#00D4AA] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#00B894] transition-colors"
              >
                Rechercher un terrain
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                {/* Booking Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {booking.venue?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {booking.court?.name} • {booking.court?.sport}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                  >
                    {getStatusText(booking.status)}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📅</span>
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>⏰</span>
                    <span>
                      {formatTime(booking.timeSlot)} - {formatTime(booking.endTime)}
                      {" "}({booking.duration}h)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>👥</span>
                    <span>{booking.players.length} joueur(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>💰</span>
                    <span className="font-semibold text-[#00D4AA]">
                      {booking.totalPrice} MAD
                    </span>
                  </div>
                </div>

                {/* QR Code for upcoming bookings */}
                {activeTab === "upcoming" && booking.qrCode && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Code QR</p>
                        <p className="text-xs text-gray-600">Présentez ce code à l'accueil</p>
                      </div>
                      <div className="w-12 h-12 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <span className="text-xs">QR</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate("venue", booking.venueId)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Voir le centre
                  </button>
                  
                  {activeTab === "upcoming" && booking.status === "confirmed" && (
                    <button className="py-2 px-4 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
                      Annuler
                    </button>
                  )}
                  
                  {activeTab === "past" && booking.status === "completed" && (
                    <button className="py-2 px-4 bg-[#00D4AA] text-white rounded-lg text-sm font-medium hover:bg-[#00B894] transition-colors">
                      Noter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
