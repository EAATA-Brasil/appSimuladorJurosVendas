import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './app'; // Ou o caminho para seu componente principal

// Solução para Expo + React Native CLI
if (Platform.OS === 'android') {
  // Modo build manual
  AppRegistry.registerComponent('main', () => App);
} else {
  // Modo desenvolvimento Expo
  registerRootComponent(App);
}