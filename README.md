# seedleaf-map

An interactive map for [Seedleaf](https://seedleaf.com), showing the community gardens, orchards, and farms it supports around Lexington, KY. It's a small static site built with [Parcel](https://parceljs.org/) and [Leaflet](https://leafletjs.com/), with no backend — all location data lives in a single file.

## Running the project

```
npm install
npm start
```

This starts a local dev server (Parcel will print the URL, usually `http://localhost:1234`) and rebuilds automatically as you edit files.

To produce a production build (output goes to `dist/`):

```
npm run build
```

## Updating or adding a location

All map locations live in `src/data.json`. This is a [GeoJSON](https://geojson.org/) file — don't be intimidated by that, you only ever need to touch a few fields.

The file has one entry per location, shaped like this:

```json
{
    "type": "Feature",
    "properties": {
        "Garden": "Name of the garden, orchard, or farm",
        "Location": "Street address, zip",
        "Description": "A short description shown in the map popup"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [
            -84.50866,
            38.06769
        ]
    }
}
```

### Editing an existing location

1. Open `src/data.json`.
2. Find the entry by its `Garden` name.
3. Edit the `Garden`, `Location`, or `Description` text as needed, then save.

### Adding a new location

1. Copy an existing entry (the whole `{ ... }` block) and paste it just before the closing `]` at the end of the `features` list. Add a comma after the entry above it.
2. Fill in `Garden`, `Location`, and `Description` for the new location.
3. Get coordinates for the address: search for it on [openstreetmap.org](https://www.openstreetmap.org/search) (or any map/geocoding site), then copy its longitude and latitude.
4. **Important:** GeoJSON coordinates are written as `[longitude, latitude]` — the *opposite* order from how coordinates are usually written (`latitude, longitude`). This is the easiest mistake to make, so double-check it.
5. Save the file, making sure it's still valid JSON — no trailing comma after the very last entry in the list, and every `{`, `}`, `[`, `]` should be balanced.

### Checking your change

Run `npm start`, open the local dev server in your browser, and confirm your new or edited marker appears in the right place with the right popup text before publishing.
