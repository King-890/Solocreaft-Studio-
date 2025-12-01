import { registerRootComponent } from 'expo';
import { Platform, LogBox } from 'react-native';
import App from './App';

// Suppress specific warnings
LogBox.ignoreLogs([
    'textShadow',
    'shadow',
    'expo-av',
    'TouchableWithoutFeedback',
    'useNativeDriver',
    'pointerEvents'
]);

// Disable console logs in production for better performance
if (!__DEV__) {
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
}

// Patch console.warn to filter out specific warnings on Web that LogBox might miss
if (Platform.OS === 'web') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && args[0].includes('props.pointerEvents is deprecated')) {
            return;
        }
        originalWarn(...args);
    };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
