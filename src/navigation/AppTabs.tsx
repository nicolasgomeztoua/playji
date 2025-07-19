import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import VenueDetailsScreen from '../screens/VenueDetailsScreen';
import BookingFlowScreen from '../screens/BookingFlowScreen';
import OwnerDashboardScreen from '../screens/OwnerDashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each tab
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VenueDetails" 
        component={VenueDetailsScreen}
        options={{ 
          title: 'Détails du lieu',
          headerStyle: { backgroundColor: '#00D4AA' },
          headerTintColor: 'white'
        }}
      />
      <Stack.Screen 
        name="BookingFlow" 
        component={BookingFlowScreen}
        options={{ 
          title: 'Réservation',
          headerStyle: { backgroundColor: '#00D4AA' },
          headerTintColor: 'white'
        }}
      />
      <Stack.Screen 
        name="OwnerDashboard" 
        component={OwnerDashboardScreen}
        options={{ 
          title: 'Tableau de bord',
          headerStyle: { backgroundColor: '#00D4AA' },
          headerTintColor: 'white'
        }}
      />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SearchMain" 
        component={SearchScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VenueDetails" 
        component={VenueDetailsScreen}
        options={{ 
          title: 'Détails du lieu',
          headerStyle: { backgroundColor: '#00D4AA' },
          headerTintColor: 'white'
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00D4AA',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchStack} 
        options={{ tabBarLabel: 'Recherche' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen} 
        options={{ tabBarLabel: 'Réservations' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}