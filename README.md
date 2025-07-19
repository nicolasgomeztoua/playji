# Playji - Sports Venue Booking App (Expo React Native)

Playji is a sports venue booking application built with Expo React Native and Convex backend. Users can search for and book sports courts (padel, tennis, football, basketball, volleyball) at various venues.

## Features

- **User Authentication**: Sign in/up with email/password or anonymous login
- **User Profiles**: Complete profile setup with preferred sports and user type (player/venue owner)
- **Home Dashboard**: Welcome screen with featured venues and quick actions
- **Search & Browse**: Find sports venues by location and sport type
- **Booking Management**: View and manage your reservations
- **Venue Management**: Dashboard for venue owners to manage their facilities
- **Real-time Data**: Powered by Convex for real-time updates

## Tech Stack

- **Frontend**: Expo React Native
- **Backend**: Convex (real-time database and API)
- **Authentication**: Convex Auth
- **Navigation**: React Navigation v6
- **UI Components**: React Native with custom styling
- **TypeScript**: Full type safety

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Convex

1. Set up your Convex project at [https://convex.dev](https://convex.dev)
2. Update the `.env` file with your Convex URL:

```bash
EXPO_PUBLIC_CONVEX_URL=your_convex_deployment_url_here
```

### 3. Start the Development Servers

Run both the Expo development server and Convex backend:

```bash
npm run dev
```

Or run them separately:

```bash
# Start Convex backend
npm run dev:backend

# Start Expo app
npm run dev:expo
```

### 4. Run on Different Platforms

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web

# Expo Go App (scan QR code)
npm start
```

## Project Structure

```
playji-expo/
├── src/
│   ├── navigation/          # Navigation configuration
│   │   ├── MainNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   └── AppTabs.tsx
│   └── screens/             # App screens
│       ├── SignInScreen.tsx
│       ├── ProfileSetup.tsx
│       ├── HomeScreen.tsx
│       ├── SearchScreen.tsx
│       ├── BookingsScreen.tsx
│       ├── ProfileScreen.tsx
│       ├── VenueDetailsScreen.tsx
│       ├── BookingFlowScreen.tsx
│       └── OwnerDashboardScreen.tsx
├── convex/                  # Convex backend
│   ├── schema.ts
│   ├── auth.ts
│   ├── users.ts
│   ├── venues.ts
│   ├── courts.ts
│   ├── bookings.ts
│   ├── availability.ts
│   ├── reviews.ts
│   └── seed.ts
├── assets/                  # Static assets
├── App.tsx                  # Main app component
├── index.ts                 # Expo entry point
├── app.json                 # Expo configuration
└── package.json
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser
- `npm run dev` - Start both Expo and Convex development servers
- `npm run dev:expo` - Start only Expo development server
- `npm run dev:backend` - Start only Convex backend
- `npm run lint` - Run TypeScript and Convex linting

## Key Features Implementation

### Authentication Flow
- Anonymous and email/password authentication via Convex Auth
- Automatic profile setup flow for new users
- Persistent authentication state

### Navigation Structure
- Tab-based navigation for main app screens
- Stack navigation for detailed views
- Authentication-aware navigation guards

### Real-time Updates
- Live venue data updates
- Real-time booking confirmations
- Instant availability checks

### Cross-Platform Compatibility
- Responsive design for phones and tablets
- Platform-specific optimizations
- Web support via Expo for Web

## Development Notes

### Converting from Web to React Native

This project was converted from a Vite React web application to Expo React Native while maintaining the Convex backend. Key changes included:

1. **Navigation**: Replaced React Router with React Navigation
2. **Styling**: Converted CSS/Tailwind to React Native StyleSheet
3. **Components**: Replaced HTML elements with React Native components
4. **Platform APIs**: Updated to use Expo/React Native APIs
5. **Build System**: Switched from Vite to Metro bundler

### Backend Compatibility

The Convex backend remains unchanged, providing seamless data synchronization between web and mobile versions of the app.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
