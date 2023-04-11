import 'leaflet';
import './index.css';
import './leaflet-beautify-marker-icon.css';
import BeautifyIcon from './leaflet-beautify-marker-icon.js';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import '../node_modules/leaflet-geosearch/dist/geosearch.css';
import 'unfetch/polyfill';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'leaflet-control-geocoder';

import data from './data.json';

const map = L.map('map').setView([38.0559, -84.4893], 14);

L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }
).addTo(map);

// const searchControl = new GeoSearchControl({
//   style: 'bar',
//   searchLabel: 'Search address',
//   position: 'topright',
//   provider: new OpenStreetMapProvider(),
//   retainZoomLevel: true,
// });

// map.addControl(searchControl);

L.Control.geocoder({
  defaultMarkGeocode: false,
  collapsed: false,
  queryMinLength: 4,
}).on('markgeocode', (e) => {
  console.log(e);
});
// .addTo(map);

function onEachFeature(feature, layer) {
  const text = `<div class='tt'><b>Garden:</b> ${feature.properties.Garden}<br>
               <b>Address:</b> ${feature.properties.Location}<br>
               <b>Description:</b> ${feature.properties.Description}</div>`;

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

L.geoJSON(data, {
  pointToLayer,
  onEachFeature,
}).addTo(map);
