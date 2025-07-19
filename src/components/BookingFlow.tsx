import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface BookingFlowProps {
  courtId: string;
  onNavigate: (page: "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard", venueId?: string, courtId?: string) => void;
}

export function BookingFlow({ courtId, onNavigate }: BookingFlowProps) {
  const court = useQuery(api.courts.getCourtById, { courtId: courtId as any });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [duration, setDuration] = useState(1);
  const [players, setPlayers] = useState([{ name: "", phone: "", isRegistered: false }]);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"datetime" | "players" | "confirm">("datetime");

  const createBooking = useMutation(api.bookings.createBooking);

  const availability = useQuery(
    api.availability.getAvailability,
    selectedDate ? { courtId: courtId as any, date: selectedDate } : "skip"
  );

  if (court === undefined) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Terrain introuvable</h2>
        <p className="text-gray-600">Ce terrain n'existe pas ou n'est plus disponible.</p>
      </div>
    );
  }

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const addPlayer = () => {
    if (players.length < court.capacity) {
      setPlayers([...players, { name: "", phone: "", isRegistered: false }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: string, value: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setPlayers(updatedPlayers);
  };

  const handleBooking = async () => {
    try {
      const bookingId = await createBooking({
        courtId: courtId as any,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        duration,
        players,
        notes: notes || undefined,
      });

      toast.success("Réservation confirmée !");
      onNavigate("bookings");
    } catch (error) {
      toast.error("Erreur lors de la réservation");
      console.error(error);
    }
  };

  const totalPrice = court.pricePerHour * duration;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Réserver un terrain</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{court.venue?.name}</span>
          <span>•</span>
          <span>{court.name}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${step === "datetime" ? "text-[#00D4AA]" : "text-gray-400"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              step === "datetime" ? "bg-[#00D4AA] text-white" : "bg-gray-200"
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Date & Heure</span>
          </div>
          <div className={`flex items-center gap-2 ${step === "players" ? "text-[#00D4AA]" : "text-gray-400"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              step === "players" ? "bg-[#00D4AA] text-white" : "bg-gray-200"
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Joueurs</span>
          </div>
          <div className={`flex items-center gap-2 ${step === "confirm" ? "text-[#00D4AA]" : "text-gray-400"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              step === "confirm" ? "bg-[#00D4AA] text-white" : "bg-gray-200"
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Confirmation</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {step === "datetime" && (
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Choisir une date</h3>
              <div className="grid grid-cols-2 gap-2">
                {generateDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedDate === date
                        ? "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Durée</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setDuration(1)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    duration === 1
                      ? "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  1 heure
                </button>
                <button
                  onClick={() => setDuration(2)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    duration === 2
                      ? "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  2 heures
                </button>
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Créneaux disponibles</h3>
                {availability === undefined ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {generateTimeSlots().map((timeSlot) => {
                      const isAvailable = availability.some(
                        (slot) => slot.timeSlot === timeSlot && slot.isAvailable
                      );
                      return (
                        <button
                          key={timeSlot}
                          onClick={() => isAvailable && setSelectedTimeSlot(timeSlot)}
                          disabled={!isAvailable}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            selectedTimeSlot === timeSlot
                              ? "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]"
                              : isAvailable
                              ? "border-gray-300 text-gray-700 hover:border-gray-400"
                              : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          }`}
                        >
                          {timeSlot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === "players" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Joueurs ({players.length}/{court.capacity})
              </h3>
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-900">
                        Joueur {index + 1}
                      </span>
                      {players.length > 1 && (
                        <button
                          onClick={() => removePlayer(index)}
                          className="text-red-600 text-sm"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Nom complet"
                        value={player.name}
                        onChange={(e) => updatePlayer(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                      />
                      <input
                        type="tel"
                        placeholder="Téléphone (optionnel)"
                        value={player.phone}
                        onChange={(e) => updatePlayer(index, "phone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {players.length < court.capacity && (
                <button
                  onClick={addPlayer}
                  className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#00D4AA] hover:text-[#00D4AA] transition-colors"
                >
                  + Ajouter un joueur
                </button>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Notes (optionnel)</h3>
              <textarea
                placeholder="Informations supplémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
              />
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Centre</span>
                  <span className="font-medium">{court.venue?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Terrain</span>
                  <span className="font-medium">{court.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heure</span>
                  <span className="font-medium">
                    {selectedTimeSlot} - {
                      String(parseInt(selectedTimeSlot.split(':')[0]) + duration).padStart(2, '0')
                    }:00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée</span>
                  <span className="font-medium">{duration}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Joueurs</span>
                  <span className="font-medium">{players.length}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-[#00D4AA]">{totalPrice} MAD</span>
                </div>
              </div>
            </div>

            {/* Players List */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Joueurs</h3>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-8 h-8 bg-[#00D4AA] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{player.name}</div>
                      {player.phone && (
                        <div className="text-sm text-gray-600">{player.phone}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-600">{notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          {step !== "datetime" && (
            <button
              onClick={() => {
                if (step === "players") setStep("datetime");
                if (step === "confirm") setStep("players");
              }}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
          )}
          
          <button
            onClick={() => {
              if (step === "datetime" && selectedDate && selectedTimeSlot) {
                setStep("players");
              } else if (step === "players" && players.every(p => p.name.trim())) {
                setStep("confirm");
              } else if (step === "confirm") {
                handleBooking();
              }
            }}
            disabled={
              (step === "datetime" && (!selectedDate || !selectedTimeSlot)) ||
              (step === "players" && !players.every(p => p.name.trim()))
            }
            className="flex-1 py-3 px-4 bg-[#00D4AA] text-white rounded-lg font-medium hover:bg-[#00B894] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === "confirm" ? "Confirmer la réservation" : "Continuer"}
          </button>
        </div>
      </div>
    </div>
  );
}
