import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Polyline, Stop } from 'react-native-svg';

import { colors } from '../theme';
import { SensorSample } from '../types';

type Props = { samples: SensorSample[] };

const WIDTH = 320;
const HEIGHT = 92;

const pointsFor = (values: number[], maxValue: number) => {
  if (values.length < 2) return '';
  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * WIDTH;
      const y = HEIGHT - Math.min(HEIGHT - 6, (Math.abs(value) / maxValue) * (HEIGHT - 12)) - 3;
      return `${x},${y}`;
    })
    .join(' ');
};

export function MotionChart({ samples }: Props) {
  const values = samples.map((sample) => sample.rotationRate);
  const max = Math.max(4, ...values);
  const points = pointsFor(values, max);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>การเคลื่อนไหวล่าสุด</Text>
          <Text style={styles.subtitle}>Rotation rate · rad/s</Text>
        </View>
        <View style={styles.livePill}><View style={styles.dot} /><Text style={styles.live}>LIVE</Text></View>
      </View>
      <View style={styles.chart}>
        {points ? (
          <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            <Defs>
              <LinearGradient id="line" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.ochre} />
                <Stop offset="1" stopColor={colors.coral} />
              </LinearGradient>
            </Defs>
            <Polyline points={points} fill="none" stroke="url(#line)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : (
          <View style={styles.empty}><Text style={styles.emptyText}>กราฟจะเริ่มเมื่อกดตรวจสอบ</Text></View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.cream, borderRadius: 26, padding: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.cocoa, fontSize: 16, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.mintSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.mint },
  live: { color: colors.mintDark, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  chart: { height: HEIGHT, marginTop: 10, overflow: 'hidden' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.butterLight },
  emptyText: { color: colors.cocoaSoft, fontSize: 12, fontWeight: '700' },
});
