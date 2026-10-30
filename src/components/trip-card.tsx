import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Colors, Spacing } from '@/constants/theme';
import { countdownLabel } from '@/utils/dates';

export type Trip = {
  id: string;
  destination: string;
  dates: string;
  notes: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
};

type TripCardProps = {
  trip: Trip;
  onDelete: (id: string) => void;
};

export function TripCard({ trip, onDelete }: TripCardProps) {
  const countdown = countdownLabel(trip.startDate, trip.endDate);
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Link href={{ pathname: '/trip/[id]', params: { id: trip.id } }} style={styles.info}>
        <ThemedView type="backgroundElement" style={styles.details}>
          <ThemedText type="subtitle" style={styles.destination}>
            ✈️ {trip.destination}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {trip.dates}
          </ThemedText>
          {countdown ? (
            <ThemedView type="backgroundSelected" style={styles.countdown}>
              <ThemedText type="smallBold">⏳ {countdown}</ThemedText>
            </ThemedView>
          ) : null}
          <ThemedText type="linkPrimary">Ver viaje y notas ›</ThemedText>
        </ThemedView>
      </Link>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Borrar viaje a ${trip.destination}`}
        onPress={() => onDelete(trip.id)}
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
        <ThemedText type="smallBold" style={styles.deleteText}>
          Borrar
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSelected,
    borderLeftWidth: 4,
    borderLeftColor: Accent,
    gap: Spacing.two,
  },
  info: {
    flex: 1,
  },
  details: {
    gap: Spacing.one,
  },
  countdown: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
    marginTop: Spacing.one,
  },
  deleteButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
    marginTop: Spacing.one,
    backgroundColor: 'rgba(255,90,95,0.12)',
  },
  deleteText: {
    color: '#FF8B8F',
  },
  pressed: {
    opacity: 0.7,
  },
  destination: {
    fontSize: 24,
    lineHeight: 30,
  },
});
