import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type Props = { eyebrow?: string; title: string; subtitle?: string };

export function AppHeader({ eyebrow = 'FRAGILEGUARD', title, subtitle }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.logoBubble}>
        <Image source={require('../../assets/fragile-icon.png')} style={styles.logo} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  copy: { flex: 1 },
  eyebrow: { color: colors.ochre, fontSize: 11, fontWeight: '900', letterSpacing: 2.1 },
  title: { color: colors.cocoa, fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 3 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  logoBubble: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 64, height: 64 },
});
