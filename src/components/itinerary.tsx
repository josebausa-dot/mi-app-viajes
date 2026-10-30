import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ChipRow } from '@/components/chip-row';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useActivities } from '@/context/activities-context';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/utils/confirm-delete';

export function Itinerary({ tripId }: { tripId: string }) {
  const theme = useTheme();
  const { activities, addActivity, deleteActivity } = useActivities();
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');

  const tripActivities = activities.filter((a) => a.tripId === tripId);
  const lastDay = tripActivities.reduce((max, a) => Math.max(max, a.day), 1);
  const dayCount = Math.max(lastDay, day);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  const dayActivities = tripActivities
    .filter((a) => a.day === day)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleAdd = () => {
    if (!title.trim()) return;
    addActivity({ tripId, day, time: time.trim(), title: title.trim() });
    setTime('');
    setTitle('');
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Día seleccionado
      </ThemedText>

      <ChipRow
        options={days.map((d) => ({ key: String(d), label: `Día ${d}` }))}
        selected={String(day)}
        onSelect={(d) => setDay(Number(d))}
        trailing={{ label: '+ Día', onPress: () => setDay(dayCount + 1) }}
      />

      {dayActivities.length === 0 ? (
        <EmptyState
          emoji="☀️"
          title={`Día ${day} libre`}
          description="Añade una actividad para empezar a planificar este día."
        />
      ) : (
        dayActivities.map((a) => (
          <ThemedView key={a.id} type="backgroundElement" style={styles.activity}>
            <ThemedText type="smallBold" style={styles.time}>
              {a.time || '--:--'}
            </ThemedText>
            <ThemedText style={styles.activityTitle}>{a.title}</ThemedText>
            <ThemedText
              type="linkPrimary"
              onPress={() =>
                confirmDelete(`¿Borrar "${a.title}"?`, () => deleteActivity(a.id))
              }>
              Borrar
            </ThemedText>
          </ThemedView>
        ))
      )}

      <ThemedView style={styles.form}>
        <TextInput
          style={[inputStyle, styles.timeInput]}
          placeholder="Hora"
          placeholderTextColor={theme.textSecondary}
          value={time}
          onChangeText={setTime}
          maxLength={5}
        />
        <TextInput
          style={[inputStyle, styles.flex]}
          placeholder="Actividad"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleAdd}
        />
      </ThemedView>
      <PrimaryButton label={`Añadir al día ${day}`} onPress={handleAdd} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  heading: {
    fontSize: 24,
    lineHeight: 32,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  time: {
    minWidth: 48,
  },
  activityTitle: {
    flex: 1,
  },
  form: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  timeInput: {
    width: 80,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
  },
});
