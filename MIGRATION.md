# Migration plan: handoff to new maintainers + move from surge to GitHub Pages

## Current state (as of 2026-09-25)

- **Code:** `github.com/rgdonohue/seedleaf-map` (personal account).
- **Hosting:** surge, at `https://seadleaf-map-test.surge.sh/`, deployed with `npm run deploy` from Richard's surge login.
- **Where it appears:** embedded as an iframe on <https://www.seedleaf.org/ourgrowspaces>:
  ```html
  <iframe width="100%" height="540px" frameBorder="0" src="https://seadleaf-map-test.surge.sh/" title="Seadleaf Gardens">
  ```
- **Basemap:** CARTO Voyager tiles. Since Aug 2026 these need an API key; without one, tiles show an "API KEY REQUIRED" watermark. The current key was issued to Richard and lives in a local, gitignored `.env`. It's free up to 5M tile requests/month, and the CARTO/OpenStreetMap attribution must stay visible.

## Approach

The new maintainers **clone this repo and push it to a new repo under their own account**, rather than forking it. That gives them an independent repo with the full git history. They set up GitHub Pages there, and the seedleaf.org iframe gets pointed at their Pages URL. Surge is retired once the new map is live in the iframe.

Transferring the repo (GitHub Settings → Transfer) would also work and keeps redirects, but it needs their account or organization to exist first. The repo has no issues or PRs worth keeping, so cloning loses nothing.

## Steps

### 1. Prep the code (Richard, in this repo)

So that what gets cloned works as-is. Done in three batches, each deployed to surge separately so the live map never breaks:

- **Batch 1** (done 2026-09-25, commit `fa67c30`, deployed): view, cleanup, relative paths, data check, Node pin, README basics.
- **Batch 2:** Parcel upgrade, on its own so any build change is easy to trace.
- **Batch 3:** the GitHub Pages workflow. It doesn't touch surge. Optionally, enable Pages on this repo as a rehearsal at `rgdonohue.github.io/seedleaf-map`.

- [x] **Fit the initial view to all locations.** The map used to open at a fixed zoom 14 downtown, so Central Baptist Church Orchard and Headwater Farm (8–13 km out) were off-screen on load. It now uses `map.fitBounds()` on the GeoJSON layer. Trade-off: the wider view puts the 10 downtown markers close together and a few overlap. If that's a problem, marker clustering would help.
- [x] **Remove dead code and unused dependencies:**
  - the geocoder control that was created but never added to the map, plus the `leaflet-control-geocoder` package;
  - the `leaflet-geosearch` import and package;
  - Bootstrap. Only its base styles were in use; the two that mattered (`body { margin: 0 }` and the tooltip's `box-sizing: border-box`) are now in `src/index.css`;
  - the `unfetch` and `core-js` polyfills, which only helped old browsers that can't run the page's module script anyway;
  - the `regenerator-runtime` import, which only resolved because Parcel pulled it in indirectly.

  Result: the download went from about 440 KB to 236 KB, and the markers and tooltips measured the same as on the live site (size, border, icon position, tooltip dimensions and font).
- [x] **Add an explicit `import L from 'leaflet'`** in `src/index.js`, which used to rely on the global `L`.
- [ ] **Update the tooling:** upgrade Parcel (2.8.3 → 2.16.x) and pin a Node LTS version. Node is pinned to 24 in `.nvmrc` (done). Parcel is still to do (batch 2). It should also clear the 12 `npm audit` warnings, all in Parcel's build tools. Nothing that ships to visitors is affected: `npm audit --omit=dev` reports 0. (Don't add `engines.node` to `package.json`: Parcel then treats the project as a Node app and the browser build fails.)
- [x] **Build with relative paths.** GitHub Pages project sites live at `https://<user>.github.io/seedleaf-map/`. Parcel's default absolute paths (`/index.xxxx.js`) would 404 there, so the Pages build needs `--public-url ./`.
- [x] **Add a data check script** (`scripts/check-data.js`, `npm run check`). It fails if `src/data.json` is invalid JSON, a text field is empty, or any coordinate falls outside the Lexington area, and it points out swapped longitude/latitude. It runs automatically before every build, so bad data can't be deployed.
- [ ] **Add a GitHub Actions workflow** (`.github/workflows/deploy.yml`) that runs on every push to `main`:
  1. install with `npm ci`, on the pinned Node version;
  2. run the data check;
  3. build, reading `CARTO_API_KEY` from a repo secret;
  4. deploy `dist/` to GitHub Pages.
- [ ] **Update the README:**
  - [x] fix the link (seedleaf.**com** → seedleaf.org);
  - [x] document editing `data.json` through GitHub's web editor, `npm run check`, and the Node version. The "map redeploys automatically" part gets added with the workflow;
  - [ ] replace the surge deploy section with the Pages workflow;
  - [x] add a "who owns what" section (see step 5). Done as "Accounts and ownership"; the new maintainers update it at handoff.

### 2. Set up the new repo (new maintainers)

- [ ] Clone and push to a new repo under their account:
  ```
  git clone https://github.com/rgdonohue/seedleaf-map.git
  cd seedleaf-map
  git remote set-url origin https://github.com/<their-account>/seedleaf-map.git
  git push -u origin main
  ```
- [ ] Get their own free CARTO basemap key at <https://carto.com/basemaps/apikey>. Don't keep using Richard's.
- [ ] Add it as a repo secret named `CARTO_API_KEY` (Settings → Secrets and variables → Actions). The key is visible in the browser either way; the secret just keeps it out of git.
- [ ] Enable Pages with source **GitHub Actions** (Settings → Pages).
- [ ] Push a commit, or re-run the workflow, and confirm the map loads at the Pages URL with clean, unwatermarked tiles and every marker visible.

### 3. Point seedleaf.org at the new map (whoever edits seedleaf.org)

- [ ] Change the iframe `src` to the new Pages URL.
- [ ] Fix the iframe `title` typo ("Seadleaf" → "Seedleaf").
- [ ] Check the live page on desktop and on a phone.

**Optional:** point a subdomain like `map.seedleaf.org` at GitHub Pages (a DNS CNAME record plus the custom domain setting in Pages) and use that in the iframe. Future hosting or account moves would then only need a DNS change, not another website edit.

### 4. Retire the old setup (Richard)

Only after the iframe change is confirmed live:

- [ ] Tear down the surge site: `surge teardown seadleaf-map-test.surge.sh`
- [ ] Add a note at the top of this repo's README pointing to the new repo, then archive it (Settings → Archive).

### 5. Record who owns what

Put this in the new repo's README:

| Thing | Owner / where it lives |
|---|---|
| GitHub repo + Pages | _their account_ |
| CARTO API key | _their CARTO key_, stored as repo secret `CARTO_API_KEY` |
| seedleaf.org page with the iframe | _who has website editor access_ |
| DNS (only if using `map.seedleaf.org`) | _who manages seedleaf.org DNS_ |

## Other notes

- **License mismatch:** the `LICENSE` file is GPL-3.0, but `package.json` says `"license": "ISC"`. Pick one and make them match before the handoff. The new maintainers inherit whichever it is.
- `npm audit --omit=dev` reports no vulnerabilities in what ships to visitors (checked 2026-09-25). The full `npm audit` shows 12 warnings in Parcel's build tools (see batch 2).
- Not yet tested: the layout at phone width, and building on Node 24 specifically (batch 1 was built on Node 25).
