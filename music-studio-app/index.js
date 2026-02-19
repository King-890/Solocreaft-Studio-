import { registerRootComponent } from 'expo';
import { Platform, LogBox } from 'react-native';
import App from './App';

// Suppress specific warnings that are external or unfixable
LogBox.ignoreLogs([
    'TouchableWithoutFeedback',
    'props.pointerEvents is deprecated',
    '"textShadow*" style props are deprecated',
    'Remote debugger is in a background tab',
    'Sending \'onAnimatedValueUpdate\'',
    'Node.contains: argument is not a Node',
]);

// Disable console logs in production for better performance
if (!__DEV__) {
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
