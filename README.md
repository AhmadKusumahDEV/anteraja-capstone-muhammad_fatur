# Anteraja Hub Dwell Monitor

An operational dashboard built for Anteraja logistics hub supervisors to monitor dwell times, identify bottleneck facilities exceeding operational thresholds, and coordinate investigations across Indonesian transit hubs.

Built with **React 19**, **Vite 8**, **Leaflet 1.9.4 / react-leaflet 5.0.0**, and plain **Vanilla CSS**.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Running Locally
To start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Running Unit Tests
To run the Vitest calculation test suite (pure functions, weighted means, ranking, thresholds):
```bash
npm run test
```

### Building for Production
To build the production bundle:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## Data Files

All application data is served statically from `public/data/` and loaded dynamically via the custom `useHubData` hook:

- **`public/data/metrics.json`**: Pre-aggregated dwell statistics from Day 18 scan events (12 hub facilities, 22,818 completed visits, 924 open visits).
- **`public/data/locations.json`**: City centroid geographic coordinates for 12 Indonesian gateway hub locations.
- **`public/data/ai-summary.json`**: Rule-based operational intelligence summary containing narrative findings, priority hubs, and next check items.

---

## Project Structure

```
hub-dwell-monitor/
├── public/data/
│   ├── metrics.json          # Aggregate hub dwell statistics
│   ├── locations.json        # City centroid coordinates
│   └── ai-summary.json       # AI operational summary
├── src/
│   ├── components/           # Sidebar, KpiCards, TopHubs, FilterBar, HubMap, HubList, HubDetail, StateViews
│   ├── pages/                # Dashboard, AiInsight, DataNotes
│   ├── utils/                # calculations, adapter, validation, constants
│   ├── hooks/                # useHubData data-loading hook
│   ├── App.jsx               # Navigation and layout coordinator
│   └── main.jsx
├── docs/
│   └── hub-dwell-monitor.md  # Comprehensive operational documentation
├── screenshots/              # desktop.png, mobile.png, design screenshots
├── scripts/                  # Automated Playwright test scripts
└── README.md
```

For complete architectural documentation, responsive layout test matrices, error isolation reports, and operational calculation breakdowns, see [docs/hub-dwell-monitor.md](docs/hub-dwell-monitor.md).
