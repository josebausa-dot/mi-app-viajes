import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipRow } from '@/components/chip-row';
import { DateField } from '@/components/date-field';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TripCard } from '@/components/trip-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useActivities } from '@/context/activities-context';
import { useExpenses } from '@/context/expenses-context';
import { useJournal } from '@/context/journal-context';
import { usePacking } from '@/context/packing-context';
import { usePlaces } from '@/context/places-context';
import { useTrips } from '@/context/trips-context';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/utils/confirm-delete';
import { parseISO } from '@/utils/dates';

export default function HomeScreen() {
  const theme = useTheme();
  const { trips, addTrip: saveTrip, deleteTrip: removeTrip } = useTrips();
  const { deleteExpensesOfTrip } = useExpenses();
  const { deleteActivitiesOfTrip } = useActivities();
  const { deleteItemsOfTrip } = usePacking();
  const { deletePlacesOfTrip } = usePlaces();
  const { deleteEntriesOfTrip } = useJournal();
  const deleteTrip = (id: string) => {
    const trip = trips.find((t) => t.id === id);
    confirmDelete(`¿Borrar el viaje a ${trip?.destination ?? ''} y todos sus datos?`, () => {
      removeTrip(id);
      deleteExpensesOfTrip(id);
      deleteActivitiesOfTrip(id);
      deleteItemsOfTrip(id);
      deletePlacesOfTrip(id);
      deleteEntriesOfTrip(id);
    });
  };
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'date' | 'name'>('recent');
  const [formError, setFormError] = useState<string | undefined>();

  const visibleTrips = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? trips.filter((t) => t.destination.toLowerCase().includes(q)) : trips;
    if (sort === 'name') {
      return [...filtered].sort((a, b) => a.destination.localeCompare(b.destination, 'es'));
    }
    if (sort === 'date') {
      // Los viajes sin fecha de salida van al final
      return [...filtered].sort((a, b) =>
        (a.startDate ?? '9999').localeCompare(b.startDate ?? '9999'),
      );
    }
    return filtered;
  }, [trips, query, sort]);

  const addTrip = () => {
    const name = destination.trim();
    if (!name) {
      setFormError('Escribe el destino antes de añadir el viaje.');
      return;
    }
    if (startDate && !parseISO(startDate)) {
      setFormError('La fecha de salida no es válida. Usa el formato AAAA-MM-DD.');
      return;
    }
    if (endDate && !parseISO(endDate)) {
      setFormError('La fecha de vuelta no es válida. Usa el formato AAAA-MM-DD.');
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setFormError('La fecha de vuelta debe ser igual o posterior a la salida.');
      return;
    }

    saveTrip(name, startDate, endDate);
    setDestination('');
    setStartDate(undefined);
    setEndDate(undefined);
    setFormError(undefined);
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader emoji="🧳" title="Mis viajes" subtitle={`${trips.length} ${trips.length === 1 ? 'viaje' : 'viajes'} planificados`} />

        <ThemedView style={styles.form}>
          <TextInput
            style={inputStyle}
            placeholder="Destino"
            placeholderTextColor={theme.textSecondary}
            value={destination}
            onChangeText={(value) => {
              setDestination(value);
              setFormError(undefined);
            }}
            onSubmitEditing={addTrip}
          />
          <DateField
            label="Salida"
            value={startDate}
            onChange={(value) => {
              setStartDate(value);
              if (value && endDate && endDate < value) setEndDate(value);
              setFormError(undefined);
            }}
          />
          <DateField
            label="Vuelta"
            value={endDate}
            onChange={(value) => {
              setEndDate(value);
              setFormError(undefined);
            }}
            minimumDate={startDate}
          />
          <PrimaryButton label="Añadir viaje" onPress={addTrip} />
          {formError ? (
            <ThemedText style={styles.error} accessibilityRole="alert">
              {formError}
            </ThemedText>
          ) : null}
        </ThemedView>

        {trips.length > 1 ? (
          <ThemedView style={styles.form}>
            <TextInput
              style={inputStyle}
              placeholder="🔍 Buscar destino"
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
            <ChipRow
              options={[
                { key: 'recent', label: 'Recientes' },
                { key: 'date', label: 'Por fecha' },
                { key: 'name', label: 'A-Z' },
              ]}
              selected={sort}
              onSelect={(k) => setSort(k as 'recent' | 'date' | 'name')}
            />
          </ThemedView>
        ) : null}

        <FlatList
          data={visibleTrips}
          keyExtractor={(trip) => trip.id}
          renderItem={({ item }) => <TripCard trip={item} onDelete={deleteTrip} />}
          contentContainerStyle={styles.list}
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              emoji={trips.length === 0 ? '🗺️' : '🔎'}
              title={trips.length === 0 ? 'Aún no hay viajes' : 'No encontramos ese destino'}
              description={
                trips.length === 0
                  ? 'Añade tu primer destino con el formulario de arriba y empieza a organizar la aventura.'
                  : 'Prueba con otro nombre o cambia el texto de búsqueda.'
              }
            />
          }
        />
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
  flex: {
    flex: 1,
  },
  form: {
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
  },
  error: {
    color: '#FFB4AB',
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
});
