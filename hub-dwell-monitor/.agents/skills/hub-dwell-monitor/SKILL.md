---
name: hub-dwell-monitor-builder
description: Build, review, and document the Anteraja Hub Dwell Monitor, a React + Vite + Leaflet operational dashboard for logistics hub supervisors (KPI, Top 3 hubs, searchable hub list, priority filter, interactive map, hub detail, AI Insight, Data Notes). Use this skill whenever the user mentions Hub Dwell Monitor, dwell time, hub metrics, metrics.json, locations.json, ai-summary.json, Leaflet markers tied to hub_id, shared filter between map and list, "map already initialized", priority hubs, or asks to implement the Stitch design in React, even if they do not name the project explicitly.
---

# Hub Dwell Monitor Builder

Turn the approved Stitch design and the three JSON data files into a small, correct React application. A supervisor must be able to follow this path on one screen:

KPI → Top 3 Hub → Hub List → Priority Filter → Leaflet Map → Hub Detail → decide which hub to investigate first.

Two things matter most: **the numbers must be computed correctly from raw data**, and **the UI must stay minimal**. A previous design pass produced a cluttered screen with invented facts, so the "do not invent" rules below are deliberate.

## Scope

In scope: the React app, data loading, calculation logic, Leaflet map, shared filter, responsive layout, code review checklist, `docs/hub-dwell-monitor.md`, README, git workflow.

Out of scope: the Stitch design work and the AI Studio prompt tests. Those are done outside the codebase. For the docs file, leave clearly marked placeholders for Stitch screenshots and AI test results rather than making them up.

## Stack and constraints

- React + Vite, plain JavaScript (`.jsx`), matching the expected file tree.
- Leaflet for the map. `react-leaflet` is fine; if using raw Leaflet, follow the cleanup rule in the Leaflet section.
- Keep dependencies minimal: no UI kit, no state library, no router. Page switching can be a single `useState` in `App.jsx`.
- Styling: plain CSS with CSS variables (or Tailwind if already installed). Pick one and stay consistent.
- Vitest is welcome for testing the calculation utils (dev dependency only).

## Expected structure

```
hub-dwell-monitor/
├── public/data/
│   ├── metrics.json
│   ├── locations.json
│   └── ai-summary.json
├── src/
│   ├── components/      Sidebar, KpiCards, TopHubs, FilterBar, HubMap, HubList, HubDetail, StateViews
│   ├── pages/           Dashboard, AiInsight, DataNotes
│   ├── utils/           calculations, data validation, formatters
│   ├── App.jsx
│   └── main.jsx
├── docs/hub-dwell-monitor.md
├── screenshots/         stitch-v1.png, stitch-v2.png, desktop.png, mobile.png
└── README.md
```

## Step 1: Inspect the data before writing code

The exact field names in the JSON files are not specified anywhere. Open all three files first and write down the real field names. Do not assume names like `mean_dwell_hours`. Then create one adapter function in `utils/` that maps raw records to the internal shape below, so the rest of the app never touches raw field names.

Internal hub shape:

```
{ hubId, name, lat, lng,
  meanDwellHours,   // number
  minDwellHours,    // number
  maxDwellHours,    // number
  completedVisits,  // number
  openVisits,       // number
  isPriority }      // derived, never stored in the data
```

Data can arrive in two forms. Check which one you have:
- **Pre-aggregated per hub** (mean/min/max/count already present): use those values directly.
- **Raw visit records** (one row per visit): aggregate per hub yourself, using completed visits only.

If something the detail panel needs (min, max, completed count, open visits) is missing from the data, say so in your reply and show "N/A" in the UI. Do not estimate it.

## Step 2: Calculation rules (the core of correctness)

Put all calculations in `src/utils/calculations.js` as pure functions, separate from components, so they can be tested.

