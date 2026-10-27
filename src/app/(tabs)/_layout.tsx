import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { colors } from '../../theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cream,
        tabBarInactiveTintColor: '#CBAF74',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.cocoa,
          borderTopWidth: 0,
          height: 72,
          paddingTop: 7,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Monitor',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" color={typeof color === 'string' ? color : colors.cocoa} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time" color={typeof color === 'string' ? color : colors.cocoa} size={size} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Guide',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf" color={typeof color === 'string' ? color : colors.cocoa} size={size} />,
        }}
      />
    </Tabs>
  );
}
