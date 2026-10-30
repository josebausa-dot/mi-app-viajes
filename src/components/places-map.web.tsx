import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { MAP_HTML, type MapMarker, type MapPoint } from '@/utils/map-html';

type PlacesMapProps = {
  places: MapMarker[];
  pending: MapPoint | null;
  onTap: (point: MapPoint) => void;
};

export function PlacesMap({ places, pending, onTap }: PlacesMapProps) {
  const frame = useRef<HTMLIFrameElement>(null);

  const push = useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      JSON.stringify({ type: 'places', places, pending }),
      '*',
    );
  }, [places, pending]);

  useEffect(push, [push]);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'tap') onTap({ lat: message.lat, lon: message.lon });
        if (message.type === 'ready') push();
      } catch {}
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onTap, push]);

  return (
    <View style={styles.container}>
      <iframe
        ref={frame}
        srcDoc={MAP_HTML}
        title="Mapa de lugares"
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
