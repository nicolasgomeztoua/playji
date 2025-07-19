import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuthActions } from "@convex-dev/auth/react";

export default function SignInScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('email', email);
      formData.set('password', password);
      formData.set('flow', flow);
      
      await signIn("password", formData);
    } catch (error: any) {
      let alertTitle = "";
      if (error.message.includes("Invalid password")) {
        alertTitle = "Mot de passe invalide. Veuillez réessayer.";
      } else {
        alertTitle = flow === "signIn"
          ? "Impossible de se connecter, vouliez-vous vous inscrire ?"
          : "Impossible de s'inscrire, vouliez-vous vous connecter ?";
      }
      Alert.alert('Erreur', alertTitle);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setSubmitting(true);
    try {
      await signIn("anonymous");
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter anonymement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Playji</Text>
            <Text style={styles.subtitle}>Réservez votre terrain de sport</Text>
            <Text style={styles.description}>Padel • Tennis • Football • Basketball</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!submitting}
            />
            
            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {flow === "signIn" ? "Se connecter" : "S'inscrire"}
                </Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {flow === "signIn"
                  ? "Pas de compte ? "
                  : "Déjà un compte ? "}
              </Text>
              <TouchableOpacity
                onPress={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                disabled={submitting}
              >
                <Text style={styles.switchLink}>
                  {flow === "signIn" ? "S'inscrire" : "Se connecter"}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <TouchableOpacity
              style={[styles.button, styles.anonymousButton, submitting && styles.buttonDisabled]}
              onPress={handleAnonymousSignIn}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>Connexion anonyme</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#4b5563',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00D4AA',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchText: {
    fontSize: 14,
    color: '#6b7280',
  },
  switchLink: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  anonymousButton: {
    backgroundColor: '#6b7280',
  },
});