- **Dwell time** is the elapsed hours between arrival and departure of a visit.
- **Completed visit**: has a departure. Only completed visits count toward any dwell average.
- **Open visit**: no departure yet. Count it separately. Never include it in any mean, and never let it inflate the completed count.
- **Global mean dwell time** is weighted by completed visits: `Σ(hubMean × hubCompleted) / Σ(hubCompleted)`. It is not the average of the hub means. If you have raw records, it is simply the mean over all completed visits.
- **Ranking** sorts on raw numbers (`meanDwellHours`), never on formatted strings like `"6.85 hrs"`. Format only at render time. Break ties by `hubId` so the order is stable.
- **Top 3** is the three highest `meanDwellHours` across all hubs. It does not change when the filter or search changes.
- **Priority** is a single binary rule: `meanDwellHours >= PRIORITY_THRESHOLD_HOURS`. Define this constant once, in one file, with value `6`. Add a comment that it is a practice-simulation rule and not an official SLA. Confirm with the user whether the boundary is `>=` or `>` if the Day 2 analysis said otherwise.
- **Priority Hub Count** (the fourth KPI card) is the number of hubs where `isPriority` is true.
- **Empty hub list**: every calculation must return a safe result (0 or null) and the UI must show a state, not `NaN` or a crash.

## Step 3: Data loading

- Fetch from `${import.meta.env.BASE_URL}data/metrics.json` (and the other two files) so paths work under any base URL.
- Load once, near the top of the app, in a small custom hook (for example `useHubData`). It exposes `status` (`loading`, `error`, `ready`), `data`, `error`, and `retry`. Follow the "Application states and error handling" section below for every failure case.
- Join metrics and locations on `hubId`. Write a validation function in `utils/` that reports: hub IDs present in one file but not the other, duplicate IDs, and missing or non-numeric coordinates. Log warnings to the console. A hub without coordinates still appears in the list but gets no marker.
- `hub_id` must be the only key used to link a map marker, a list row, and the detail panel.

## Application states and error handling

Every screen must always show something meaningful: never a blank page, a stuck spinner, `NaN`, or `undefined`. Build these as reusable components in `components/StateViews.jsx` (`LoadingView`, `ErrorView`, `EmptyView`), not as demo tabs.

### Fetching safely

- `fetch` does **not** reject on HTTP 404 or 500. Always check `response.ok` and throw if false, otherwise a missing file looks like a JSON parse error.
- Wrap `response.json()` in try/catch for invalid JSON.
- Use `AbortController` with a timeout (around 10 seconds) so a hanging request ends in the error state instead of loading forever. Abort on unmount.
- Do not add an artificial delay to "show" the loading state.
- Validate shape after parsing: `metrics` and `locations` must be arrays (or the object shape you found in Step 1). If not, treat it as an error with a clear message, not a crash further down.
- Retry re-runs the same load and returns to `loading`. It must not require a page refresh.

### Which failure affects which page

The three files are not equally important. Treat them separately:

| Failure | Dashboard | AI Insight | Data Notes |
|---|---|---|---|
| `metrics.json` fails | Error view with Retry | Still works if `ai-summary.json` loaded | Works (static) |
| `locations.json` fails | KPIs, Top 3 and list still work. Map area shows a small error note with Retry. No markers. | Works | Works |
| `ai-summary.json` fails | Works normally | Error view with Retry | Works |

Load `ai-summary.json` independently so one bad file never takes down the whole app. Use `Promise.allSettled` or separate hooks.

### State catalog

**Loading** (while any required file is pending)
- Skeleton placeholders matching the final layout: 4 KPI cards, 3 Top-3 cards, about 6 list rows, and a plain gray map placeholder with the same height as the real map. This prevents layout jump.
- On AI Insight: skeletons inside the three cards.
- Set `aria-busy="true"` on the loading region.

**Error**
- A single card: "Failed to load data", one short line saying what failed (for example "metrics.json could not be loaded"), and a "Retry" button. Do not show raw stack traces or exception text to the user. Log them to the console.
- Use `role="alert"`.

