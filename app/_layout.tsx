
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Platform, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Configuração só para Android
      NavigationBar.setBackgroundColorAsync('#009de0');
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const isDark = colorScheme === 'light';
  const backgroundColor = '#009de0';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {/* SafeArea com fundo azul em todas as bordas seguras */}
      <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'bottom']}>
        {/* StatusBar: deixa os ícones claros, e remove translucidez */}
        <StatusBar style="light" backgroundColor={backgroundColor} translucent={false} />

        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="simulador/index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
