import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, shadows } from '../theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit: string;
  tone?: 'mint' | 'yellow' | 'coral';
};

const TONES = {
  mint: { background: colors.mintSoft, foreground: colors.mintDark },
  yellow: { background: colors.butterLight, foreground: '#9A7121' },
  coral: { background: '#FCE3D9', foreground: colors.coral },
};

export function MetricCard({ icon, label, value, unit, tone = 'mint' }: Props) {
  const palette = TONES[tone];
  return (
    <View style={[styles.card, shadows.card]}>
      <View style={[styles.iconBubble, { backgroundColor: palette.background }]}>
        <Ionicons name={icon} size={19} color={palette.foreground} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 96, borderRadius: 22, backgroundColor: colors.cream, padding: 13 },
  iconBubble: { width: 34, height: 34, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 10 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 3 },
  value: { color: colors.cocoa, fontSize: 22, fontWeight: '900' },
  unit: { color: colors.cocoaSoft, fontSize: 10, fontWeight: '700', marginLeft: 2 },
});
