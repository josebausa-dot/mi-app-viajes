export type MapPoint = { lat: number; lon: number };
export type MapMarker = MapPoint & { id: string; name: string };

// Mapa de OpenStreetMap con Leaflet. No necesita clave de API.
// Recibe los datos con window.setPlaces(lugares, puntoPendiente) y avisa de los toques con postMessage.
export const MAP_HTML = `<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>html,body,#map{height:100%;margin:0;background:#14245C}</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('map').setView([30, 0], 2);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);
var layer = L.layerGroup().addTo(map);
var lastKey = null;

function post(message) {
  var data = JSON.stringify(message);
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(data);
  else window.parent.postMessage(data, '*');
}

map.on('click', function (e) {
  post({ type: 'tap', lat: e.latlng.lat, lon: e.latlng.lng });
});

window.setPlaces = function (places, pending) {
  layer.clearLayers();
  var points = [];
  places.forEach(function (p) {
    var marker = L.circleMarker([p.lat, p.lon], {
      radius: 9, color: '#ffffff', weight: 2, fillColor: '#FF8A3D', fillOpacity: 1
    }).addTo(layer);
    var label = document.createElement('b');
    label.textContent = p.name;
    marker.bindPopup(label);
    points.push([p.lat, p.lon]);
  });
  if (pending) {
    L.circleMarker([pending.lat, pending.lon], {
      radius: 9, color: '#FF8A3D', weight: 3, fillColor: '#ffffff', fillOpacity: 1
    }).addTo(layer);
  }
  var key = places.map(function (p) { return p.id; }).join(',');
  if (key === lastKey) return;
  lastKey = key;
  if (points.length === 0) map.setView([30, 0], 2);
  else if (points.length === 1) map.setView(points[0], 13);
  else map.fitBounds(points, { padding: [30, 30], maxZoom: 14 });
};

window.addEventListener('message', function (e) {
  try {
    var data = JSON.parse(e.data);
    if (data.type === 'places') window.setPlaces(data.places, data.pending);
  } catch (err) {}
});
post({ type: 'ready' });
</script>
</body>
</html>`;
