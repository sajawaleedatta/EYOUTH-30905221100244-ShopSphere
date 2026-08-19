# Rollback Plan — EYOUTH-30905221100244-ShopSphere

**Scope:** Covers detection, decision, and restoration steps for failed production releases.

---

## 1. Detection (via Uptime Monitoring)

| Signal | Source | Action |
|--------|--------|--------|
| Health endpoint returns HTTP ≥500 or times out | UptimeRobot → `GET /api/health` | Automatic alert via email/webhook |
| Frontend returns 4xx/5xx on root path | UptimeRobot → `GET /` (frontend) | Automatic alert |
| Response time >5 s sustained | UptimeRobot latency check | Investigate; escalate if degraded |

UptimeRobot is configured with a 5-minute check interval and triggers alerts to the assigned team email when two consecutive checks fail.

---

## 2. Decision

| Condition | Response |
|-----------|----------|
| Only frontend affected | Roll back frontend Vercel deployment only |
| Only backend affected | Roll back backend Vercel deployment only |
| Both affected | Roll back both deployments sequentially (backend first) |
| Database migration caused failure | Roll back deployment **and** revert the Prisma migration |

**Rollback authority:** Any project team member may initiate a rollback without approval when monitoring confirms a failure.

---

## 3. Rollback Procedure (Vercel)

### Backend
```bash
# List recent deployments
vercel ls --scope <org> --token $VERCEL_TOKEN

# Promote the previous working deployment to production
vercel promote <deployment-url> --scope <org> --token $VERCEL_TOKEN
```
*Or use the Vercel Dashboard → shopsphere-server → Deployments → click "Promote to Production" on the last known good deployment.*

### Frontend
```bash
vercel promote <deployment-url> --scope <org> --token $VERCEL_TOKEN
```
*Or use the Vercel Dashboard → shopsphere-frontend → Deployments → Promote.*

### If a database migration caused the issue
```bash
cd server
npx prisma migrate resolve --rolled-back <migration-name>
```
Then re-deploy the previous backend version as above.

---

## 4. Verification

1. Confirm `GET /api/health` returns `{"status":"ok"}` with HTTP 200.
2. Confirm the frontend loads and login works.
3. Check UptimeRobot: both monitors return to "UP" within 10 minutes.
4. Post-incident: review logs (structured JSON in Vercel runtime logs), identify root cause, and fix forward on a feature branch before re-deploying.
