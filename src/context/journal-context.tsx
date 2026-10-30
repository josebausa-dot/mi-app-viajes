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

export type JournalEntry = {
  id: string;
  tripId: string;
  date: string;
  mood: string;
  text: string;
  photos?: string[];
};

const STORAGE_KEY = 'journal:v1';

type JournalContextValue = {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  deleteEntriesOfTrip: (tripId: string) => void;
};

const JournalContext = createContext<JournalContextValue | null>(null);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setEntries(JSON.parse(raw) as JournalEntry[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(() => {});
  }, [entries, loaded]);

  const addEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    setEntries((prev) => [...prev, { ...entry, id: Date.now().toString() }]);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deleteEntriesOfTrip = useCallback((tripId: string) => {
    setEntries((prev) => prev.filter((e) => e.tripId !== tripId));
  }, []);

  const value = useMemo(
    () => ({ entries, addEntry, deleteEntry, deleteEntriesOfTrip }),
    [entries, addEntry, deleteEntry, deleteEntriesOfTrip],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used inside JournalProvider');
  return ctx;
}
