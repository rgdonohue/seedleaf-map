# seedleaf-map

An interactive map for [Seedleaf](https://www.seedleaf.org), showing the community gardens, orchards, and farms it supports around Lexington, KY. It's a small static site built with [Parcel](https://parceljs.org/) and [Leaflet](https://leafletjs.com/), with no backend — all location data lives in a single file.

## Running the project

The basemap tiles come from CARTO, which requires an API key. Copy `.env.example` to `.env` and paste the key in:

```
cp .env.example .env
```

`.env` is gitignored, so the key won't be committed. Parcel reads it at build time, so restart `npm start` after changing it.

This project uses Node.js 24 (listed in `.nvmrc`; with [nvm](https://github.com/nvm-sh/nvm), run `nvm use`).

```
npm install
npm start
```

This starts a local dev server (Parcel will print the URL, usually `http://localhost:1234`) and rebuilds automatically as you edit files.

To produce a production build (output goes to `dist/`), run the command below. It runs the data check described below first, and stops if the check finds a problem:

```
npm run build
```

To publish to [surge](https://surge.sh) (builds, copies `src/CNAME` so surge knows the domain, and uploads `dist/`):

```
npm run deploy
```

Always deploy the built `dist/` folder, never `src/` — the browser can't run the source files directly.

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

### Editing from the GitHub website

You can edit `src/data.json` without installing anything: open the file on GitHub, click the pencil icon, make your change, and click **Commit changes**. Publishing still requires the steps under [Running the project](#running-the-project).

### Checking your change

Run `npm run check` to catch the most common mistakes: invalid JSON (a missing or extra comma), an empty `Garden`/`Location`/`Description`, or coordinates outside the Lexington area (usually swapped longitude and latitude). It prints what's wrong and which location it's in.

Then run `npm start`, open the local dev server in your browser, and confirm your new or edited marker appears in the right place with the right popup text before publishing.
