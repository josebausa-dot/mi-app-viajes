import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipRow } from '@/components/chip-row';
import { EmptyState } from '@/components/empty-state';
import { Itinerary } from '@/components/itinerary';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTrips } from '@/context/trips-context';

export default function ItineraryScreen() {
  const { trips } = useTrips();
  const [tripId, setTripId] = useState<string | undefined>(trips[0]?.id);

  // Si el viaje seleccionado se borra, o aún no había ninguno, se elige el primero disponible
  useEffect(() => {
    if (!trips.some((t) => t.id === tripId)) setTripId(trips[0]?.id);
  }, [trips, tripId]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader emoji="🗓️" title="Itinerario" subtitle="Planifica tus días, hora a hora" />

        {!tripId ? (
          <EmptyState
            emoji="🗓️"
            title="Primero, crea un viaje"
            description="Cuando tengas un destino, podrás organizar aquí las actividades de cada día."
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <ChipRow
              options={trips.map((t) => ({ key: t.id, label: t.destination }))}
              selected={tripId}
              onSelect={setTripId}
            />

            <Itinerary key={tripId} tripId={tripId} />
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset,
    gap: Spacing.three,
  },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
});
