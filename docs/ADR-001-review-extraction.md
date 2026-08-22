# ADR-001: Review Service Extraction & Serverless Background Tasks

**Status:** Accepted | **Date:** 2026-08-16 | **Deciders:** ShopSphere Team

---

## Context

The ShopSphere monolith (`server/`) handled all business logic — products, orders, cart, auth, and reviews — in a single Express process. Reviews used MongoDB (via Mongoose) while all other entities used PostgreSQL (via Prisma), creating a dual-database coupling within one deployable unit. Additionally, background tasks like email notifications ran synchronously in the request path, blocking responses.

## Decision

**1. Extract Reviews into a standalone microservice.** The review functionality (CRUD, rating aggregation) is now served by `EYOUTH-30905221100244-ShopSphere-Review-Service`, an independent Express + TypeScript application with its own MongoDB, repository, and deployment lifecycle. The main app proxies `/api/reviews/*` to this service via REST with try/catch error handling — if the review service is down, the main app returns gracefully (empty reviews or 503) without breaking any other feature.

**2. Background tasks use Vercel Serverless Functions.** A new `server/api/notification.js` serverless function handles order confirmations, review notifications, and low-stock alerts as fire-and-forget background jobs, invoked via HTTP POST. This decouples notification logic from the request cycle.

## Rationale

| Factor | Monolith (before) | Microservice + Serverless (after) |
|--------|-------------------|-----------------------------------|
| **Deployment** | Any review change redeploys entire API | Review service deploys independently |
| **Database coupling** | MongoDB driver bundled in Postgres-based app | Review service owns its MongoDB exclusively |
| **Scalability** | Reviews scale with the monolith | Review service scales independently |
| **Resiliency** | Review failure crashes all endpoints | Main app continues; reviews degrade gracefully |
| **Background work** | Sync email in request path (slow) | Serverless function processes async (fast) |

## Consequences

- **Positive:** Independent scaling, isolated failure domains, cleaner separation of MongoDB vs PostgreSQL concerns, faster main-app responses by offloading notifications.
- **Negative:** Network hop for review requests (mitigated by same-region deployment), internal service token must be synchronized between main app and review service, one more service to monitor.
- **Mitigations:** The main app wraps all review-service calls in try/catch and returns fallback responses. Health endpoints on both services enable uptime monitoring. The review service calls back to the main app's `/api/internal/products/:id/rating` to keep product ratings in sync.

## Alternatives Considered

- **Keep reviews in monolith with async workers:** Simpler but doesn't address database coupling or independent deployment.
- **Event-driven (message queue):** Over-engineered for current scale; REST sync is sufficient with graceful degradation.
