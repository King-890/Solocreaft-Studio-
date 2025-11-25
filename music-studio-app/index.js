import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Disable console logs in production for better performance
if (!__DEV__) {
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
}

// Enable performance optimizations
if (Platform.OS === 'android') {
    // Reduce animation overhead on Android
    require('react-native').InteractionManager.setDeadline(100);
}

AppRegistry.registerComponent(appName, () => App);
