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

import type { Trip } from '@/components/trip-card';
import { formatRange } from '@/utils/dates';

const STORAGE_KEY = 'trips:v1';

type TripsContextValue = {
  trips: Trip[];
  loaded: boolean;
  addTrip: (destination: string, startDate?: string, endDate?: string) => void;
  updateTrip: (id: string, changes: Partial<Omit<Trip, 'id'>>) => void;
  deleteTrip: (id: string) => void;
};

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setTrips(JSON.parse(raw) as Trip[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Solo se guarda tras la carga inicial para no sobrescribir los datos guardados con una lista vacía
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips)).catch(() => {});
  }, [trips, loaded]);

  const addTrip = useCallback((destination: string, startDate?: string, endDate?: string) => {
    setTrips((prev) => [
      {
        id: Date.now().toString(),
        destination,
        startDate,
        endDate,
        dates: formatRange(startDate, endDate),
        notes: '',
      },
      ...prev,
    ]);
  }, []);

  const updateTrip = useCallback((id: string, changes: Partial<Omit<Trip, 'id'>>) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...changes };
        if ('startDate' in changes || 'endDate' in changes) {
          next.dates = formatRange(next.startDate, next.endDate);
        }
        return next;
      }),
    );
  }, []);

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ trips, loaded, addTrip, updateTrip, deleteTrip }),
    [trips, loaded, addTrip, updateTrip, deleteTrip],
  );

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used inside TripsProvider');
  return ctx;
}
