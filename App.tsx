import React from 'react';
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import MainNavigator from './src/navigation/MainNavigator';

const convex = new ConvexReactClient(Constants.expoConfig?.extra?.CONVEX_URL || process.env.EXPO_PUBLIC_CONVEX_URL as string);

export default function App() {
  return (
    <ConvexAuthProvider client={convex}>
      <NavigationContainer>
        <MainNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </ConvexAuthProvider>
  );
}