import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const venues = useQuery(api.venues.getVenues, { limit: 6 });
  const userProfile = useQuery(api.users.getUserProfile);
  const seedData = useMutation(api.seed.seedData);
  const [isSeeding, setIsSeeding] = useState(false);

  const sports = [
    { name: "Padel", icon: "🏓", color: "#3b82f6" },
    { name: "Tennis", icon: "🎾", color: "#10b981" },
    { name: "Football", icon: "⚽", color: "#ef4444" },
    { name: "Basketball", icon: "🏀", color: "#f97316" },
    { name: "Volleyball", icon: "🏐", color: "#8b5cf6" },
  ];

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedData();
    } catch (error) {
      console.error("Error seeding data:", error);
      Alert.alert("Erreur", "Impossible de charger les données d'exemple");
    } finally {
      setIsSeeding(false);
    }
  };

  const navigateToSearch = () => {
    navigation.navigate('Search');
  };

  const navigateToVenue = (venueId: string) => {
    navigation.navigate('VenueDetails', { venueId });
  };

  const navigateToBookings = () => {
    navigation.navigate('Bookings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <LinearGradient
          colors={['#00D4AA', '#00B894']}
          style={styles.welcomeCard}
        >
          <Text style={styles.welcomeTitle}>
            Bonjour {userProfile?.firstName || "Joueur"} ! 👋
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Trouvez et réservez votre terrain de sport en quelques clics
          </Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={navigateToSearch}
          >
            <Text style={styles.searchButtonText}>Rechercher un terrain</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Sports Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sports populaires</Text>
          <View style={styles.sportsGrid}>
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.name}
                style={styles.sportCard}
                onPress={navigateToSearch}
              >
                <View style={[styles.sportIcon, { backgroundColor: sport.color }]}>
                  <Text style={styles.sportEmoji}>{sport.icon}</Text>
                </View>
                <Text style={styles.sportName}>{sport.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Venues */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Centres recommandés</Text>
            <TouchableOpacity onPress={navigateToSearch}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {venues === undefined ? (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, { width: '50%' }]} />
                </View>
              ))}
            </View>
          ) : venues.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Aucun centre disponible pour le moment
              </Text>
              <TouchableOpacity
                style={[styles.seedButton, isSeeding && styles.seedButtonDisabled]}
                onPress={handleSeedData}
                disabled={isSeeding}
              >
                {isSeeding ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.seedButtonText}>
                    Charger des données d'exemple
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.venuesContainer}>
              {venues.map((venue) => (
                <TouchableOpacity
                  key={venue._id}
                  style={styles.venueCard}
                  onPress={() => navigateToVenue(venue._id)}
                >
                  <View style={styles.venueContent}>
                    <View style={styles.venueInfo}>
                      <Text style={styles.venueName}>{venue.name}</Text>
                      <Text style={styles.venueCity}>{venue.city}</Text>
                      {venue.rating && (
                        <View style={styles.ratingContainer}>
                          <Text style={styles.starIcon}>⭐</Text>
                          <Text style={styles.ratingText}>{venue.rating}</Text>
                          <Text style={styles.reviewCount}>({venue.reviewCount})</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>À partir de</Text>
                      <Text style={styles.priceValue}>150 MAD/h</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={navigateToBookings}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionTitle}>Mes réservations</Text>
              <Text style={styles.actionSubtitle}>Gérer vos réservations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={navigateToSearch}
            >
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={styles.actionTitle}>Près de moi</Text>
              <Text style={styles.actionSubtitle}>Terrains à proximité</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 22,
  },
  searchButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  searchButtonText: {
    color: '#00D4AA',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#00D4AA',
    fontSize: 14,
    fontWeight: '600',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportEmoji: {
    fontSize: 20,
  },
  sportName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  loadingContainer: {
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  seedButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  seedButtonDisabled: {
    opacity: 0.6,
  },
  seedButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  venuesContainer: {
    gap: 12,
  },
  venueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  venueCity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D4AA',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});