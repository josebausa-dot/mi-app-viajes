import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  emoji: string;
  title: string;
  subtitle: string;
};

export function ScreenHeader({ emoji, title, subtitle }: ScreenHeaderProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.header}>
      <View style={styles.emojiWrap}>
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      </View>
      <View style={styles.texts}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
        </View>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  emojiWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: Accent,
  },
  emoji: {
    fontSize: 30,
    lineHeight: 38,
  },
  texts: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    color: '#B7C3F0',
  },
});
