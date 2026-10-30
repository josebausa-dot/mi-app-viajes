import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';

type EmptyStateProps = {
  emoji: string;
  title: string;
  description: string;
};

export function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedView style={styles.emojiWrap}>
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      </ThemedView>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
        {description}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emojiWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(255,138,61,0.16)',
  },
  emoji: {
    fontSize: 28,
    lineHeight: 36,
    color: Accent,
  },
  description: {
    textAlign: 'center',
  },
});
