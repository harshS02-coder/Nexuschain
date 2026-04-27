# NexusChain — Intelligent Supply Chain Platform

> Real-time disruption detection, AI-powered delay prediction, and dynamic route optimization for modern logistics operations.

---

## Problem Statement

Global supply chains lose an estimated $1.5 trillion annually due to disruptions — weather events, port congestion, supplier failures, and traffic incidents. Traditional logistics dashboards show you what happened. NexusChain tells you what is about to happen and what to do about it.

---

## What NexusChain Does

NexusChain is a full-stack supply chain intelligence platform that gives logistics operators real-time visibility across their entire network — and uses ML-based prediction to get ahead of disruptions before they cause damage.

### Key Capabilities

**Real-Time Operations Dashboard**
Live KPI cards showing total shipments, active disruptions, on-time delivery rate, and network-wide risk score. Status distribution charts and delay prediction feeds update automatically.

**AI Delay Prediction Engine**
XGBoost-style ensemble model that scores every in-transit shipment for delay risk using four factors: historical delay patterns, weather impact, route congestion, and supplier reliability. Outputs predicted delay in hours, confidence score, risk level (low / medium / high / critical), and a plain-English recommendation.

**Disruption Detection and Alerting**
Monitors active disruptions by type (weather, traffic, port congestion, supplier issues, customs delays) and severity. Automatically generates alerts and surfaces impacted shipments and routes.

**Dynamic Route Recommendations**
When a route is disrupted, the system generates alternate route recommendations with estimated time savings, cost impact, and risk reduction scores. Operators can accept or execute recommendations directly from the dashboard.

**Full Shipment Lifecycle Tracking**
End-to-end shipment tracking from creation to delivery. Every status change, reroute, delay, and customs event is logged with location and timestamp. Expandable detail panels show full event timelines.

**Network Map**
Interactive map with warehouse markers, route polylines color-coded by risk level, and disruption heat circles. Side panels show active disruptions and route health scores.

**Analytics**
Three-tab deep analytics covering weekly disruption trends, shipment status breakdowns, corridor performance matrix, ML model accuracy tracking, and network-wide disruption forecasts with probabilistic risk factor breakdowns.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Routing | React Router v7 |
| API Layer | tRPC v11 (end-to-end type safety) |
| Backend | Hono (lightweight Node.js server) |
| ORM | Drizzle ORM |
| Database | MySQL 9 |
| Auth | JWT sessions (jose), bcrypt password hashing |
| Real-Time | Redis pub/sub (ioredis) |
| Charts | Recharts |
| Maps | Leaflet |
| Build Tool | Vite |
| Runtime | Node.js 20+ |

---

## Architecture

```
Client (React + tRPC client)
        |
        | HTTPS
        v
Hono Server
        |
        |-- /api/auth/*     → Email + Password auth (register, login, logout)
        |-- /api/trpc/*     → tRPC router (type-safe API)
        |
        v
tRPC Routers
        |
        |-- shipmentRouter    → CRUD, tracking, event logging
        |-- disruptionRouter  → Active disruptions, alerts, mark-read
        |-- routeRouter       → Route listing, recommendations, accept/execute
        |-- analyticsRouter   → KPIs, status distribution, trends, performance
        |-- predictionRouter  → Delay prediction, batch scoring, disruption forecast
        |-- authRouter        → Session management
        |
        v
Drizzle ORM → MySQL
Redis → Real-time pub/sub
```

### Database Schema (11 tables)

`users` `warehouses` `suppliers` `carriers` `shipments` `shipment_events` `routes` `disruption_events` `predictions` `alerts` `route_recommendations` `telemetry_events`

---

## ML Prediction Engine

Built directly into the Node.js backend — no external ML service required.

**Delay Prediction (per shipment)**
```
predicted_delay = (historical_delays * 0.4)
                + (weather_factor     * 0.3)
                + (congestion_factor  * 0.2)
                + (supplier_risk      * 0.1)

confidence = 0.6 + random_variance + supplier_risk_adjustment
             capped at 0.95
```

