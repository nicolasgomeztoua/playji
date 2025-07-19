import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ProfileSetup() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const createProfile = useMutation(api.users.createUserProfile);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    userType: "player" as "player" | "venue_owner",
    preferredSports: [] as string[],
    language: "fr",
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

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    try {
      await createProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        userType: formData.userType,
        preferredSports: formData.preferredSports,
        language: formData.language,
      });
      Alert.alert("Succès", "Profil créé avec succès !");
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Bienvenue sur Playji !</Text>
            <Text style={styles.subtitle}>Complétez votre profil pour commencer</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Prénom *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  placeholder="Prénom"
                  editable={!isLoading}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Nom *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Nom"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="+212 6XX XXX XXX"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type de compte</Text>
              <View style={styles.userTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === "player" && styles.userTypeButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, userType: "player" }))}
                  disabled={isLoading}
                >
                  <Text style={styles.userTypeIcon}>🏃</Text>
                  <Text style={styles.userTypeTitle}>Joueur</Text>
                  <Text style={styles.userTypeDesc}>Réserver des terrains</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.userType === "venue_owner" && styles.userTypeButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, userType: "venue_owner" }))}
                  disabled={isLoading}
                >
                  <Text style={styles.userTypeIcon}>🏢</Text>
                  <Text style={styles.userTypeTitle}>Propriétaire</Text>
                  <Text style={styles.userTypeDesc}>Gérer des centres</Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.userType === "player" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sports préférés</Text>
                <View style={styles.sportsContainer}>
                  {sports.map((sport) => (
                    <TouchableOpacity
                      key={sport.id}
                      style={[
                        styles.sportButton,
                        formData.preferredSports.includes(sport.id) && styles.sportButtonActive
                      ]}
                      onPress={() => handleSportToggle(sport.id)}
                      disabled={isLoading}
                    >
                      <Text style={styles.sportIcon}>{sport.icon}</Text>
                      <Text style={styles.sportName}>{sport.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Créer mon profil</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  userTypeButtonActive: {
    borderColor: '#00D4AA',
    backgroundColor: '#00D4AA10',
  },
  userTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  userTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userTypeDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportButton: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  sportButtonActive: {
    borderColor: '#00D4AA',
    backgroundColor: '#00D4AA10',
  },
  sportIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  sportName: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});