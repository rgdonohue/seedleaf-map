import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './index.css';
import './leaflet-beautify-marker-icon.css';
import './leaflet-beautify-marker-icon.js';

import data from './data.json';

const map = L.map('map');

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key={key}',
  {
    key: process.env.CARTO_API_KEY,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }
).addTo(map);

function onEachFeature(feature, layer) {
  const text = `<ul><li><b>Garden:</b> ${feature.properties.Garden}</li>
  <li><b>Address:</b> ${feature.properties.Location}</li>
  <li><b>Description:</b> ${feature.properties.Description}</li></ul>`;

  layer.bindTooltip(text);
}

const markerOptions = {
  icon: 'leaf',
  iconShape: 'circle',
  iconSize: [40, 40],
  innerIconAnchor: [-1, 8],
  borderColor: '#4E7618',
  textColor: '#4E7618',
  innerIconStyle: 'font-size: 140%;',
};

function pointToLayer(geoJsonPoint, latlng) {
  return L.marker(latlng, {
    icon: L.BeautifyIcon.icon(markerOptions),
    draggable: false,
  });
}

const locations = L.geoJSON(data, {
  pointToLayer,
  onEachFeature,
}).addTo(map);

// Frame every location, so newly added ones are visible on load
map.fitBounds(locations.getBounds(), { padding: [30, 30] });
