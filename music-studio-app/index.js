import { AppRegistry, Platform, LogBox } from 'react-native';
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
import appJson from './app.json';
const appName = appJson.expo.slug;
console.log('🚀 index.js: Registering component', appName);

// Disable console logs in production for better performance
if (!__DEV__) {
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
}

// REMOVED: InteractionManager.setDeadline(100) was too aggressive
// and could interfere with animations and timing-sensitive UI.
// The default deadline is sufficient for most use cases.
// if (Platform.OS === 'android') {
//     require('react-native').InteractionManager.setDeadline(100);
// }

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

AppRegistry.registerComponent(appName, () => App);

// Web-specific mounting
if (Platform.OS === 'web') {
    const rootTag = document.getElementById('root') || document.getElementById('main');
    if (rootTag) {
        AppRegistry.runApplication(appName, { rootTag });
    }
}
