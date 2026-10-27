import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/AppHeader';
import { useMonitoring } from '../../context/MonitoringContext';
import { colors, shadows } from '../../theme';
import { MonitoringSession } from '../../types';
import { formatDuration, formatThaiDate } from '../../utils/format';

const STATUS = {
  safe: { label: 'ปลอดภัย', icon: 'checkmark-circle' as const, color: colors.mintDark, background: colors.mintSoft },
  warning: { label: 'ควรตรวจสอบ', icon: 'alert-circle' as const, color: '#9A7121', background: colors.butterLight },
  critical: { label: 'พบความเสี่ยง', icon: 'warning' as const, color: colors.danger, background: '#F9DAD2' },
};

function SessionCard({ session }: { session: MonitoringSession }) {
  const status = STATUS[session.status];
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/session/[id]', params: { id: session.id } })}
      style={({ pressed }) => [styles.card, shadows.card, pressed && styles.pressed]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.statusIcon, { backgroundColor: status.background }]}>
          <Ionicons name={status.icon} size={22} color={status.color} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.date}>{formatThaiDate(session.startedAt)}</Text>
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
        </View>
        <Ionicons name="chevron-forward" color={colors.cocoaSoft} size={20} />
      </View>
      <View style={styles.stats}>
        <View><Text style={styles.statValue}>{formatDuration(session.endedAt - session.startedAt)}</Text><Text style={styles.statLabel}>ระยะเวลา</Text></View>
        <View style={styles.divider} />
        <View><Text style={styles.statValue}>{session.events.length}</Text><Text style={styles.statLabel}>เหตุการณ์</Text></View>
        <View style={styles.divider} />
        <View><Text style={styles.statValue}>{session.maxImpact.toFixed(1)}g</Text><Text style={styles.statLabel}>แรงสูงสุด</Text></View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const { sessions, clearHistory, isLoading } = useMonitoring();
  const confirmClear = () => Alert.alert('ล้างประวัติทั้งหมด?', 'ข้อมูลการตรวจสอบที่บันทึกไว้จะถูกลบออกจากเครื่อง', [
    { text: 'ยกเลิก', style: 'cancel' },
    { text: 'ล้างข้อมูล', style: 'destructive', onPress: () => void clearHistory() },
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="สมุดการเดินทาง" subtitle="ย้อนดูคุณภาพการขนส่งของแต่ละรอบ" />
        <View style={styles.summaryBanner}>
          <View><Text style={styles.summaryNumber}>{sessions.length}</Text><Text style={styles.summaryLabel}>การเดินทางที่บันทึกไว้</Text></View>
          {sessions.length ? (
            <Pressable onPress={confirmClear} style={styles.clearButton}><Ionicons name="trash-outline" size={16} color={colors.danger} /><Text style={styles.clearText}>ล้างทั้งหมด</Text></Pressable>
          ) : null}
        </View>

        {isLoading ? <Text style={styles.loading}>กำลังเปิดสมุดบันทึก…</Text> : sessions.length ? (
          <View style={styles.list}>{sessions.map((session) => <SessionCard key={session.id} session={session} />)}</View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="map" size={38} color={colors.ochre} /></View>
            <Text style={styles.emptyTitle}>ยังไม่มีการเดินทาง</Text>
            <Text style={styles.emptyBody}>เริ่มตรวจสอบพัสดุหนึ่งรอบ แล้วผลลัพธ์จะถูกเก็บไว้ที่นี่โดยอัตโนมัติ</Text>
            <Pressable onPress={() => router.replace('/')} style={styles.goButton}><Text style={styles.goText}>ไปหน้าเริ่มต้น</Text></Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.mintSoft },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 36, gap: 18 },
  summaryBanner: { backgroundColor: colors.butter, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryNumber: { color: colors.cocoa, fontSize: 30, fontWeight: '900' },
  summaryLabel: { color: colors.cocoaSoft, fontSize: 12, fontWeight: '700' },
  clearButton: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9, backgroundColor: colors.cream, borderRadius: 13 },
  clearText: { color: colors.danger, fontSize: 11, fontWeight: '800' },
  list: { gap: 13 },
  card: { backgroundColor: colors.cream, borderRadius: 24, padding: 16 },
  pressed: { opacity: 0.8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  date: { color: colors.cocoa, fontSize: 14, fontWeight: '900' },
  statusLabel: { fontSize: 11, fontWeight: '800', marginTop: 3 },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, backgroundColor: colors.butterLight, borderRadius: 16, padding: 12 },
  divider: { width: 1, height: 27, backgroundColor: colors.line },
  statValue: { color: colors.cocoa, textAlign: 'center', fontSize: 13, fontWeight: '900' },
  statLabel: { color: colors.muted, textAlign: 'center', fontSize: 9, marginTop: 3 },
  loading: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  empty: { backgroundColor: colors.cream, borderRadius: 28, alignItems: 'center', padding: 28, marginTop: 8 },
  emptyIcon: { width: 72, height: 72, borderRadius: 27, backgroundColor: colors.butterLight, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.cocoa, fontSize: 19, fontWeight: '900', marginTop: 16 },
  emptyBody: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  goButton: { backgroundColor: colors.cocoa, borderRadius: 15, paddingHorizontal: 20, paddingVertical: 12, marginTop: 18 },
  goText: { color: colors.cream, fontWeight: '900', fontSize: 12 },
});
