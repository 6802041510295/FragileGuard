import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { EventRow } from '../../components/EventRow';
import { MetricCard } from '../../components/MetricCard';
import { MotionChart } from '../../components/MotionChart';
import { SensitivityPicker } from '../../components/SensitivityPicker';
import { useMonitoring } from '../../context/MonitoringContext';
import { colors, shadows } from '../../theme';
import { formatDuration } from '../../utils/format';

export default function MonitorScreen() {
  const {
    availability,
    isMonitoring,
    elapsedMs,
    liveSample,
    recentSamples,
    currentEvents,
    sensitivity,
    startMonitoring,
    stopMonitoring,
    calibrate,
    setSensitivity,
  } = useMonitoring();

  const sensorsReady = availability.accelerometer === true && availability.gyroscope === true;
  const checking = availability.accelerometer === null || availability.gyroscope === null;

  const handlePrimaryAction = async () => {
    if (isMonitoring) {
      const session = await stopMonitoring();
      if (session) router.push({ pathname: '/session/[id]', params: { id: session.id } });
      return;
    }
    const started = await startMonitoring();
    if (!started) Alert.alert('ไม่พบเซนเซอร์', 'อุปกรณ์นี้ต้องมีทั้ง Accelerometer และ Gyroscope เพื่อเริ่มตรวจสอบ');
  };

  const rotateX = `${Math.max(-18, Math.min(18, liveSample.accel.y * 18))}deg`;
  const rotateY = `${Math.max(-18, Math.min(18, -liveSample.accel.x * 18))}deg`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="ดูแลทุกการเดินทาง" subtitle="ติดตามการเอียง การหมุน และแรงกระแทกของพัสดุ" />

        <LinearGradient colors={[colors.mint, '#75C4A7', '#E7CC67']} locations={[0, 0.63, 1]} style={[styles.hero, shadows.card]}>
          <View style={styles.stars}><Text style={styles.star}>✦</Text><Text style={styles.starSmall}>·</Text><Text style={styles.star}>✦</Text></View>
          <View style={styles.heroCopy}>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: sensorsReady ? '#EAF8A7' : colors.coral }]} />
              <Text style={styles.statusText}>{checking ? 'กำลังตรวจสอบเซนเซอร์' : sensorsReady ? 'เซนเซอร์พร้อม' : 'เซนเซอร์ไม่พร้อม'}</Text>
            </View>
            <Text style={styles.heroTitle}>{isMonitoring ? 'กำลังเฝ้าระวัง' : 'พร้อมออกเดินทาง!'}</Text>
            <Text style={styles.timer}>{formatDuration(elapsedMs)}</Text>
          </View>
          <View style={[styles.heroImageWrap, { transform: [{ perspective: 700 }, { rotateX }, { rotateY }] }]}>
            <Image source={require('../../../assets/fragile-journey.png')} style={styles.heroImage} resizeMode="contain" />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={handlePrimaryAction}
            style={({ pressed }) => [styles.primaryButton, isMonitoring && styles.stopButton, pressed && styles.pressed]}
          >
            <Ionicons name={isMonitoring ? 'stop' : 'shield-checkmark'} color={colors.cream} size={20} />
            <Text style={styles.primaryButtonText}>{isMonitoring ? 'หยุดและบันทึก' : 'เริ่มตรวจสอบ'}</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>ระดับความไว</Text><Text style={styles.sectionHint}>เลือกให้เหมาะกับสิ่งของก่อนเริ่ม</Text></View>
          <Pressable onPress={calibrate} style={styles.calibrateButton}>
            <Ionicons name="locate" size={15} color={colors.mintDark} />
            <Text style={styles.calibrateText}>ตั้งแนวใหม่</Text>
          </Pressable>
        </View>
        <SensitivityPicker value={sensitivity} onChange={setSensitivity} disabled={isMonitoring} />

        <View style={styles.metricRow}>
          <MetricCard icon="analytics" label="มุมเอียง" value={liveSample.tiltAngle.toFixed(0)} unit="°" tone="mint" />
          <MetricCard icon="flash" label="แรงรวม" value={liveSample.accelerationG.toFixed(1)} unit="g" tone="yellow" />
          <MetricCard icon="sync" label="การหมุน" value={liveSample.rotationRate.toFixed(1)} unit="rad/s" tone="coral" />
        </View>

        <MotionChart samples={recentSamples} />

        <View style={styles.eventCard}>
          <View style={styles.sectionHeader}>
            <View><Text style={styles.sectionTitle}>เหตุการณ์ล่าสุด</Text><Text style={styles.sectionHint}>{currentEvents.length} เหตุการณ์ในรอบนี้</Text></View>
            <View style={styles.countBubble}><Text style={styles.countText}>{currentEvents.length}</Text></View>
          </View>
          {currentEvents.length ? currentEvents.slice(0, 4).map((event) => <EventRow key={event.id} event={event} />) : (
            <View style={styles.emptyEvents}>
              <Ionicons name="leaf" size={24} color={colors.sage} />
              <Text style={styles.emptyTitle}>ยังไม่มีเหตุการณ์ผิดปกติ</Text>
              <Text style={styles.emptySubtitle}>พัสดุของคุณกำลังเดินทางอย่างปลอดภัย</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.mintSoft },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 32, gap: 18 },
  hero: { borderRadius: 32, padding: 18, minHeight: 360, overflow: 'hidden' },
  stars: { position: 'absolute', right: 22, top: 18, flexDirection: 'row', gap: 11, alignItems: 'center' },
  star: { color: colors.butterLight, fontSize: 14 },
  starSmall: { color: colors.butterLight, fontSize: 20 },
  heroCopy: { zIndex: 2 },
  statusPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(50,72,58,0.25)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: colors.cream, fontSize: 10, fontWeight: '800' },
  heroTitle: { color: colors.cream, fontSize: 25, fontWeight: '900', marginTop: 12 },
  timer: { color: colors.cream, fontSize: 15, fontWeight: '800', letterSpacing: 2, marginTop: 2 },
  heroImageWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: -10 },
  heroImage: { width: '105%', height: 225 },
  primaryButton: { backgroundColor: colors.cocoa, borderRadius: 18, minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  stopButton: { backgroundColor: colors.danger },
  primaryButtonText: { color: colors.cream, fontSize: 15, fontWeight: '900' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.cocoa, fontSize: 17, fontWeight: '900' },
  sectionHint: { color: colors.muted, fontSize: 11, marginTop: 2 },
  calibrateButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.cream, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  calibrateText: { color: colors.mintDark, fontSize: 11, fontWeight: '800' },
  metricRow: { flexDirection: 'row', gap: 9 },
  eventCard: { backgroundColor: colors.cream, borderRadius: 26, padding: 18 },
  countBubble: { minWidth: 32, height: 32, paddingHorizontal: 8, borderRadius: 12, backgroundColor: colors.butter, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.cocoa, fontWeight: '900' },
  emptyEvents: { alignItems: 'center', paddingVertical: 25 },
  emptyTitle: { color: colors.cocoa, fontWeight: '800', marginTop: 7 },
  emptySubtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
});
