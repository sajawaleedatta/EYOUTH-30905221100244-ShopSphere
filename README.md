# ECommence

A full-stack e-commerce platform for selling tech products — laptops, tablets, mobile phones, and smart watches. The storefront brand is **Deci Techno**, featuring a customer-facing shopping experience and an admin dashboard for managing products, users, orders, and analytics.

## Features

- **Customer Portal**: Product browsing, search & filter, cart management, checkout (Cash or Visa), order tracking, product reviews
- **Admin Dashboard**: Revenue analytics, product CRUD with image uploads, order management, user management, activity logs
- **Dual Database**: PostgreSQL for core entities (users, products, cart, orders) and MongoDB for reviews and activity logs
- **Role-Based Access**: ADMIN and CUSTOMER roles with JWT authentication
- **Docker Support**: Full Docker Compose setup with PostgreSQL, MongoDB, backend, and frontend services

## Technologies Used

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 20 |
| Backend | Express + TypeScript |
| Frontend | React 19 + TypeScript + Vite |
| Primary Database | PostgreSQL 16 (via Prisma ORM) |
| Secondary Database | MongoDB 7 (via Mongoose) |
| Authentication | JWT + bcryptjs |
| State Management | TanStack React Query |
| HTTP Client | Axios |
| File Uploads | Multer |
| Email | Nodemailer |
| Styling | Custom CSS with CSS custom properties |
| Backend Testing | Jest + Supertest |
| Frontend Testing | Vitest + Testing Library + MSW |
| Production Server | Nginx (reverse proxy + SPA) |
| Containerization | Docker Compose |

## Project Structure

```
ecommence/
├── client/                 # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── api.ts          # Axios client & API functions
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # React Query hooks
│   │   ├── components/     # Shared UI components
│   │   └── pages/          # Customer & admin pages
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── config/         # Database connections
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, uploads, logging
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   └── utils/          # Auth, email, validation
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
└── package.json            # Monorepo workspace root
```

## Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- MongoDB 7
- npm

### Local Development

1. **Clone the repository**
   ```bash
   git clone <...>
   cd ecommence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example files and fill in your values:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This runs both the backend (port 5000) and frontend (port 5173) concurrently.

### Docker Setup

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations and seed**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npx prisma db seed
   ```

3. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## Project URLs

### Production (Live)

| Service | URL |
|---------|-----|
| Frontend | https://shopsphere-frontend-henna.vercel.app |
| Backend API | https://shopsphere-server-pied.vercel.app/api |
| Health Check | https://shopsphere-server-pied.vercel.app/api/health |
| Database | PostgreSQL on Supabase (managed, credentials via Vercel env vars) |

### Local Development

| Service | Local Development | Docker |
|---------|------------------|--------|
| Frontend | `http://localhost:5173` | `http://localhost:3000` |
| Backend API | `http://localhost:5000/api` | `http://localhost:5000/api` |
| Health Check | `http://localhost:5000/api/health` | `http://localhost:5000/api/health` |
| PostgreSQL | `localhost:5432` | `localhost:5432` |
| MongoDB | `localhost:27017` | `localhost:27017` |

## Production Deployment (Task 1)

The application is deployed to Vercel with a managed PostgreSQL database on Supabase:

- **Frontend**: Vercel project `shopsphere-frontend` (root directory `client`). The build uses `VITE_API_URL` (set as a production env var) pointing to the deployed backend.
- **Backend**: Vercel project `shopsphere-server` (root directory `server`). Express is deployed as a single Vercel function (zero-config detection of `src/app.ts`).
- **Database**: Prisma migrations + seed data applied to Supabase PostgreSQL. Runtime uses the Supabase transaction pooler (`DATABASE_URL`, port 6543) and migrations use the direct connection (`DIRECT_URL`, port 5432).
- **MongoDB**: Reviews, activity logs, and admin stats run on MongoDB Atlas (`MONGODB_URI`), connected on lambda cold start with graceful degradation if unavailable.
- **Security**: `helmet`, strict `cors` (only the frontend origin via `CORS_ORIGIN`), and `express-rate-limit` (300 req / 15 min) are active in production.
- **Health & uptime**: `GET /api/health` returns operational status with DB connectivity checks (200 when Postgres is reachable) and is registered with an uptime monitor.

### Production environment variables (Vercel: `shopsphere-server`)

