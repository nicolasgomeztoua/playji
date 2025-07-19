import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import ProfileSetup from '../screens/ProfileSetup';

export default function MainNavigator() {
  return (
    <>
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <AuthStack />
      </Unauthenticated>
    </>
  );
}

function AuthenticatedApp() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.users.getUserProfile);

  // Show loading while queries are loading
  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D4AA" />
      </View>
    );
  }

  // Check if user needs to complete profile
  const needsProfile = loggedInUser && !userProfile;

  if (needsProfile) {
    return <ProfileSetup />;
  }

  return <AppTabs />;
}