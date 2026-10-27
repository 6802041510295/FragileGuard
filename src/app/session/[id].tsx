import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventRow } from '../../components/EventRow';
import { MotionChart } from '../../components/MotionChart';
import { useMonitoring } from '../../context/MonitoringContext';
import { colors } from '../../theme';
import { SensorSample } from '../../types';
import { formatDuration, formatThaiDate } from '../../utils/format';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSession, deleteSession, isLoading } = useMonitoring();
  const session = getSession(id);
  const [replaying, setReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);

  useEffect(() => {
    if (!replaying || !session?.samples.length) return;
    const timer = setInterval(() => {
      setReplayIndex((previous) => {
        if (previous >= session.samples.length - 1) {
          setReplaying(false);
          return 0;
        }
        return previous + 1;
      });
    }, 120);
    return () => clearInterval(timer);
  }, [replaying, session]);

  const replaySample: SensorSample | undefined = useMemo(() => session?.samples[replayIndex], [session, replayIndex]);

  if (isLoading) return <SafeAreaView style={styles.center}><Text style={styles.muted}>กำลังโหลด…</Text></SafeAreaView>;
  if (!session) return (
    <SafeAreaView style={styles.center}>
      <Ionicons name="file-tray-outline" size={42} color={colors.ochre} />
      <Text style={styles.notFound}>ไม่พบข้อมูลการเดินทางนี้</Text>
      <Pressable onPress={() => router.back()} style={styles.smallButton}><Text style={styles.smallButtonText}>ย้อนกลับ</Text></Pressable>
    </SafeAreaView>
  );

  const sample = replaySample ?? session.samples[0];
  const rotateX = `${Math.max(-24, Math.min(24, (sample?.accel.y ?? 0) * 20))}deg`;
  const rotateY = `${Math.max(-24, Math.min(24, -(sample?.accel.x ?? 0) * 20))}deg`;
  const statusText = session.status === 'safe' ? 'เดินทางปลอดภัย' : session.status === 'warning' ? 'พบเหตุการณ์ที่ควรตรวจสอบ' : 'พบความเสี่ยงต่อพัสดุ';
  const statusColor = session.status === 'safe' ? colors.mintDark : session.status === 'warning' ? '#9A7121' : colors.danger;

  const confirmDelete = () => Alert.alert('ลบบันทึกนี้?', 'เมื่อลบแล้วจะไม่สามารถกู้คืนได้', [
    { text: 'ยกเลิก', style: 'cancel' },
    { text: 'ลบ', style: 'destructive', onPress: async () => { await deleteSession(session.id); router.back(); } },
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}><Ionicons name="chevron-back" size={23} color={colors.cocoa} /></Pressable>
        <Text style={styles.topTitle}>สรุปการเดินทาง</Text>
        <Pressable onPress={confirmDelete} style={styles.iconButton}><Ionicons name="trash-outline" size={19} color={colors.danger} /></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.replayCard}>
          <View style={styles.replayHeader}>
            <View><Text style={[styles.status, { color: statusColor }]}>{statusText}</Text><Text style={styles.date}>{formatThaiDate(session.startedAt)}</Text></View>
            <View style={styles.sensitivity}><Text style={styles.sensitivityText}>{session.sensitivity.toUpperCase()}</Text></View>
          </View>
          <View style={[styles.imageWrap, { transform: [{ perspective: 700 }, { rotateX }, { rotateY }] }]}>
            <Image source={require('../../../assets/fragile-icon.png')} style={styles.image} resizeMode="contain" />
          </View>
          <View style={styles.replayFooter}>
            <View><Text style={styles.replayValue}>{sample?.tiltAngle.toFixed(0) ?? '0'}°</Text><Text style={styles.replayLabel}>มุม ณ ช่วงเวลา</Text></View>
            <Pressable onPress={() => { setReplayIndex(0); setReplaying((value) => !value); }} style={styles.replayButton}>
              <Ionicons name={replaying ? 'pause' : 'play'} size={18} color={colors.cream} />
              <Text style={styles.replayButtonText}>{replaying ? 'หยุด' : 'เล่นเส้นทาง'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat label="ระยะเวลา" value={formatDuration(session.endedAt - session.startedAt)} />
          <Stat label="มุมสูงสุด" value={`${session.maxTilt.toFixed(0)}°`} />
          <Stat label="แรงสูงสุด" value={`${session.maxImpact.toFixed(1)}g`} />
          <Stat label="การหมุนสูงสุด" value={`${session.maxRotation.toFixed(1)}`} />
        </View>

        <MotionChart samples={session.samples.slice(0, replayIndex || session.samples.length)} />

        <View style={styles.eventsCard}>
          <Text style={styles.sectionTitle}>รายละเอียดเหตุการณ์</Text>
          <Text style={styles.sectionHint}>{session.events.length} เหตุการณ์ที่บันทึกได้</Text>
          {session.events.length ? session.events.map((event) => <EventRow key={event.id} event={event} />) : (
            <View style={styles.safeEmpty}><Ionicons name="shield-checkmark" size={30} color={colors.mint} /><Text style={styles.safeText}>ไม่พบการจัดการที่เสี่ยงต่อพัสดุ</Text></View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.mintSoft },
  center: { flex: 1, backgroundColor: colors.mintSoft, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { color: colors.muted },
  notFound: { color: colors.cocoa, fontSize: 17, fontWeight: '900', marginTop: 10 },
  smallButton: { backgroundColor: colors.cocoa, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 11, marginTop: 18 },
  smallButtonText: { color: colors.cream, fontWeight: '800' },
  topBar: { height: 58, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { color: colors.cocoa, fontSize: 16, fontWeight: '900' },
  iconButton: { width: 40, height: 40, borderRadius: 15, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 18, paddingBottom: 36, gap: 16 },
  replayCard: { backgroundColor: colors.butter, borderRadius: 29, padding: 18, overflow: 'hidden' },
  replayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { fontSize: 17, fontWeight: '900' },
  date: { color: colors.cocoaSoft, fontSize: 10, marginTop: 4 },
  sensitivity: { backgroundColor: colors.cream, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 6 },
  sensitivityText: { color: colors.mintDark, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  imageWrap: { alignItems: 'center', justifyContent: 'center', height: 190 },
  image: { width: 210, height: 210 },
  replayFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  replayValue: { color: colors.cocoa, fontSize: 25, fontWeight: '900' },
  replayLabel: { color: colors.cocoaSoft, fontSize: 9 },
  replayButton: { backgroundColor: colors.cocoa, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingVertical: 11 },
  replayButtonText: { color: colors.cream, fontSize: 11, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  stat: { width: '48%', flexGrow: 1, backgroundColor: colors.cream, borderRadius: 19, padding: 14 },
  statValue: { color: colors.cocoa, fontSize: 18, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  eventsCard: { backgroundColor: colors.cream, borderRadius: 25, padding: 18 },
  sectionTitle: { color: colors.cocoa, fontSize: 17, fontWeight: '900' },
  sectionHint: { color: colors.muted, fontSize: 10, marginTop: 3, marginBottom: 6 },
  safeEmpty: { alignItems: 'center', paddingVertical: 26 },
  safeText: { color: colors.mintDark, fontSize: 12, fontWeight: '800', marginTop: 8 },
});