**Empty: three different cases, three different messages**
1. *Data is empty* (`metrics` has zero hubs): "No hub data available". KPI cards show 0 or "N/A", and the global mean shows "N/A", not `NaN`. No Reset button, since resetting would not help.
2. *Filter or search returns nothing*: "No hubs match your filter" with a "Reset filter" button. KPI cards and Top 3 stay as they are, because they do not depend on the filter. The map shows no markers.
3. *Priority Only is on but no hub is priority*: "No hubs meet the priority threshold" with a way back to All Hubs. This differs from case 2 because the cause is the data, not the search text.

**Partial data**
- Hub in metrics but missing from locations: appears in the list, no marker. Optionally show a small "No location" text in its detail.
- Hub in locations but missing from metrics: skip it everywhere and warn in the console.
- Missing or non-numeric value in a field: show "N/A" for that field and exclude the hub from calculations that need it. Never let one bad record break the whole calculation.
- Duplicate `hub_id`: keep the first, warn in the console.

**AI Insight specific**
- Valid and `priority_hubs` non-empty: normal.
- Valid and `priority_hubs` empty: "No hubs meet the priority threshold" in that card.
- File loads but the shape is wrong (missing `summary`, or `priority_hubs` / `next_checks` not arrays): treat as "Data not available" in all three cards, not as a crash.
- Summary says data is unavailable (empty hubs scenario): display that text as given.
- Always display the note "Generated from verified metrics only."

**Map-specific**
- Tiles fail to load (offline): keep the map and markers visible, and show a small note such as "Map tiles unavailable". Do not replace the whole map with an error.
- Zero markers: map still renders at its normal size.

### Crashes

Wrap each page in an `ErrorBoundary` component (class component with `componentDidCatch`) that shows the same Error view with a "Reload" action. One broken component must not blank the sidebar and the other pages.

### How to test the states

Test each one by hand and note the result in `docs/hub-dwell-monitor.md` (Testing section):
- Loading: throttle the network in devtools (Slow 3G).
- Error: temporarily rename a data file, or go offline. Test each of the three files separately.
- Invalid JSON: temporarily break the syntax of one file.
- Empty data: temporarily set the hubs array to `[]`.
- No priority hubs: temporarily lower all means below the threshold, or raise the threshold constant.
- Filter empty: type a search term that matches nothing.
- AI wrong shape: temporarily remove `summary` from `ai-summary.json`.
Restore all data files afterwards.

## Step 4: Shared filter (one state, one derived list)

Hold these three pieces of state in one place (the `Dashboard` page or a small context) and nowhere else:

```
priorityOnly   boolean   (false = "All Hubs", true = "Priority Only")
searchQuery    string
selectedHubId  string | null
```

Derive the visible hubs once, with `useMemo`:

```
visibleHubs = rankedHubs
  .filter(h => !priorityOnly || h.isPriority)
  .filter(h => matchesSearch(h, searchQuery))   // name or hubId, case-insensitive, trimmed
```

Pass the same `visibleHubs` to both `HubList` and `HubMap`. Neither component may filter on its own. This is what guarantees the map and list never disagree.

Edge cases to handle:
- If `selectedHubId` is no longer in `visibleHubs` after a filter change, clear it and close the detail panel.
- Typing in search must not reset `priorityOnly` or reload data.
- A filter that returns zero hubs shows the empty state with a "Reset filter" button that resets both `priorityOnly` and `searchQuery`.
- Show the count of visible hubs next to the list (for example "12 hubs").

## Step 5: Leaflet map