```
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ecommence?retryWrites=true&w=majority"
JWT_SECRET="<random>"
JWT_EXPIRES_IN="7d"
EMAIL_FROM="noreply@decitechno.com"
CLIENT_URL="https://shopsphere-frontend-henna.vercel.app"
CORS_ORIGIN="https://shopsphere-frontend-henna.vercel.app"
PORT="5000"
```

> No secrets are hardcoded in the repository — all values come from `process.env`. The deployed backend reads and writes strictly to Supabase PostgreSQL.

## Cloud Readiness & Kubernetes (Task 2)

### Architecture diagram

See **`EYOUTH-30905221100244-ShopSphere.pdf`** (repo root) — shows the exact Task 1
production topology: Browser → Vercel Frontend → Vercel Backend → Supabase
PostgreSQL + MongoDB Atlas, with traffic routes and the UptimeRobot health monitor.
Source: `docs/EYOUTH-30905221100244-ShopSphere.html`.

### Cloud service classification

| Service | Classification | Justification |
|---------|---------------|---------------|
| Vercel Frontend (`shopsphere-frontend-henna.vercel.app`) | **PaaS** | Vercel builds, hosts, and CDN-serves the React SPA; no servers/OS managed by us. |
| Vercel Backend (`shopsphere-server-pied.vercel.app`) | **PaaS** | Express API runs as Vercel-managed serverless functions — Vercel handles runtime, scaling, and TLS. |
| Supabase (PostgreSQL) | **PaaS** | Fully managed PostgreSQL platform connected over the Postgres wire protocol; no server or engine administration. |
| MongoDB Atlas | **PaaS / DBaaS** | Consumed as a hosted, managed MongoDB via connection string. |

### Kubernetes multi-cloud simulation

Two namespaces — `aws-simulation` and `gcp-simulation` — each run an isolated
ShopSphere frontend + backend (Deployment + ClusterIP Service) on a local `kind`
cluster, with strict same-namespace-only NetworkPolicy isolation.

```bash
# provision (see k8s/README.md for prerequisites & secrets)
./k8s/apply.sh

# verify
kubectl get pods,svc -n aws-simulation     # 2 pods Ready (frontend + backend)
kubectl get pods,svc -n gcp-simulation

# isolation: own namespace works, the other is blocked
kubectl exec deploy/backend -n aws-simulation -- curl -s http://backend.aws-simulation.svc.cluster.local:5000/api/health   # 200 ok
kubectl exec deploy/backend -n aws-simulation -- curl -s -m 8 http://backend.gcp-simulation.svc.cluster.local:5000/api/health  # blocked

# port-forward verification
kubectl port-forward -n aws-simulation svc/frontend 3100:80
kubectl port-forward -n aws-simulation svc/backend 3200:5000
kubectl port-forward -n gcp-simulation svc/frontend 4100:80
kubectl port-forward -n gcp-simulation svc/backend 4200:5000
```

Verified results: all 4 pods `1/1 Running`; `GET /api/health` returns
`{"status":"ok","checks":{"postgres":"ok","mongodb":"ok"}}` in both namespaces;
cross-namespace calls return `HTTP=000` (blocked). See `k8s/README.md` for details.

## Test Accounts

### Admin Account

| Field | Value |
|-------|-------|
| Email | `admin@ecommence.com` |
| Password | `password123` |
| Role | ADMIN |

Admin access provides the full dashboard: product management, order management, user management, revenue analytics, and activity logs.

### Customer Account

| Field | Value |
|-------|-------|
| Email | `customer@ecommence.com` |
| Password | `password123` |
| Role | CUSTOMER |

Customer access provides: product browsing, cart, checkout, order history, and product reviews.

> **Note:** These accounts are created automatically when running `npx prisma db seed`. The seed also populates the database with 40 sample products across 4 categories (Laptops, Tablets, Mobile, Smart Watches).

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter, pagination) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:id` | Update cart item quantity |
| DELETE | `/api/cart/:id` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order from cart |
| GET | `/api/orders` | Get user orders |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/:productId` | Get reviews for product |
| POST | `/api/reviews` | Create review |
| DELETE | `/api/reviews/:id` | Delete review (own or Admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/orders` | List all orders |
| GET | `/api/admin/orders/:id` | Get order details |
| PATCH | `/api/admin/orders/:id/status` | Update order/payment status |
| GET | `/api/admin/activity-logs` | Activity logs (paginated) |
| DELETE | `/api/admin/users/:id` | Delete customer user |

## License
