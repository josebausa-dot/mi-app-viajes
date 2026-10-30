import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { MAP_HTML, type MapMarker, type MapPoint } from '@/utils/map-html';

type PlacesMapProps = {
  places: MapMarker[];
  pending: MapPoint | null;
  onTap: (point: MapPoint) => void;
};

export function PlacesMap({ places, pending, onTap }: PlacesMapProps) {
  const webView = useRef<WebView>(null);

  const push = useCallback(() => {
    const data = `${JSON.stringify(places)},${JSON.stringify(pending)}`;
    webView.current?.injectJavaScript(`window.setPlaces && window.setPlaces(${data}); true;`);
  }, [places, pending]);

  useEffect(push, [push]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'tap') onTap({ lat: message.lat, lon: message.lon });
      if (message.type === 'ready') push();
    } catch {}
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webView}
        source={{ html: MAP_HTML }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        onLoadEnd={push}
        nestedScrollEnabled
        style={styles.map}
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
  map: {
    flex: 1,
    backgroundColor: '#14245C',
  },
});
