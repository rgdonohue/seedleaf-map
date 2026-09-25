// Checks src/data.json for the mistakes that most often break the map:
// invalid JSON, missing text fields, and swapped or mistyped coordinates.
// Runs automatically before every build; run it directly with `npm run check`.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'src', 'data.json');
const REQUIRED_FIELDS = ['Garden', 'Location', 'Description'];

// A generous box around Lexington / Fayette County. A point outside it is
// almost always a typo or a [latitude, longitude] swap.
const BOUNDS = { minLon: -85.0, maxLon: -84.0, minLat: 37.7, maxLat: 38.4 };

const errors = [];

let data;
try {
  data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
} catch (err) {
  console.error(`src/data.json is not valid JSON:\n  ${err.message}`);
  console.error(
    'Look for a missing or extra comma, or an unclosed { } or [ ] near that position.'
  );
  process.exit(1);
}

if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
  console.error('src/data.json must be a FeatureCollection with a "features" list.');
  process.exit(1);
}

data.features.forEach((feature, i) => {
  const props = feature.properties || {};
  const name = props.Garden || `entry #${i + 1}`;

  for (const field of REQUIRED_FIELDS) {
    if (typeof props[field] !== 'string' || props[field].trim() === '') {
      errors.push(`${name}: "${field}" is missing or empty.`);
    }
  }

  const geometry = feature.geometry || {};
  const coords = geometry.coordinates;
  if (
    geometry.type !== 'Point' ||
    !Array.isArray(coords) ||
    coords.length !== 2 ||
    !coords.every((n) => typeof n === 'number')
  ) {
    errors.push(`${name}: coordinates must be a Point written as [longitude, latitude].`);
    return;
  }

  const [lon, lat] = coords;
  const inBounds = (x, y) =>
    x >= BOUNDS.minLon && x <= BOUNDS.maxLon && y >= BOUNDS.minLat && y <= BOUNDS.maxLat;

  if (!inBounds(lon, lat)) {
    const hint = inBounds(lat, lon)
      ? ' It looks like longitude and latitude are swapped. The order must be [longitude, latitude].'
      : '';
    errors.push(`${name}: [${lon}, ${lat}] is outside the Lexington area.${hint}`);
  }
});

if (errors.length) {
  console.error('Problems found in src/data.json:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`src/data.json looks good (${data.features.length} locations).`);