- One marker per visible hub, each carrying `hubId`. Clicking a marker sets `selectedHubId`. Clicking a list row does the same, and the matching marker is visually highlighted.
- Use `CircleMarker` (or `divIcon`) colored by priority. This avoids the well-known broken default marker icon problem in Vite builds. If default `Marker` icons are used, fix the icon URLs explicitly.
- Marker colors: Priority = magenta/red, normal = gray. Legend has two dots only.
- Popup content: hub name and mean dwell time. Render it as React content or plain text, never an HTML string built from data.
- Tile layer is OpenStreetMap. The attribution `© OpenStreetMap contributors` must stay visible at every screen size. Do not hide or restyle it away.
- Fit the map to the visible markers when the filter changes, and handle zero markers without throwing.
- Call `map.invalidateSize()` when the container changes size (detail panel opens, mobile layout switches, tab becomes visible). A map that renders gray or half-loaded is almost always this.
- **Avoid `map already initialized`**: with `react-leaflet`, render a single `MapContainer` and never conditionally remount it. With raw Leaflet, create the map in `useEffect`, guard with a ref, and return a cleanup that calls `map.remove()` so React 18 StrictMode double-invoking effects is safe. Verify by running in dev mode and switching pages back and forth.
- Give the map container an explicit height in CSS. Leaflet renders nothing without one.
- Import `leaflet/dist/leaflet.css` once.

## Step 6: UI and layout

Follow the approved Stitch design, simplified. Do not add any text, label, badge, chart, or statistic that is not listed here.

**Brand tokens** (define as CSS variables in one place so they are easy to change). These hex values are approximations of the Anteraja identity, not official codes. Tell the user to verify them.
- Primary magenta `#E6007E`, navy `#1B1464` (sidebar and headings), background `#F7F7FA`, white cards with a 1px light border and 12px radius.
- Font: Inter with a sans-serif fallback.

**Navigation**: exactly 3 items: Dashboard, AI Insight, Data Notes. Sidebar on desktop (logo and 3 items only, no badges, no user block, no status footer). Bottom navigation bar on mobile with the same 3 items. Page header: page title on the left, and "Last updated" on the right only if the data actually contains a timestamp. Otherwise omit it.

**Dashboard**, top to bottom:
1. Four KPI cards in this order: Total Hubs, Completed Visits, Global Mean Dwell Time (hrs), Priority Hub Count. Each has a label, one large number, and at most one short note line.
2. "Top 3 Hubs by Dwell Time": three cards with rank, hub name, mean dwell time, and priority badge.
3. Filter bar: search input and a two-option segmented control, `All Hubs | Priority Only`.
4. Map and list, side by side on desktop (about 60/40), stacked on mobile with the map first (around 240–320px tall).
5. Hub detail: on desktop it replaces the list in the right column, with a "← Back to list" link. It must not cover the map. On mobile it is a bottom sheet with a clear close control. Closed by default.

**Hub detail content** (minimum required): hub name, hub ID, investigation priority badge, mean dwell time, min dwell time, max dwell time, completed visit count, open visits. Always show units ("hrs") so values read clearly. Keep a "Mark for investigation" button only if the user wants it; if kept, it may just toggle local state.

**Application states**: implement every state described in "Application states and error handling" above (Loading, Error, the three Empty cases, partial data). Their visual style follows the design: skeleton placeholders, one centered error card, short messages, no illustrations.

**AI Insight page**: three cards: Summary, Priority Hubs, Next Checks, plus the small note "Generated from verified metrics only." Read from `ai-summary.json` (`summary`, `priority_hubs`, `next_checks`). Handle: normal, empty `priority_hubs` ("No hubs meet the priority threshold"), data unavailable ("Data not available"), loading, and error.

**Data Notes page**: short plain definitions of Dwell Time, Completed Visits, Open Visits (excluded from the average), Global Mean Dwell Time (weighted by completed visits). One priority rule using the real threshold from the constant, and a Data Sources table listing the real file names `metrics.json` and `locations.json`. Do not describe systems that the data does not mention (scanners, warehouse systems, telemetry).

## Step 7: Safe rendering of data

