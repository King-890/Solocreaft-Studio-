import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { ProjectProvider } from './src/contexts/ProjectContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import InstrumentsLibraryScreen from './src/screens/InstrumentsLibraryScreen';
import InstrumentRoomScreen from './src/screens/InstrumentRoomScreen';
import BandRoomScreen from './src/screens/BandRoomScreen';
import MixerScreen from './src/screens/MixerScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StudioScreen from './src/screens/StudioScreen';
import { View, Text, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📚</Text>
        }}
      />
      <Tab.Screen
        name="Instruments"
        component={InstrumentsLibraryScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🎹</Text>
        }}
      />
      <Tab.Screen
        name="Mixer"
        component={MixerScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🎚️</Text>
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <NavigationContainer key={session ? 'authenticated' : 'unauthenticated'}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Studio" component={StudioScreen} />
            <Stack.Screen name="InstrumentsLibrary" component={InstrumentsLibraryScreen} />
            <Stack.Screen name="InstrumentRoom" component={InstrumentRoomScreen} />
            <Stack.Screen name="BandRoom" component={BandRoomScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}



export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
