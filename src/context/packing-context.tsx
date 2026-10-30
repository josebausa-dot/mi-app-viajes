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

export type PackingItem = {
  id: string;
  tripId: string;
  name: string;
  packed: boolean;
};

export const PACKING_TEMPLATES: Record<string, string[]> = {
  '🏖️ Playa': ['Bañador', 'Toalla de playa', 'Crema solar', 'Gafas de sol', 'Gorra', 'Chanclas', 'Aftersun'],
  '⛰️ Montaña': ['Botas de senderismo', 'Chaqueta impermeable', 'Mochila', 'Botella de agua', 'Linterna', 'Botiquín', 'Calcetines técnicos'],
  '🏙️ Ciudad': ['Calzado cómodo', 'Powerbank', 'Paraguas', 'Mochila pequeña', 'Tarjeta de transporte', 'Auriculares'],
  '🧾 Básicos': ['Pasaporte / DNI', 'Cargador del móvil', 'Cartera', 'Neceser', 'Medicamentos', 'Ropa interior', 'Billetes / reservas'],
};

const STORAGE_KEY = 'packing:v1';

type PackingContextValue = {
  items: PackingItem[];
  addItem: (tripId: string, name: string) => void;
  addItems: (tripId: string, names: string[]) => void;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  deleteItemsOfTrip: (tripId: string) => void;
};

const PackingContext = createContext<PackingContextValue | null>(null);

export function PackingProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw) as PackingItem[]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, loaded]);

  const addItem = useCallback((tripId: string, name: string) => {
    setItems((prev) => [...prev, { id: Date.now().toString(), tripId, name, packed: false }]);
  }, []);

  const addItems = useCallback((tripId: string, names: string[]) => {
    setItems((prev) => {
      const existing = new Set(
        prev.filter((i) => i.tripId === tripId).map((i) => i.name.toLowerCase()),
      );
      const stamp = Date.now();
      const fresh = names
        .filter((n) => !existing.has(n.toLowerCase()))
        .map((name, index) => ({ id: `${stamp}-${index}`, tripId, name, packed: false }));
      return [...prev, ...fresh];
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, packed: !i.packed } : i)));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const deleteItemsOfTrip = useCallback((tripId: string) => {
    setItems((prev) => prev.filter((i) => i.tripId !== tripId));
  }, []);

  const value = useMemo(
    () => ({ items, addItem, addItems, toggleItem, deleteItem, deleteItemsOfTrip }),
    [items, addItem, addItems, toggleItem, deleteItem, deleteItemsOfTrip],
  );

  return <PackingContext.Provider value={value}>{children}</PackingContext.Provider>;
}

export function usePacking() {
  const ctx = useContext(PackingContext);
  if (!ctx) throw new Error('usePacking must be used inside PackingProvider');
  return ctx;
}