All text from JSON, especially hub names and everything in `ai-summary.json`, is untrusted. Render it only as React text nodes. Never use `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `new Function`. Never build popup HTML by string concatenation. If a hub name contains an odd instruction or markup, it is simply displayed as a name and nothing else happens.

## Step 8: Responsive testing

Check at 1440px and 390px (browser devtools is fine) and confirm:
- Desktop: map and list side by side.
- Mobile: map and list stacked, map still visible without scrolling past the header and KPIs more than necessary.
- Marker popup opens and is tappable on mobile.
- Detail panel or sheet opens and closes.
- Dwell values always show units.
- Both filter controls and search work.
- `© OpenStreetMap` attribution is visible.
- No console errors, in particular no `map already initialized`.

Take `screenshots/desktop.png` and `screenshots/mobile.png` if the environment allows. Otherwise tell the user to capture them, rather than skipping silently.

## Step 9: Code and logic review checklist

Before declaring done, check each item against the actual code and report pass/fail with the file and line where relevant:

- [ ] Ranking uses raw numeric values, not formatted strings
- [ ] Global mean is computed from completed visits, weighted
- [ ] Open visits are not included in any completed mean
- [ ] `hub_id` is consistent across all three datasets (validation function exists and reports mismatches)
- [ ] Map and list receive the same `visibleHubs`; no component filters independently
- [ ] No `map already initialized` error (tested with StrictMode on, switching pages)
- [ ] AI-generated text is rendered as plain text only
- [ ] The 6-hour threshold lives in one constant and is documented as a practice rule, not an official SLA
- [ ] `response.ok` is checked, so a missing file shows the Error view, not a JSON parse crash
- [ ] Loading, Error, and all three Empty cases were tested by hand, per file
- [ ] Empty data never produces `NaN`, `undefined`, or a blank screen
- [ ] A failure in `ai-summary.json` or `locations.json` does not break the rest of the dashboard
- [ ] Each page is wrapped in an `ErrorBoundary`

Small unit tests for `calculations.js` cover this well: a weighted mean case where mean-of-means would give a different answer, a ranking case where string sorting would give the wrong order, a case with open visits present, and an empty hub list.

## Step 10: Documentation

Create `docs/hub-dwell-monitor.md` with these sections: 1. Project Overview, 2. Data Sources, 3. Stitch Design, 4. AI Testing, 5. Application Features, 6. Testing, 7. Operational Insight.

- Sections 1, 2, 5, 6 are written from the real code and data.
- Sections 3 and 4 need material from outside the codebase: leave a clear `TODO` with the expected screenshot paths (`screenshots/stitch-v1.png`, `screenshots/stitch-v2.png`) and a table skeleton for the four AI tests (Normal Data, No Priority Hub, Empty Hubs, Untrusted Hub Name). Never invent results.
- Section 7 is one paragraph naming the hub that should be investigated first, justified only with numbers computed from the data (mean dwell, completed visits, open visits). No guessed causes of delay.

Also write a short `README.md`: what it is, how to install and run (`npm install`, `npm run dev`), and where the data files live.

## Step 11: Git workflow

- Work on branch `feature/hub-dwell-monitor`.
- Make at least three clear commits, for example:
  1. `setup React and Leaflet application`
  2. `implement hub metrics map and filters`
  3. `add responsive UI testing and documentation`
- Do not push, open the PR, or merge unless the user asks. The flow is Push → Pull Request → Partner Review → Revision → Merge, and the review step belongs to the user's partner.

## Things to avoid

- Inventing data, causes of delay, SLAs, system names, model versions, or statistics.
- Hardcoding the sample numbers from the design (48 hubs, 4.82 hrs, and so on). Every number comes from the JSON.
- Separate filter state in the map and the list.
- Overlays that hide the map on desktop.
- Extra features beyond this file: charts, exports, auth, dark mode, backend.

## Final reply to the user

Keep it short: what was built, which field-name assumptions were made after inspecting the data, the checklist results, and anything the user still has to do by hand (screenshots, AI test results, official brand colors, pushing and opening the PR).
