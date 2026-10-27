import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { HandlingEvent } from '../types';
import { formatEventTime } from '../utils/format';

const ICONS: Record<HandlingEvent['type'], keyof typeof Ionicons.glyphMap> = {
  tilt: 'trending-up',
  flip: 'sync',
  impact: 'flash',
  shake: 'pulse',
  rotation: 'refresh',
};

export function EventRow({ event }: { event: HandlingEvent }) {
  const critical = event.severity === 'critical';
  return (
    <View style={styles.row}>
      <View style={[styles.icon, critical ? styles.criticalIcon : styles.warningIcon]}>
        <Ionicons name={ICONS[event.type]} size={18} color={critical ? colors.danger : '#9A7121'} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.time}>{formatEventTime(event.timestamp)}</Text>
      </View>
      <View style={[styles.badge, critical ? styles.criticalBadge : styles.warningBadge]}>
        <Text style={[styles.detail, critical ? styles.criticalText : styles.warningText]}>{event.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  icon: { width: 39, height: 39, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  criticalIcon: { backgroundColor: '#F9DAD2' },
  warningIcon: { backgroundColor: colors.butterLight },
  copy: { flex: 1 },
  title: { color: colors.cocoa, fontSize: 13, fontWeight: '800' },
  time: { color: colors.muted, fontSize: 11, marginTop: 2 },
  badge: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 },
  criticalBadge: { backgroundColor: '#F9DAD2' },
  warningBadge: { backgroundColor: colors.butterLight },
  detail: { fontSize: 11, fontWeight: '900' },
  criticalText: { color: colors.danger },
  warningText: { color: '#9A7121' },
});
