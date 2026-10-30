import { Platform } from 'react-native';

import type { MapPoint } from '@/utils/map-html';

const BASE_URL = 'https://nominatim.openstreetmap.org';

// Nominatim exige identificar la aplicación; los navegadores no permiten cambiar la cabecera
const headers: Record<string, string> =
  Platform.OS === 'web' ? {} : { 'User-Agent': 'MisViajes/1.0 (com.joseb.miviajes)' };

export async function searchPlace(query: string): Promise<(MapPoint & { name: string }) | null> {
  const url = `${BASE_URL}/search?format=jsonv2&limit=1&accept-language=es&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('search failed');
  const results = (await response.json()) as { lat: string; lon: string; display_name: string }[];
  if (results.length === 0) return null;
  const { lat, lon, display_name } = results[0];
  return { lat: Number(lat), lon: Number(lon), name: display_name };
}

export async function nameOfPoint({ lat, lon }: MapPoint): Promise<string | null> {
  const url = `${BASE_URL}/reverse?format=jsonv2&zoom=14&accept-language=es&lat=${lat}&lon=${lon}`;
  const response = await fetch(url, { headers });
  if (!response.ok) return null;
  const result = (await response.json()) as { name?: string; display_name?: string };
  return result.name || result.display_name || null;
}
