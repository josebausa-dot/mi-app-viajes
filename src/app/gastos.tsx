import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipRow } from '@/components/chip-row';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const Ok = '#3DDC97';
const Danger = '#FF5A5F';
import { CATEGORIES, useExpenses, type Category } from '@/context/expenses-context';
import { useTrips } from '@/context/trips-context';
import { useTheme } from '@/hooks/use-theme';
import { confirmDelete } from '@/utils/confirm-delete';

const formatEuro = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

export default function ExpensesScreen() {
  const theme = useTheme();
  const { trips } = useTrips();
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const [tripId, setTripId] = useState<string | undefined>(trips[0]?.id);
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Comida');

  // Si el viaje seleccionado se borra, o aún no había ninguno, se elige el primero disponible
  useEffect(() => {
    if (!trips.some((t) => t.id === tripId)) setTripId(trips[0]?.id);
  }, [trips, tripId]);

  const tripExpenses = expenses.filter((e) => e.tripId === tripId);
  const budget = trips.find((t) => t.id === tripId)?.budget;
  const total = tripExpenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    sum: tripExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.sum > 0);

  const handleAdd = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!tripId || !concept.trim() || !Number.isFinite(value) || value <= 0) return;
    addExpense({ tripId, concept: concept.trim(), amount: value, category });
    setConcept('');
    setAmount('');
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScreenHeader emoji="💶" title="Gastos" subtitle="Controla cuánto llevas gastado" />

        {trips.length === 0 ? (
          <EmptyState
            emoji="💶"
            title="Tus gastos, organizados"
            description="Crea un viaje para empezar a anotar gastos y seguir tu presupuesto."
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

            <ThemedView type="backgroundElement" style={styles.totalCard}>
              <ThemedText type="small" themeColor="textSecondary">
                Total gastado
              </ThemedText>
              <ThemedText type="subtitle">{formatEuro(total)}</ThemedText>
              {budget ? (
                <ThemedView type="backgroundElement" style={styles.budget}>
                  <ThemedView style={styles.track}>
                    <ThemedView
                      style={[
                        styles.fill,
                        {
                          width: `${Math.min(100, (total / budget) * 100)}%`,
                          backgroundColor: total > budget ? Danger : total / budget >= 0.8 ? Accent : Ok,
                        },
                      ]}
                    />
                  </ThemedView>
                  <ThemedText type="small" themeColor="textSecondary">
                    {total > budget
                      ? `Te pasas ${formatEuro(total - budget)} del presupuesto de ${formatEuro(budget)}`
                      : `Quedan ${formatEuro(budget - total)} de ${formatEuro(budget)}`}
                  </ThemedText>
                </ThemedView>
              ) : null}
              {byCategory.map((c) => (
                <ThemedView key={c.category} type="backgroundElement" style={styles.categoryRow}>
                  <ThemedText type="small">{c.category}</ThemedText>
                  <ThemedText type="smallBold">{formatEuro(c.sum)}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            <TextInput
              style={inputStyle}
              placeholder="Concepto (ej. Cena)"
              placeholderTextColor={theme.textSecondary}
              value={concept}
              onChangeText={setConcept}
            />
            <TextInput
              style={inputStyle}
              placeholder="Importe (€)"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              onSubmitEditing={handleAdd}
            />
            <ChipRow
              options={CATEGORIES.map((c) => ({ key: c, label: c }))}
              selected={category}
              onSelect={(c) => setCategory(c as Category)}
            />
            <PrimaryButton label="Añadir gasto" onPress={handleAdd} />

            {tripExpenses.length === 0 ? (
              <EmptyState
                emoji="🧾"
                title="Todavía no hay gastos"
                description="Añade el primer gasto arriba y aquí verás el resumen del viaje."
              />
            ) : (
              tripExpenses.map((e) => (
                <ThemedView key={e.id} type="backgroundElement" style={styles.expense}>
                  <ThemedView type="backgroundElement" style={styles.expenseInfo}>
                    <ThemedText>{e.concept}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {e.category} · {formatEuro(e.amount)}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText
                    type="linkPrimary"
                    onPress={() =>
                      confirmDelete(`¿Borrar el gasto "${e.concept}"?`, () => deleteExpense(e.id))
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
  totalCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budget: {
    gap: Spacing.one,
    marginVertical: Spacing.one,
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fill: {
    height: 10,
    borderRadius: 5,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    fontSize: 16,
  },
  expense: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  expenseInfo: {
    flex: 1,
    gap: Spacing.half,
  },
});
