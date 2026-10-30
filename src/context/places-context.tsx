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

export type Place = {
  id: string;
  tripId: string;
  name: string;
  lat: number;
  lon: number;
};

const STORAGE_KEY = 'places:v1';

type PlacesContextValue = {
  places: Place[];
  addPlace: (place: Omit<Place, 'id'>) => void;
  deletePlace: (id: string) => void;
  deletePlacesOfTrip: (tripId: string) => void;
};

const PlacesContext = createContext<PlacesContextValue | null>(null);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPlaces(JSON.parse(raw) as Place[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(places)).catch(() => {});
  }, [places, loaded]);

  const addPlace = useCallback((place: Omit<Place, 'id'>) => {
    setPlaces((prev) => [...prev, { ...place, id: Date.now().toString() }]);
  }, []);

  const deletePlace = useCallback((id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const deletePlacesOfTrip = useCallback((tripId: string) => {
    setPlaces((prev) => prev.filter((p) => p.tripId !== tripId));
  }, []);

  const value = useMemo(
    () => ({ places, addPlace, deletePlace, deletePlacesOfTrip }),
    [places, addPlace, deletePlace, deletePlacesOfTrip],
  );

  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces() {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error('usePlaces must be used inside PlacesProvider');
  return ctx;
}
