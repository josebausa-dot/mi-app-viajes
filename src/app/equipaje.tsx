import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipRow } from '@/components/chip-row';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { PACKING_TEMPLATES, usePacking } from '@/context/packing-context';
import { useTrips } from '@/context/trips-context';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/utils/confirm-delete';

export default function PackingScreen() {
  const theme = useTheme();
  const { trips } = useTrips();
  const { items, addItem, addItems, toggleItem, deleteItem } = usePacking();
  const [tripId, setTripId] = useState<string | undefined>(trips[0]?.id);
  const [name, setName] = useState('');

  // Si el viaje seleccionado se borra, o aún no había ninguno, se elige el primero disponible
  useEffect(() => {
    if (!trips.some((t) => t.id === tripId)) setTripId(trips[0]?.id);
  }, [trips, tripId]);

  const tripItems = items.filter((i) => i.tripId === tripId);
  const packedCount = tripItems.filter((i) => i.packed).length;
  const pending = tripItems.filter((i) => !i.packed);
  const done = tripItems.filter((i) => i.packed);
  const [showDone, setShowDone] = useState(false);

  const renderItem = (item: (typeof tripItems)[number]) => (
    <ThemedView key={item.id} type="backgroundElement" style={styles.item}>
      <Pressable onPress={() => toggleItem(item.id)} style={styles.itemMain}>
        <ThemedText style={styles.check}>{item.packed ? '☑' : '☐'}</ThemedText>
        <ThemedText
          style={[styles.itemName, item.packed && styles.packed]}
          themeColor={item.packed ? 'textSecondary' : 'text'}>
          {item.name}
        </ThemedText>
      </Pressable>
      <ThemedText
        type="linkPrimary"
        onPress={() => confirmDelete(`¿Borrar "${item.name}"?`, () => deleteItem(item.id))}>
        Borrar
      </ThemedText>
    </ThemedView>
  );

  const handleAdd = () => {
    if (!tripId || !name.trim()) return;
    addItem(tripId, name.trim());
    setName('');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader emoji="🎒" title="Equipaje" subtitle="No te dejes nada en casa" />

        {!tripId ? (
          <EmptyState
            emoji="🎒"
            title="Prepara tu próxima maleta"
            description="Crea un viaje para hacer una lista de equipaje y llevar el control de lo que ya has metido."
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

            <ThemedText type="small" themeColor="textSecondary">
              {packedCount} de {tripItems.length} cosas preparadas
            </ThemedText>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.backgroundElement, color: theme.text },
              ]}
              placeholder="Añadir cosa (ej. Pasaporte)"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
              onSubmitEditing={handleAdd}
            />
            <PrimaryButton label="Añadir" onPress={handleAdd} />

            <ThemedText type="small" themeColor="textSecondary">
              Añadir una plantilla
            </ThemedText>
            <ChipRow
              options={Object.keys(PACKING_TEMPLATES).map((k) => ({ key: k, label: k }))}
              selected={undefined}
              onSelect={(k) => addItems(tripId, PACKING_TEMPLATES[k])}
            />

            {tripItems.length === 0 ? (
              <EmptyState
                emoji="🧳"
                title="La lista está vacía"
                description="Añade artículos o elige una plantilla para empezar a preparar el equipaje."
              />
            ) : (
              <>
                {pending.map(renderItem)}
                {pending.length === 0 ? (
                  <ThemedText themeColor="textSecondary">¡Todo preparado! 🎉</ThemedText>
                ) : null}
                {done.length > 0 ? (
                  <>
                    <Pressable onPress={() => setShowDone((v) => !v)}>
                      <ThemedText type="linkPrimary">
                        {showDone ? '▾' : '▸'} Ya preparado ({done.length})
                      </ThemedText>
                    </Pressable>
                    {showDone ? done.map(renderItem) : null}
                  </>
                ) : null}
              </>
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  check: {
    fontSize: 22,
  },
  itemName: {
    flex: 1,
  },
  packed: {
    textDecorationLine: 'line-through',
  },
});
