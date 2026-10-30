import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useActivities } from '@/context/activities-context';
import { useExpenses } from '@/context/expenses-context';
import { useJournal } from '@/context/journal-context';
import { usePacking } from '@/context/packing-context';
import { usePlaces } from '@/context/places-context';
import { useTrips } from '@/context/trips-context';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/utils/confirm-delete';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, updateTrip, deleteTrip } = useTrips();
  const { deleteExpensesOfTrip } = useExpenses();
  const { deleteActivitiesOfTrip } = useActivities();
  const { deleteItemsOfTrip } = usePacking();
  const { deletePlacesOfTrip } = usePlaces();
  const { deleteEntriesOfTrip } = useJournal();
  const theme = useTheme();
  const trip = trips.find((t) => t.id === id);
  const [budgetText, setBudgetText] = useState(trip?.budget ? String(trip.budget) : '');

  if (!trip) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary">Este viaje ya no existe.</ThemedText>
      </ThemedView>
    );
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  const handleDelete = () => {
    confirmDelete(`¿Borrar el viaje a ${trip.destination} y todos sus datos?`, () => {
      deleteTrip(trip.id);
      deleteExpensesOfTrip(trip.id);
      deleteActivitiesOfTrip(trip.id);
      deleteItemsOfTrip(trip.id);
      deletePlacesOfTrip(trip.id);
      deleteEntriesOfTrip(trip.id);
      router.back();
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ThemedText type="small" themeColor="textSecondary">
          Destino
        </ThemedText>
        <TextInput
          style={inputStyle}
          value={trip.destination}
          onChangeText={(destination) => updateTrip(trip.id, { destination })}
        />

        <ThemedText type="small" themeColor="textSecondary">
          Fechas
        </ThemedText>
        {!trip.startDate && !trip.endDate && trip.dates !== 'Sin fechas' ? (
          <ThemedText type="small" themeColor="textSecondary">
            Antes: {trip.dates}
          </ThemedText>
        ) : null}
        <DateField
          label="Salida"
          value={trip.startDate}
          onChange={(startDate) =>
            updateTrip(trip.id, {
              startDate,
              ...(startDate && trip.endDate && trip.endDate < startDate
                ? { endDate: startDate }
                : {}),
            })
          }
        />
        <DateField
          label="Vuelta"
          value={trip.endDate}
          minimumDate={trip.startDate}
          onChange={(endDate) => updateTrip(trip.id, { endDate })}
        />

        <ThemedText type="small" themeColor="textSecondary">
          Presupuesto (€)
        </ThemedText>
        <TextInput
          style={inputStyle}
          value={budgetText}
          onChangeText={(text) => {
            setBudgetText(text);
            const value = parseFloat(text.replace(',', '.'));
            updateTrip(trip.id, { budget: Number.isFinite(value) && value > 0 ? value : undefined });
          }}
          placeholder="Sin límite"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
        />

        <ThemedText type="small" themeColor="textSecondary">
          Notas
        </ThemedText>
        <TextInput
          style={[inputStyle, styles.notes]}
          value={trip.notes}
          onChangeText={(notes) => updateTrip(trip.id, { notes })}
          placeholder="Vuelos, hotel, planes..."
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.deleteWrapper}>
          <PrimaryButton
            label="📖 Diario de viaje"
            onPress={() => router.push({ pathname: '/diary/[id]', params: { id: trip.id } })}
          />
        </View>

        <View style={styles.deleteWrapper}>
          <PrimaryButton label="Borrar viaje" onPress={handleDelete} danger />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
  },
  notes: {
    minHeight: 140,
  },
  deleteWrapper: {
    marginTop: Spacing.three,
  },
});
