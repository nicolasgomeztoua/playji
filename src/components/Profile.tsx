import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileProps {
  isFirstTime?: boolean;
  onNavigate?: (page: "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard", venueId?: string, courtId?: string) => void;
}

export function Profile({ isFirstTime = false, onNavigate }: ProfileProps) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.users.getUserProfile);
  const createProfile = useMutation(api.users.createUserProfile);
  const updateProfile = useMutation(api.users.updateUserProfile);

  const [isEditing, setIsEditing] = useState(isFirstTime);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || "",
    lastName: userProfile?.lastName || "",
    phone: userProfile?.phone || "",
    userType: userProfile?.userType || "player" as "player" | "venue_owner",
    preferredSports: userProfile?.preferredSports || [],
    language: userProfile?.language || "fr",
  });

  const sports = [
    { id: "padel", name: "Padel", icon: "🏓" },
    { id: "tennis", name: "Tennis", icon: "🎾" },
    { id: "football", name: "Football", icon: "⚽" },
    { id: "basketball", name: "Basketball", icon: "🏀" },
    { id: "volleyball", name: "Volleyball", icon: "🏐" },
  ];

  const handleSportToggle = (sportId: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSports: prev.preferredSports.includes(sportId)
        ? prev.preferredSports.filter(s => s !== sportId)
        : [...prev.preferredSports, sportId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (isFirstTime) {
        await createProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          userType: formData.userType,
          preferredSports: formData.preferredSports,
          language: formData.language,
        });
        toast.success("Profil créé avec succès !");
      } else {
        await updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          preferredSports: formData.preferredSports,
          language: formData.language,
        });
        toast.success("Profil mis à jour !");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    }
  };

  if (isFirstTime) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#00D4AA] mb-2">Bienvenue sur Playji !</h1>
            <p className="text-gray-600">Complétez votre profil pour commencer</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                placeholder="+212 6XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: "player" }))}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    formData.userType === "player"
                      ? "border-[#00D4AA] bg-[#00D4AA]/10"
                      : "border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🏃</div>
                  <div className="font-medium">Joueur</div>
                  <div className="text-sm text-gray-600">Réserver des terrains</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: "venue_owner" }))}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    formData.userType === "venue_owner"
                      ? "border-[#00D4AA] bg-[#00D4AA]/10"
                      : "border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-medium">Propriétaire</div>
                  <div className="text-sm text-gray-600">Gérer des centres</div>
                </button>
              </div>
            </div>

            {formData.userType === "player" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sports préférés
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sports.map((sport) => (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => handleSportToggle(sport.id)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.preferredSports.includes(sport.id)
                          ? "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="text-lg mb-1">{sport.icon}</div>
                      <div className="text-xs font-medium">{sport.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#00D4AA] text-white py-3 rounded-lg font-semibold hover:bg-[#00B894] transition-colors"
            >
              Créer mon profil
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#00D4AA] font-medium"
            >
              Modifier
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D4AA] focus:border-transparent"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loggedInUser?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>
            </div>

            {userProfile?.userType === "player" && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sports préférés</h2>
                <div className="grid grid-cols-3 gap-3">
                  {sports.map((sport) => (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => handleSportToggle(sport.id)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.preferredSports.includes(sport.id)
                          ? "border-[#00D4AA] bg-[#00D4AA]/10 text-[#00D4AA]"
                          : "border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="text-2xl mb-2">{sport.icon}</div>
                      <div className="text-sm font-medium">{sport.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: userProfile?.firstName || "",
                    lastName: userProfile?.lastName || "",
                    phone: userProfile?.phone || "",
                    userType: userProfile?.userType || "player",
                    preferredSports: userProfile?.preferredSports || [],
                    language: userProfile?.language || "fr",
                  });
                }}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-[#00D4AA] text-white rounded-lg font-medium hover:bg-[#00B894] transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#00D4AA] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </h2>
                  <p className="text-gray-600">{loggedInUser?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userProfile?.userType === "player" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {userProfile?.userType === "player" ? "Joueur" : "Propriétaire"}
                    </span>
                    {userProfile?.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Vérifié
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📞</span>
                  <span className="text-gray-600">
                    {userProfile?.phone || "Aucun téléphone renseigné"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">🌍</span>
                  <span className="text-gray-600">
                    {userProfile?.language === "fr" ? "Français" : 
                     userProfile?.language === "ar" ? "العربية" : "English"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sports Preferences */}
            {userProfile?.userType === "player" && userProfile?.preferredSports && userProfile.preferredSports.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sports préférés</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.preferredSports.map((sportId) => {
                    const sport = sports.find(s => s.id === sportId);
                    return sport ? (
                      <div
                        key={sportId}
                        className="flex items-center gap-2 px-3 py-2 bg-[#00D4AA]/10 text-[#00D4AA] rounded-lg"
                      >
                        <span>{sport.icon}</span>
                        <span className="text-sm font-medium">{sport.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                {userProfile?.userType === "venue_owner" && (
                  <button
                    onClick={() => onNavigate?.("owner-dashboard")}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">🏢</span>
                    <div>
                      <div className="font-medium text-gray-900">Tableau de bord propriétaire</div>
                      <div className="text-sm text-gray-600">Gérer vos centres et réservations</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={() => onNavigate?.("bookings")}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-2xl">📅</span>
                  <div>
                    <div className="font-medium text-gray-900">Mes réservations</div>
                    <div className="text-sm text-gray-600">Voir l'historique de vos réservations</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
