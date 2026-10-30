import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { DateField } from '@/components/date-field';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useJournal } from '@/context/journal-context';
import { useTrips } from '@/context/trips-context';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/utils/confirm-delete';
import { formatDate, toISO } from '@/utils/dates';
import { pickPhotos } from '@/utils/photos';

const MOODS = ['😄', '😍', '😎', '😴', '😕', '🤒'];

export default function JournalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { trips } = useTrips();
  const { entries, addEntry, deleteEntry } = useJournal();
  const [date, setDate] = useState<string | undefined>(toISO(new Date()));
  const [mood, setMood] = useState(MOODS[0]);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  const trip = trips.find((t) => t.id === id);
  if (!trip) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary">Este viaje ya no existe.</ThemedText>
      </ThemedView>
    );
  }

  const tripEntries = entries
    .filter((e) => e.tripId === trip.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const handleAdd = () => {
    if (!date) return setError('Elige la fecha del día.');
    if (!text.trim() && photos.length === 0) return setError('Escribe algo o añade una foto.');
    addEntry({ tripId: trip.id, date, mood, text: text.trim(), photos });
    setText('');
    setPhotos([]);
    setError('');
  };

  const addPhotos = async (source: 'library' | 'camera') => {
    try {
      const picked = await pickPhotos(source);
      setPhotos((prev) => [...prev, ...picked]);
    } catch {
      setError('No se pudo añadir la foto.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle">Diario de {trip.destination}</ThemedText>

        <DateField label="Día" value={date} onChange={setDate} />

        <ThemedView style={styles.moods}>
          {MOODS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMood(m)}
              style={[
                styles.mood,
                { backgroundColor: theme.backgroundElement },
                mood === m && { borderColor: Accent },
              ]}>
              <ThemedText style={styles.moodText}>{m}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundElement, color: theme.text },
          ]}
          value={text}
          onChangeText={setText}
          placeholder="¿Qué has hecho hoy? Anécdotas, comidas, sitios..."
          placeholderTextColor={theme.textSecondary}
          multiline
          textAlignVertical="top"
        />
        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        <ThemedView style={styles.photoActions}>
          <ThemedText type="linkPrimary" onPress={() => addPhotos('library')}>
            🖼️ Galería
          </ThemedText>
          {Platform.OS !== 'web' ? (
            <ThemedText type="linkPrimary" onPress={() => addPhotos('camera')}>
              📷 Cámara
            </ThemedText>
          ) : null}
        </ThemedView>
        {photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
            {photos.map((uri) => (
              <Pressable key={uri} onPress={() => setPhotos((prev) => prev.filter((p) => p !== uri))}>
                <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                <ThemedText type="small" themeColor="textSecondary">Quitar</ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <PrimaryButton label="Guardar recuerdo" onPress={handleAdd} />

        {tripEntries.length === 0 ? (
          <EmptyState
            emoji="📖"
            title="Tu diario está vacío"
            description="Apunta cada día lo que viviste para recordarlo siempre."
          />
        ) : (
          tripEntries.map((entry) => (
            <ThemedView key={entry.id} type="backgroundElement" style={styles.entry}>
              <ThemedView type="backgroundElement" style={styles.entryHeader}>
                <ThemedText type="smallBold">
                  {entry.mood} {formatDate(entry.date)}
                </ThemedText>
                <ThemedText
                  type="linkPrimary"
                  onPress={() =>
                    confirmDelete('¿Borrar este recuerdo?', () => deleteEntry(entry.id))
                  }>
                  Borrar
                </ThemedText>
              </ThemedView>
              {entry.text ? <ThemedText>{entry.text}</ThemedText> : null}
              {entry.photos?.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                  {entry.photos.map((uri) => (
                    <Image key={uri} source={{ uri }} style={styles.photo} contentFit="cover" />
                  ))}
                </ScrollView>
              ) : null}
            </ThemedView>
          ))
        )}
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
  moods: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  mood: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodText: {
    fontSize: 24,
    lineHeight: 32,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
    minHeight: 120,
  },
  error: {
    color: '#FF6B6B',
  },
  photoActions: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  photoRow: {
    gap: Spacing.two,
  },
  thumb: {
    width: 90,
    height: 90,
    borderRadius: Spacing.two,
  },
  photo: {
    width: 180,
    height: 180,
    borderRadius: Spacing.two,
  },
  entry: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
