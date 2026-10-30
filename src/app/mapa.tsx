import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipRow } from '@/components/chip-row';
import { EmptyState } from '@/components/empty-state';
import { PlacesMap } from '@/components/places-map';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { usePlaces } from '@/context/places-context';
import { useTrips } from '@/context/trips-context';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/utils/confirm-delete';
import { nameOfPoint, searchPlace } from '@/utils/geocoding';
import type { MapPoint } from '@/utils/map-html';

export default function MapScreen() {
  const theme = useTheme();
  const { trips } = useTrips();
  const { places, addPlace, deletePlace } = usePlaces();
  const [selectedTrip, setSelectedTrip] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [pending, setPending] = useState<MapPoint | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const tripId = trips.some((t) => t.id === selectedTrip) ? selectedTrip : trips[0]?.id;
  const tripPlaces = useMemo(() => places.filter((p) => p.tripId === tripId), [places, tripId]);
  const markers = useMemo(
    () => tripPlaces.map((p) => ({ id: p.id, name: p.name, lat: p.lat, lon: p.lon })),
    [tripPlaces],
  );

  const selectTrip = (id: string) => {
    setSelectedTrip(id);
    setPending(null);
    setError('');
  };

  const handleTap = async (point: MapPoint) => {
    setPending(point);
    setError('');
    try {
      const found = await nameOfPoint(point);
      setName((current) => current.trim() || found || '');
    } catch {}
  };

  const handleAdd = async () => {
    if (!tripId || busy) return;
    const text = name.trim();
    setError('');

    if (pending) {
      addPlace({ tripId, name: text || 'Lugar en el mapa', lat: pending.lat, lon: pending.lon });
      setPending(null);
      setName('');
      return;
    }
    if (!text) {
      setError('Escribe un lugar o toca el mapa para marcarlo.');
      return;
    }
    setBusy(true);
    try {
      const found = await searchPlace(text);
      if (!found) {
        setError('No encontramos ese lugar. Prueba con otro nombre o toca el mapa.');
      } else {
        addPlace({ tripId, name: text, lat: found.lat, lon: found.lon });
        setName('');
      }
    } catch {
      setError('No se pudo buscar. Revisa tu conexión a internet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader emoji="🗺️" title="Mapa" subtitle="Los lugares que visitarás" />

        {!tripId ? (
          <EmptyState
            emoji="🗺️"
            title="Marca tus destinos"
            description="Crea un viaje para añadir en el mapa los lugares que quieres visitar."
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <ChipRow
              options={trips.map((t) => ({ key: t.id, label: t.destination }))}
              selected={tripId}
              onSelect={selectTrip}
            />

            <PlacesMap places={markers} pending={pending} onTap={handleTap} />

            <ThemedText type="small" themeColor="textSecondary">
              {pending
                ? 'Punto marcado. Ponle nombre y pulsa Añadir.'
                : 'Toca el mapa para marcar un punto o busca un lugar por su nombre.'}
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.backgroundElement, color: theme.text },
              ]}
              placeholder="Nombre del lugar (ej. Torre Eiffel)"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              onSubmitEditing={handleAdd}
            />
            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
            <PrimaryButton
              label={busy ? 'Buscando…' : pending ? 'Añadir punto marcado' : 'Buscar y añadir'}
              onPress={handleAdd}
            />

            {tripPlaces.length === 0 ? (
              <EmptyState
                emoji="📍"
                title="Aún no hay lugares"
                description="Busca un sitio por su nombre o tócalo en el mapa para guardarlo."
              />
            ) : (
              tripPlaces.map((place) => (
                <ThemedView key={place.id} type="backgroundElement" style={styles.item}>
                  <ThemedText style={styles.itemName}>📍 {place.name}</ThemedText>
                  <ThemedText
                    type="linkPrimary"
                    onPress={() =>
                      confirmDelete(`¿Borrar "${place.name}"?`, () => deletePlace(place.id))
                    }>
                    Borrar
                  </ThemedText>
                </ThemedView>
              ))
            )}
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
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
  },
  error: {
    color: '#FF6B6B',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  itemName: {
    flex: 1,
  },
});
