import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { MonitoringProvider } from '../context/MonitoringContext';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <MonitoringProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.mintSoft }, headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="session/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </MonitoringProvider>
  );
}
