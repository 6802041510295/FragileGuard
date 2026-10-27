import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import { Sensitivity } from '../types';

const OPTIONS: { key: Sensitivity; label: string }[] = [
  { key: 'gentle', label: 'บอบบาง' },
  { key: 'normal', label: 'ทั่วไป' },
  { key: 'rugged', label: 'ทนทาน' },
];

export function SensitivityPicker({ value, onChange, disabled }: { value: Sensitivity; onChange: (value: Sensitivity) => void; disabled?: boolean }) {
  return (
    <View style={[styles.wrap, disabled && styles.disabled]}>
      {OPTIONS.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => onChange(option.key)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: '#F4E9C2', borderRadius: 17, padding: 4 },
  disabled: { opacity: 0.55 },
  option: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 13 },
  selected: { backgroundColor: colors.cream },
  label: { color: colors.cocoaSoft, fontSize: 12, fontWeight: '700' },
  selectedLabel: { color: colors.mintDark, fontWeight: '900' },
});