**Batch Prediction**
Scores all in-transit shipments simultaneously and stores results in the predictions table. Results are sorted by predicted delay descending so operators see the highest-risk shipments first.

**Network Disruption Forecast**
Probabilistic model that estimates overall network risk and breaks it down by disruption type (weather, traffic, port congestion, supplier issues). Outputs a recommended action and time horizon.

---

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL 9
- Redis (optional — required only for real-time pub/sub features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nexuschain.git
cd nexuschain/app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
DATABASE_URL=mysql://root:password@localhost:3306/nexuschain
JWT_SECRET=your-long-random-secret-minimum-32-characters
OWNER_EMAIL=admin@yourcompany.com
REDIS_URL=redis://localhost:6379
```

`OWNER_EMAIL` — the first user to register with this email automatically gets the `admin` role.

### Database Setup

```bash
# Generate migrations
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate



### Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:3003`

---

## User Roles

| Role | Permissions |
|---|---|
| `user` | View dashboard, shipments, routes, alerts, analytics |
| `admin` | All of the above + create shipments, log events, create disruptions, create alerts, accept route recommendations |

The first user who registers with the email set in `OWNER_EMAIL` automatically becomes admin.

---

## API Endpoints

### Auth (REST)
```
POST /api/auth/register   { email, password, name }
POST /api/auth/login      { email, password }
POST /api/auth/logout
GET  /api/auth/me
```

### tRPC Procedures
```
analytics.kpis
analytics.statusDistribution
analytics.disruptionTrends
analytics.routePerformance
analytics.networkData

shipment.list
shipment.byId
shipment.byTracking
shipment.events
shipment.create          [admin]
shipment.updateStatus    [admin]
shipment.addEvent        [admin]
shipment.warehouses
shipment.suppliers
shipment.carriers

disruption.list
disruption.active
disruption.bySeverity
disruption.create        [admin]
disruption.resolve       [admin]
disruption.alerts
disruption.unreadAlerts
disruption.createAlert   [admin]
disruption.markAlertRead [auth]

route.list
route.recommendations
route.createRecommendation  [admin]
route.acceptRecommendation  [admin]

prediction.list
prediction.predictDelay
prediction.predictDisruption
prediction.batchPredict
```

---

## Project Structure

```
app/
├── api/                    # Backend
│   ├── auth.ts             # Email + password auth handlers
│   ├── auth-router.ts      # tRPC auth router
│   ├── analytics-router.ts
│   ├── shipment-router.ts
│   ├── disruption-router.ts
│   ├── middleware.ts       # tRPC middleware, role guards
│   ├── context.ts          # tRPC context
│   ├── boot.ts             # Hono server setup
│   ├── queries/
│   │   ├── users.ts
│   │   ├── supplyChain.ts
│   │   └── connection.ts
│   └── lib/
│       ├── env.ts
│       ├── redis.ts
│       └── cookies.ts
├── db/
│   ├── schema.ts           # Drizzle schema (11 tables)
│   └── migrations/
├── src/                    # Frontend
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Shipments.tsx
│   │   ├── Network.tsx
│   │   ├── RoutesPage.tsx
│   │   ├── Alerts.tsx
│   │   ├── Analytics.tsx
│   │   └── Login.tsx
│   ├── components/
│   ├── hooks/
│   │   └── useAuth.ts
│   └── providers/
│       └── trpc.tsx
├── drizzle.config.ts
└── vite.config.ts
```

---

## Features Roadmap

- WebSocket-based live shipment tracking
- Mobile app (React Native)
- Integration with real carrier APIs (FedEx, DHL, BlueDart)
- Advanced ML models with historical training data
- PDF export for shipment reports
- Multi-tenant support for enterprise customers

---

## License

MIT