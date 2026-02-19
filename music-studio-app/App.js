import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { ProjectProvider } from './src/contexts/ProjectContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { UserProgressProvider } from './src/contexts/UserProgressContext';
import HomeScreen from './src/screens/HomeScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import InstrumentsLibraryScreen from './src/screens/InstrumentsLibraryScreen';
import InstrumentRoomScreen from './src/screens/InstrumentRoomScreen';
import BandRoomScreen from './src/screens/BandRoomScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StudioScreen from './src/screens/StudioScreen';
import DebugScreen from './src/screens/DebugScreen';
import { View, Text, ActivityIndicator, LogBox, Platform } from 'react-native';
import { errorMonitor, setupGlobalErrorHandler } from './src/services/ErrorMonitor';

// Ignore specific warnings
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  'shadow*" style props are deprecated',
]);

// Web & Production console suppression
if (Platform.OS === 'web' || !__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (
      args[0].includes('props.pointerEvents is deprecated') ||
      args[0].includes('shadow*" style props are deprecated') ||
      args[0].includes('Node.contains: argument is not a Node') ||
      args[0].includes('VirtualizedLists should never be nested') ||
      args[0].includes('Remote debugger')
    )) {
      return;
    }
    if (!__DEV__) return; // Suppress all warnings in production
    originalWarn.apply(console, args);
  };

  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (
      args[0].includes('props.pointerEvents is deprecated') ||
      args[0].includes('shadow*" style props are deprecated')
    )) {
      return;
    }
    // Track errors in production but suppress from console if not in dev
    if (!__DEV__) {
        // Here we could add a production logging service call
        return;
    }
    originalError.apply(console, args);
  };
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 App Error Boundary Caught:', error, errorInfo);
    errorMonitor.report(error, {
      type: 'ERROR_BOUNDARY',
      componentStack: errorInfo.componentStack,
      source: 'App.js ErrorBoundary'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffebee',
          padding: 20
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#c62828',
            marginBottom: 10
          }}>
            🚨 App Crashed
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#666',
            textAlign: 'center',
            marginBottom: 20
          }}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
          <Text style={{
            fontSize: 12,
            color: '#999',
            textAlign: 'center'
          }}>
            Check the console for more details
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Error Display Component (shows errors in development)
function ErrorDisplay() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const unsubscribe = errorMonitor.subscribe((error) => {
      setErrors(prev => [error, ...prev.slice(0, 4)]); // Keep last 5 errors
    });

    return unsubscribe;
  }, []);

  // Only show if there are errors AND we are in dev mode, or if explicitly enabled
  if (errors.length === 0) {
    return null;
  }

  return (
    <View style={{
      position: 'absolute',
      top: 50,
      left: 10,
      right: 10,
      zIndex: 9999
    }}>
      {errors.map(error => (
        <View
          key={error.id}
          style={{
            backgroundColor: '#ffebee',
            padding: 10,
            marginBottom: 5,
            borderRadius: 5,
            borderLeftWidth: 4,
            borderLeftColor: '#c62828'
          }}
        >
          <Text style={{ color: '#c62828', fontWeight: 'bold', fontSize: 12 }}>
            {error.message}
          </Text>
          <Text style={{ color: '#666', fontSize: 10 }}>
            {new Date(error.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      ))}
    </View>
  );
}


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
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
}

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <>
      <ErrorDisplay />

      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // Protected Routes
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Studio" component={StudioScreen} />
              <Stack.Screen name="InstrumentsLibrary" component={InstrumentsLibraryScreen} />
              <Stack.Screen name="InstrumentRoom" component={InstrumentRoomScreen} />
              <Stack.Screen name="BandRoom" component={BandRoomScreen} />
              <Stack.Screen
                name="Debug"
                component={DebugScreen}
                options={{
                  title: 'Debug Screen',
                  headerShown: true,
                  headerStyle: { backgroundColor: '#1a1a1a' },
                  headerTintColor: '#fff'
                }}
              />
            </>
          ) : (
            // Auth Routes
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}



export default function App() {
  // Set up global error handler on app startup
  useEffect(() => {
    console.log('🚀 Music Studio App Starting...');
    setupGlobalErrorHandler();

    // Preload audio engine - Non-blocking
    const initAudio = () => {
      // Defer preloading until after the initial render and a small delay
      const timer = setTimeout(async () => {
        try {
          const UnifiedAudioEngine = require('./src/services/UnifiedAudioEngine').default;
          // Run preload in chunks if needed (currently okay as is)
          await UnifiedAudioEngine.preload();
        } catch (e) {
          console.warn('Audio preload failed:', e);
        }
      }, 3000); // 3 seconds delay for stability
      return timer;
    };
    const initTimer = initAudio();
    return () => clearTimeout(initTimer);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ThemeProvider>
            <UserProgressProvider>
              <ProjectProvider>
                <AppContent />
              </ProjectProvider>
            </UserProgressProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
