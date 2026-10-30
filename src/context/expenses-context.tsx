import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const CATEGORIES = ['Comida', 'Transporte', 'Alojamiento', 'Ocio', 'Otros'] as const;
export type Category = (typeof CATEGORIES)[number];

export type Expense = {
  id: string;
  tripId: string;
  concept: string;
  amount: number;
  category: Category;
};

const STORAGE_KEY = 'expenses:v1';

type ExpensesContextValue = {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  deleteExpensesOfTrip: (tripId: string) => void;
};

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setExpenses(JSON.parse(raw) as Expense[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)).catch(() => {});
  }, [expenses, loaded]);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses((prev) => [{ ...expense, id: Date.now().toString() }, ...prev]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deleteExpensesOfTrip = useCallback((tripId: string) => {
    setExpenses((prev) => prev.filter((e) => e.tripId !== tripId));
  }, []);

  const value = useMemo(
    () => ({ expenses, addExpense, deleteExpense, deleteExpensesOfTrip }),
    [expenses, addExpense, deleteExpense, deleteExpensesOfTrip],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpenses must be used inside ExpensesProvider');
  return ctx;
}
