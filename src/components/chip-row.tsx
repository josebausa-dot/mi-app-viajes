import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';

type ChipRowProps = {
  options: { key: string; label: string }[];
  selected: string | undefined;
  onSelect: (key: string) => void;
  trailing?: { label: string; onPress: () => void };
};

export function ChipRow({ options, selected, onSelect, trailing }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}>
      {options.map((o) => {
        const active = o.key === selected;
        return (
          <Pressable key={o.key} onPress={() => onSelect(o.key)}>
            <ThemedView
              style={[styles.chip, active ? { backgroundColor: Accent } : undefined]}
              type={active ? undefined : 'backgroundElement'}>
              <ThemedText type="smallBold" style={active ? styles.activeText : undefined}>
                {o.label}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
      {trailing && (
        <Pressable onPress={trailing.onPress}>
          <ThemedView type="backgroundElement" style={styles.chip}>
            <ThemedText type="linkPrimary">{trailing.label}</ThemedText>
          </ThemedView>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
  },
  activeText: {
    color: '#ffffff',
  },
});
