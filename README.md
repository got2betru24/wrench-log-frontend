# WrenchLog — Frontend

React + TypeScript frontend for WrenchLog, built with Vite and MUI v6.

---

## Structure

```
frontend/
├── index.html
├── vite.config.ts          # Dev proxy: /api/* → localhost:8000
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx            # ReactDOM entry point
    ├── App.tsx             # QueryClientProvider + ThemeProvider + Router
    ├── theme/
    │   └── theme.ts        # MUI dark automotive theme (amber/slate palette)
    ├── types/
    │   └── index.ts        # TypeScript interfaces matching backend schemas
    ├── api/
    │   ├── client.ts       # Axios instance with error interceptor
    │   ├── vehicles.ts
    │   ├── schedules.ts
    │   ├── entries.ts      # Includes multipart upload helper
    │   └── dashboard.ts
    ├── hooks/
    │   └── index.ts        # All React Query hooks + query key factory
    ├── pages/
    │   ├── DashboardPage.tsx
    │   ├── VehiclesPage.tsx
    │   ├── VehicleDetailPage.tsx   # 3-tab layout: History / Schedule / Stats
    │   └── VehicleFormPage.tsx     # Handles both add and edit
    └── components/
        ├── shared/
        │   ├── Layout.tsx          # Collapsible sidebar, mobile drawer
        │   ├── ScoreGauge.tsx      # SVG arc gauge (0–100, color-coded)
        │   ├── HealthChip.tsx      # Good / Fair / Attention chip
        │   └── ConfirmDialog.tsx   # Reusable delete confirmation modal
        ├── dashboard/
        │   ├── VehicleHealthCard.tsx   # Score gauge + top alerts + stats
        │   └── AlertsPanel.tsx         # Overdue/due-soon list with Log It actions
        ├── vehicles/
        │   └── VehicleForm.tsx         # Add/edit form with validation
        ├── schedule/
        │   └── ScheduleManager.tsx     # Full CRUD table + seed-templates button
        └── entries/
            ├── EntryForm.tsx           # Smart form with urgency-sorted dropdown
            ├── EntryTimeline.tsx       # Year-grouped timeline with expand/collapse
            ├── MileageChart.tsx        # Recharts line chart + 90-day projection
            └── AttachmentList.tsx      # Upload, open, and delete file attachments
```

---

## Setup

```bash
cd frontend
npm install

# Development (requires backend running on :8000)
npm run dev         # http://localhost:5173

# Production build
npm run build       # output → dist/
npm run preview     # preview production build locally
```

---

## Dev Proxy

`vite.config.ts` proxies two paths to the backend during development:

| Path       | Target                  |
|------------|-------------------------|
| `/api/*`   | `http://localhost:8000` |
| `/uploads/*` | `http://localhost:8000` |

In production, Traefik handles this routing — no changes needed to the built app.

---

## Key Dependencies

| Package                  | Version  | Purpose                          |
|--------------------------|----------|----------------------------------|
| `react`                  | 18.x     | UI framework                     |
| `react-router-dom`       | 7.x      | Client-side routing              |
| `@mui/material`          | 6.x      | Component library                |
| `@mui/icons-material`    | 6.x      | Icon set                         |
| `@tanstack/react-query`  | 5.x      | Server state, caching, mutations |
| `axios`                  | 1.x      | HTTP client                      |
| `recharts`               | 2.x      | Mileage trend chart              |
| `date-fns`               | 4.x      | Date utilities                   |

---

## State Management

All server state is managed by **TanStack React Query**. There is no global client-side state store (no Redux, no Zustand).

Query keys are defined centrally in `src/hooks/index.ts`:

```ts
export const qk = {
  dashboard:     ['dashboard'],
  vehicles:      (archived?) => ['vehicles', archived],
  vehicle:       (id) => ['vehicle', id],
  vehicleHealth: (id) => ['vehicle-health', id],
  schedules:     (vehicleId) => ['schedules', vehicleId],
  entries:       (vehicleId) => ['entries', vehicleId],
  mileage:       (vehicleId) => ['mileage', vehicleId],
}
```

All mutations invalidate the relevant query keys on success, including propagating to `dashboard` and `vehicle-health` when entries or schedules change.

---

## Theme

Defined in `src/theme/theme.ts`. Key design tokens:

| Token               | Value       | Usage                          |
|---------------------|-------------|--------------------------------|
| Background default  | `#0f1117`   | App background                 |
| Background paper    | `#161b27`   | Cards, dialogs                 |
| Primary             | `#f59e0b`   | Amber — buttons, highlights    |
| Divider             | `#2e3a52`   | Borders, separators            |
| Gauge good          | `#4ade80`   | Score ≥ 80                     |
| Gauge fair          | `#fbbf24`   | Score 50–79                    |
| Gauge attention     | `#f87171`   | Score < 50                     |

Fonts: **DM Mono** (headings, monospace values) and **DM Sans** (body) — loaded from Google Fonts via `CssBaseline`.

---

## Routing

| Path                   | Component            | Description              |
|------------------------|----------------------|--------------------------|
| `/`                    | `DashboardPage`      | Fleet overview           |
| `/vehicles`            | `VehiclesPage`       | Vehicle grid             |
| `/vehicles/new`        | `VehicleFormPage`    | Add vehicle              |
| `/vehicles/:id`        | `VehicleDetailPage`  | Detail / history / stats |
| `/vehicles/:id/edit`   | `VehicleFormPage`    | Edit vehicle             |
| `*`                    | Redirect → `/`       |                          |

---

## Docker Notes

Recommended container config for production:

```yaml
# Build stage produces dist/ via `npm run build`
# Serve with Nginx
image: nginx:alpine
volumes:
  - ./frontend/dist:/usr/share/nginx/html:ro
  - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

Minimal `nginx.conf` for SPA routing:

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

Traefik handles `/api/*` routing to the backend — Nginx only needs to serve the static files and handle SPA fallback.
