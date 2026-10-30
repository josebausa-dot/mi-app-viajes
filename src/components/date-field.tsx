import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, parseISO, toISO } from '@/utils/dates';

type DateFieldProps = {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  minimumDate?: string;
};

export function DateField({ label, value, onChange, minimumDate }: DateFieldProps) {
  const theme = useTheme();
  const date = value ? parseISO(value) : null;
  const minDate = minimumDate ? (parseISO(minimumDate) ?? undefined) : undefined;

  const clear = value ? (
    <ThemedText type="linkPrimary" onPress={() => onChange(undefined)}>
      Quitar
    </ThemedText>
  ) : null;

  let control;
  if (Platform.OS === 'web') {
    control = (
      <TextInput
        style={[styles.webInput, { color: theme.text }]}
        value={value ?? ''}
        onChangeText={(text) => onChange(text || undefined)}
        placeholder="AAAA-MM-DD"
        placeholderTextColor={theme.textSecondary}
      />
    );
  } else if (Platform.OS === 'ios') {
    control = date ? (
      <DateTimePicker
        value={date}
        mode="date"
        display="compact"
        themeVariant="dark"
        minimumDate={minDate}
        onChange={(_, selected) => selected && onChange(toISO(selected))}
      />
    ) : (
      <Pressable onPress={() => onChange(toISO(minDate ?? new Date()))}>
        <ThemedText type="linkPrimary">Elegir fecha</ThemedText>
      </Pressable>
    );
  } else {
    control = (
      <Pressable
        onPress={() =>
          DateTimePickerAndroid.open({
            value: date ?? minDate ?? new Date(),
            mode: 'date',
            minimumDate: minDate,
            onChange: (_, selected) => selected && onChange(toISO(selected)),
          })
        }>
        <ThemedText type="linkPrimary">{date ? formatDate(value!) : 'Elegir fecha'}</ThemedText>
      </Pressable>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText>{label}</ThemedText>
      <ThemedView type="backgroundElement" style={styles.right}>
        {control}
        {clear}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 48,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  webInput: {
    fontSize: 16,
  },
});
