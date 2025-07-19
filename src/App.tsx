import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { Home } from "./components/Home";
import { Search } from "./components/Search";
import { Bookings } from "./components/Bookings";
import { Profile } from "./components/Profile";
import { VenueDetails } from "./components/VenueDetails";
import { BookingFlow } from "./components/BookingFlow";
import { OwnerDashboard } from "./components/OwnerDashboard";

type Page = "home" | "search" | "bookings" | "profile" | "venue" | "booking" | "owner-dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.users.getUserProfile);

  // Check if user needs to complete profile
  const needsProfile = loggedInUser && !userProfile;

  const navigateTo = (page: Page, venueId?: string, courtId?: string) => {
    setCurrentPage(page);
    if (venueId) setSelectedVenueId(venueId);
    if (courtId) setSelectedCourtId(courtId);
  };

  const renderContent = () => {
    if (needsProfile) {
      return <Profile isFirstTime={true} />;
    }

    switch (currentPage) {
      case "home":
        return <Home onNavigate={navigateTo} />;
      case "search":
        return <Search onNavigate={navigateTo} />;
      case "bookings":
        return <Bookings onNavigate={navigateTo} />;
      case "profile":
        return <Profile onNavigate={navigateTo} />;
      case "venue":
        return <VenueDetails venueId={selectedVenueId!} onNavigate={navigateTo} />;
      case "booking":
        return <BookingFlow courtId={selectedCourtId!} onNavigate={navigateTo} />;
      case "owner-dashboard":
        return <OwnerDashboard onNavigate={navigateTo} />;
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Authenticated>
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="flex justify-between items-center px-4 py-3">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigateTo("home")}
                  className="text-2xl font-bold text-[#00D4AA]"
                >
                  Playji
                </button>
                {currentPage !== "home" && (
                  <button
                    onClick={() => navigateTo("home")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>
              <SignOutButton />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {renderContent()}
          </main>

          {/* Bottom Navigation */}
          {!needsProfile && (
            <nav className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2">
              <div className="flex justify-around">
                <button
                  onClick={() => navigateTo("home")}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "home" ? "text-[#00D4AA] bg-[#00D4AA]/10" : "text-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-xs">Accueil</span>
                </button>
                
                <button
                  onClick={() => navigateTo("search")}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "search" ? "text-[#00D4AA] bg-[#00D4AA]/10" : "text-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-xs">Recherche</span>
                </button>
                
                <button
                  onClick={() => navigateTo("bookings")}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "bookings" ? "text-[#00D4AA] bg-[#00D4AA]/10" : "text-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Réservations</span>
                </button>
                
                <button
                  onClick={() => navigateTo("profile")}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                    currentPage === "profile" ? "text-[#00D4AA] bg-[#00D4AA]/10" : "text-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs">Profil</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#00D4AA] mb-4">Playji</h1>
              <p className="text-xl text-gray-600 mb-2">Réservez votre terrain de sport</p>
              <p className="text-gray-500">Padel • Tennis • Football • Basketball</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Toaster />
    </div>
  );
}
