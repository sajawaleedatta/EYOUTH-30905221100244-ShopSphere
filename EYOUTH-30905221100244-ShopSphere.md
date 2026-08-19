# EYOUTH-30905221100244-ShopSphere — Project Links

> **Visibility:** Anyone with the link can view this document.

---

## Production URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | https://shopsphere-frontend-henna.vercel.app | React SPA (customer + admin) |
| Backend API | https://shopsphere-server-pied.vercel.app/api | Express REST API |
| Health Check | https://shopsphere-server-pied.vercel.app/api/health | Uptime & DB connectivity |

---

## Uptime Monitoring

| Monitor | URL Checked | Interval |
|---------|-------------|----------|
| Backend Health | https://shopsphere-server-pied.vercel.app/api/health | 5 min |
| Frontend | https://shopsphere-frontend-henna.vercel.app | 5 min |

---

## Repository & Review Links

| Item | URL |
|------|-----|
| GitHub Repository | https://github.com/sajawaleedatta/EYOUTH-30905221100244-ShopSphere |
| Review Service Repository | https://github.com/sajawaleedatta/EYOUTH-30905221100244-ShopSphere (subfolder `EYOUTH-30905221100244-ShopSphere-Review-Service/`) |
| CI/CD Workflow | https://github.com/sajawaleedatta/EYOUTH-30905221100244-ShopSphere/actions/workflows/deploy.yml |
| Pull Requests | https://github.com/sajawaleedatta/EYOUTH-30905221100244-ShopSphere/pulls |

---

## Service Architecture

| Service | Technology | Classification |
|---------|-----------|----------------|
| Frontend | React 19 + Vite (Vercel) | PaaS |
| Backend | Express + TypeScript (Vercel Functions) | PaaS |
| Primary DB | PostgreSQL 16 (Supabase) | PaaS |
| Secondary DB | MongoDB 7 (MongoDB Atlas) | PaaS / DBaaS |
| Review Service | Express + TypeScript (separate deploy) | PaaS |

---

## Documentation

| Document | Location |
|----------|----------|
| README | [README.md](README.md) |
| Architecture Decision Record | [docs/ADR-001-review-extraction.md](docs/ADR-001-review-extraction.md) |
| Rollback Plan | [docs/EYOUTH-30905221100244-ShopSphere-Rollback-Plan.md](docs/EYOUTH-30905221100244-ShopSphere-Rollback-Plan.md) |
| Architecture Diagram (PDF) | [EYOUTH-30905221100244-ShopSphere.pdf](EYOUTH-30905221100244-ShopSphere.pdf) |

---

## Database Credentials (managed via environment variables — never in code)

| Variable | Service | Notes |
|----------|---------|-------|
| `DATABASE_URL` | Supabase PostgreSQL | Transaction pooler (port 6543) |
| `DIRECT_URL` | Supabase PostgreSQL | Direct connection (port 5432) |
| `MONGODB_URI` | MongoDB Atlas | Cluster connection string |
| `JWT_SECRET` | — | Signing key for auth tokens |
| `VERCEL_TOKEN` | Vercel | CI/CD deploy token (GitHub Secret) |

All secrets are stored in Vercel environment variables and GitHub Actions secrets. None are committed to the repository.
