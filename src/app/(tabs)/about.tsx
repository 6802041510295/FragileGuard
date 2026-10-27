import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { useMonitoring } from '../../context/MonitoringContext';
import { colors } from '../../theme';

const ITEMS = [
  { icon: 'trending-up' as const, title: 'Tilt & flip', body: 'Compares the current gravity vector with the package baseline.' },
  { icon: 'flash' as const, title: 'Impact', body: 'Detects acceleration that exceeds the selected handling profile.' },
  { icon: 'sync' as const, title: 'Rotation', body: 'Measures three-axis angular velocity from the gyroscope in rad/s.' },
  { icon: 'save' as const, title: 'On-device history', body: 'Stores monitoring history on this device without sending it to a server.' },
];

export default function AboutScreen() {
  const { availability } = useMonitoring();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="How it works" subtitle="A little guardian for every package journey." />
        <View style={styles.sensorCard}>
          <Text style={styles.sensorTitle}>Device status</Text>
          <View style={styles.sensorRow}>
            <SensorStatus label="Accelerometer" ready={availability.accelerometer} />
            <SensorStatus label="Gyroscope" ready={availability.gyroscope} />
          </View>
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.cardTitle}>Before monitoring</Text>
          <View style={styles.stepRow}><Step number="1" text="Secure the phone firmly to the package." /></View>
          <View style={styles.connector} />
          <View style={styles.stepRow}><Step number="2" text="Choose a sensitivity profile for the item." /></View>
          <View style={styles.connector} />
          <View style={styles.stepRow}><Step number="3" text="Recalibrate, then start monitoring." /></View>
        </View>
        <View style={styles.grid}>{ITEMS.map((item) => (
          <View key={item.title} style={styles.infoCard}>
            <View style={styles.infoIcon}><Ionicons name={item.icon} size={20} color={colors.mintDark} /></View>
            <Text style={styles.infoTitle}>{item.title}</Text>
            <Text style={styles.infoBody}>{item.body}</Text>
          </View>
        ))}</View>
        <View style={styles.notice}>
          <Ionicons name="information-circle" size={20} color="#9A7121" />
          <Text style={styles.noticeText}>Keep the app open while monitoring. Your phone may pause sensor updates when the app runs in the background.</Text>
        </View>
        <Text style={styles.version}>FragileGuard · Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SensorStatus({ label, ready }: { label: string; ready: boolean | null }) {
  const color = ready === null ? colors.ochre : ready ? colors.mint : colors.danger;
  return <View style={styles.sensorItem}><View style={[styles.sensorDot, { backgroundColor: color }]} /><Text style={styles.sensorLabel}>{label}</Text><Text style={[styles.sensorValue, { color }]}>{ready === null ? 'Checking' : ready ? 'Ready' : 'Unavailable'}</Text></View>;
}

function Step({ number, text }: { number: string; text: string }) {
  return <><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View><Text style={styles.stepText}>{text}</Text></>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.mintSoft },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 36, gap: 17 },
  sensorCard: { backgroundColor: colors.butter, borderRadius: 24, padding: 17 },
  sensorTitle: { color: colors.cocoa, fontWeight: '900', fontSize: 15 },
  sensorRow: { gap: 10, marginTop: 13 },
  sensorItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cream, borderRadius: 14, padding: 12 },
  sensorDot: { width: 9, height: 9, borderRadius: 5, marginRight: 9 },
  sensorLabel: { color: colors.cocoa, fontSize: 12, fontWeight: '800', flex: 1 },
  sensorValue: { fontSize: 10, fontWeight: '900' },
  flowCard: { backgroundColor: colors.cream, borderRadius: 25, padding: 18 },
  cardTitle: { color: colors.cocoa, fontSize: 17, fontWeight: '900', marginBottom: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: { width: 34, height: 34, borderRadius: 13, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: colors.cream, fontWeight: '900' },
  stepText: { color: colors.cocoaSoft, fontSize: 12, fontWeight: '700', flex: 1 },
  connector: { width: 2, height: 12, backgroundColor: colors.mintSoft, marginLeft: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoCard: { width: '48%', flexGrow: 1, backgroundColor: colors.cream, borderRadius: 22, padding: 15 },
  infoIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.mintSoft, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { color: colors.cocoa, fontSize: 13, fontWeight: '900', marginTop: 10 },
  infoBody: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 4 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: colors.butterLight, borderRadius: 18, padding: 14 },
  noticeText: { color: colors.cocoaSoft, fontSize: 10, lineHeight: 16, flex: 1 },
  version: { textAlign: 'center', color: colors.muted, fontSize: 10 },
});
