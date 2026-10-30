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

export type Activity = {
  id: string;
  tripId: string;
  day: number;
  time: string;
  title: string;
};

const STORAGE_KEY = 'activities:v1';

type ActivitiesContextValue = {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  deleteActivity: (id: string) => void;
  deleteActivitiesOfTrip: (tripId: string) => void;
};

const ActivitiesContext = createContext<ActivitiesContextValue | null>(null);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setActivities(JSON.parse(raw) as Activity[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities)).catch(() => {});
  }, [activities, loaded]);

  const addActivity = useCallback((activity: Omit<Activity, 'id'>) => {
    setActivities((prev) => [...prev, { ...activity, id: Date.now().toString() }]);
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const deleteActivitiesOfTrip = useCallback((tripId: string) => {
    setActivities((prev) => prev.filter((a) => a.tripId !== tripId));
  }, []);

  const value = useMemo(
    () => ({ activities, addActivity, deleteActivity, deleteActivitiesOfTrip }),
    [activities, addActivity, deleteActivity, deleteActivitiesOfTrip],
  );

  return <ActivitiesContext.Provider value={value}>{children}</ActivitiesContext.Provider>;
}

export function useActivities() {
  const ctx = useContext(ActivitiesContext);
  if (!ctx) throw new Error('useActivities must be used inside ActivitiesProvider');
  return ctx;
}
