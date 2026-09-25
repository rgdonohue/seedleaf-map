# seedleaf-map

An interactive map for [Seedleaf](https://www.seedleaf.org), showing the community gardens, orchards, and farms it supports around Lexington, KY. It's a small static site built with [Parcel](https://parceljs.org/) and [Leaflet](https://leafletjs.com/), with no backend — all location data lives in a single file.

## At a glance

| | |
|---|---|
| **Where people see it** | Embedded (as an iframe) on <https://www.seedleaf.org/ourgrowspaces> |
| **Where it's hosted** | [surge](https://surge.sh), at <https://seadleaf-map-test.surge.sh/> |
| **Location data** | `src/data.json`, one entry per garden, orchard, or farm |
| **Background map** | [CARTO](https://carto.com/basemaps) Voyager tiles, which need a free API key |
| **Moving hosts / new maintainers** | See [MIGRATION.md](MIGRATION.md) |

> **Don't rename the surge address.** The seedleaf.org page loads the map from exactly `seadleaf-map-test.surge.sh` ("sead" spelling included). If the address changes, the map disappears from seedleaf.org until someone edits the iframe on that page.

## How a change goes live

1. **Edit** `src/data.json` (see [Updating or adding a location](#updating-or-adding-a-location)). You can do this on GitHub's website or on your own computer.
2. **Check** it with `npm run check`, then preview it with `npm start`.
3. **Publish** with `npm run deploy`. This updates the map on seedleaf.org right away, so preview first.

Steps 2 and 3 need the [one-time setup](#one-time-setup-for-developers) below. If you're not set up, commit your edit on GitHub and ask whoever maintains the map (see [Accounts and ownership](#accounts-and-ownership)) to publish it.

New locations appear on the map automatically, because the map zooms to fit all of them when it opens.

## Updating or adding a location

All map locations live in `src/data.json`. This is a [GeoJSON](https://geojson.org/) file — don't be intimidated by that, you only ever need to touch a few fields.

The file has one entry per location, shaped like this:

```json
{
    "type": "Feature",
    "properties": {
        "Garden": "Name of the garden, orchard, or farm",
        "Location": "Street address, zip",
        "Description": "A short description"
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

`Garden`, `Location`, and `Description` are shown in the info box that appears when someone hovers over (or taps) a marker. All three are required.

### Editing an existing location

1. Open `src/data.json`.
2. Find the entry by its `Garden` name.
3. Edit the `Garden`, `Location`, or `Description` text as needed, then save.

### Adding a new location

1. Copy an existing entry (the whole `{ ... }` block) and paste it at the end of the list, just before the final `]`.
2. Entries are separated by commas, so the entry *above* your new one now needs a comma after its closing `}`. Your new entry, being last, must **not** have one.
3. Fill in `Garden`, `Location`, and `Description` for the new location.
4. Get coordinates for the address: search for it on [openstreetmap.org](https://www.openstreetmap.org/search) (or any map/geocoding site), then copy its longitude and latitude.
5. **Important:** GeoJSON coordinates are written as `[longitude, latitude]` — the *opposite* order from how coordinates are usually written (`latitude, longitude`). Around Lexington, longitude is about **-84** and latitude about **38**, so the first number should be the negative one.
6. Save the file.

### Removing a location

Delete its whole `{ ... }` block, then make sure the entries left over are still separated by commas, with no comma after the last one.

### Editing from the GitHub website

You can edit `src/data.json` without installing anything: open the file on GitHub, click the pencil icon, make your change, and click **Commit changes**. This saves the change but does **not** publish it; someone still has to run `npm run deploy`.

### Checking your change

Run `npm run check` to catch the most common mistakes: invalid JSON (a missing or extra comma), an empty `Garden`/`Location`/`Description`, or coordinates outside the Lexington area (usually swapped longitude and latitude). It prints what's wrong and which location it's in. The same check runs automatically before every build, so a broken file can't be published.

Then run `npm start`, open the local dev server in your browser, and confirm your new or edited marker appears in the right place with the right text.

**Adding a location outside Lexington?** The check only accepts a box around Fayette County, to catch typos. If Seedleaf adds a site farther out, widen `BOUNDS` near the top of `scripts/check-data.js`.

## One-time setup (for developers)

You'll need:

- **Node.js 24** (listed in `.nvmrc`; with [nvm](https://github.com/nvm-sh/nvm), run `nvm use`).
- **A CARTO basemap API key.** It's free, with no account needed, from <https://carto.com/basemaps/apikey>. Without it the background map shows an "API KEY REQUIRED" watermark.
- **To publish:** the surge command-line tool (`npm install --global surge`), logged in (`surge login`) to the surge account that owns `seadleaf-map-test.surge.sh`.

Then:

```
npm install
cp .env.example .env
```

Open `.env` and replace `paste-your-key-here` with the CARTO key. `.env` is gitignored, so the key won't be committed. (It still ends up in the published JavaScript, as it must for browsers to load the tiles; that's normal for this kind of key.)

## Commands

| Command | What it does |
|---|---|
| `npm start` | Runs a local preview (usually at `http://localhost:1234`) that updates as you edit. Restart it after changing `.env`. |
| `npm run check` | Checks `src/data.json` for mistakes. |
| `npm run build` | Runs the check, then builds the site into `dist/`. |
| `npm run deploy` | Builds, then publishes `dist/` to surge. **This updates the live map.** |

Always publish the built `dist/` folder (which `npm run deploy` does for you), never `src/`. Browsers can't run the source files directly.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Background map says "API KEY REQUIRED" | `.env` is missing or the key is wrong. Fix it, then restart `npm start` or redeploy. |
| No background map at all, or the map doesn't load | The site was probably built without a `.env` file. Create it and rebuild. The browser console (right-click → Inspect → Console) will show the error. |
| `npm run build` or `deploy` stops with "Problems found in src/data.json" | Fix what the message lists (see [Checking your change](#checking-your-change)). |
| A marker is missing or in the wrong place | Longitude and latitude are probably swapped, or the coordinates are for the wrong address. |
| seedleaf.org still shows the old map after deploying | Browser cache. Do a hard refresh. |

## Project layout

```
src/
  data.json                          all map locations (the file you'll edit most)
  index.html                         page shell
  index.js                           map setup: background tiles, markers, info boxes
  index.css                          page and info-box styles
  leaflet-beautify-marker-icon.*     the round leaf marker icons (third-party plugin)
  CNAME                              the surge address; copied into dist/ on deploy
scripts/
  check-data.js                      the data check behind `npm run check`
.env.example                         template for .env (the CARTO key)
.nvmrc                               Node.js version
MIGRATION.md                         plan for handing off and moving to GitHub Pages
```

To change the marker look (icon, colors, size), edit `markerOptions` in `src/index.js`. The icon names come from [Font Awesome](https://fontawesome.com/search?ic=free).

Keep the "© OpenStreetMap contributors © CARTO" credit in the map corner; CARTO's free key requires it. The free key covers up to 5 million tile requests a month.

## Accounts and ownership

Keep this table current when the project changes hands.

| What | Who / where |
|---|---|
| This GitHub repo | [rgdonohue](https://github.com/rgdonohue) |
| surge account that owns `seadleaf-map-test.surge.sh` | Richard Donohue |
| CARTO API key | Richard Donohue's key; lives in `.env` on the deploying machine |
| seedleaf.org page with the iframe | _Seedleaf staff member with website editor access_ |
