# ShopSphere Kubernetes Multi-Cloud Simulation

Task 2 Kubernetes simulation. Two isolated namespaces — `aws-simulation` and
`gcp-simulation` — each running an isolated ShopSphere frontend + backend pod
and ClusterIP service, with strict cross-namespace isolation enforced by
NetworkPolicies.

## Layout

```
k8s/
  namespaces.yaml                 # aws-simulation + gcp-simulation
  aws-simulation/
    backend.yaml                  # Deployment + Service (port 5000)
    frontend.yaml                 # Deployment + Service (port 80)
    network-policy.yaml           # same-namespace-only ingress + egress
  gcp-simulation/
    backend.yaml
    frontend.yaml
    network-policy.yaml
  apply.sh                        # idempotent provisioning script
```

## Prerequisites

- A Kubernetes cluster (this was validated on `kind` v0.32.0, node v1.36.1).
- Images built and loaded into the cluster:

```bash
docker build -f server/Dockerfile -t shopsphere-backend:latest .
docker build -f client/Dockerfile --build-arg VITE_API_URL=/api -t shopsphere-frontend:latest .
kind load docker-image shopsphere-backend:latest shopsphere-frontend:latest --name ecommence-sim
```

> The frontend image bakes `VITE_API_URL=/api`; nginx inside the frontend pod
> reverse-proxies `/api` to the in-namespace `backend` service, mirroring the
> Vercel production setup.

## Provision

```bash
# optional: point the simulation at real cloud databases
export DATABASE_URL="postgresql://postgres.<ref>:<pw>@<host>:6543/postgres?pgbouncer=true&connection_limit=1"
export DIRECT_URL="postgresql://postgres.<ref>:<pw>@<host>:5432/postgres"
export MONGODB_URI="mongodb+srv://<user>:<pw>@<cluster>.mongodb.net/ecommence"

./apply.sh
```

No credentials are stored in this repository. The manifests reference a
`app-secrets` Secret (per namespace) that `apply.sh` creates at runtime.

## Verify

```bash
# 1) Pods + services in each namespace
kubectl get pods,svc -n aws-simulation
kubectl get pods,svc -n gcp-simulation

# 2) Strict isolation — own namespace works, the other does not
kubectl exec deploy/backend -n aws-simulation -- sh -c \
  "curl -s -m 8 http://backend.aws-simulation.svc.cluster.local:5000/api/health"   # 200 ok
kubectl exec deploy/backend -n aws-simulation -- sh -c \
  "curl -s -m 8 http://backend.gcp-simulation.svc.cluster.local:5000/api/health"   # blocked/timeout

# 3) kubectl port-forward verification
kubectl port-forward -n aws-simulation svc/frontend 3100:80     # http://localhost:3100  -> SPA (200)
kubectl port-forward -n aws-simulation svc/backend  3200:5000   # http://localhost:3200/api/health -> {"status":"ok"}
kubectl port-forward -n gcp-simulation  svc/frontend 4100:80
kubectl port-forward -n gcp-simulation  svc/backend  4200:5000
```

## Verified results

```
aws-simulation  backend-6d79f5c94c-cplcb   1/1 Running   postgres: ok, mongodb: ok
aws-simulation  frontend-7ffff6dcb6-bhtbx  1/1 Running   HTTP 200 on :3100, /api proxy OK
gcp-simulation  backend-68b64b9f8f-xjpds   1/1 Running   postgres: ok, mongodb: ok
gcp-simulation  frontend-7ffff6dcb6-8kvjf  1/1 Running   HTTP 200 on :4100, /api proxy OK

isolation (aws pod -> gcp backend): HTTP=000 (BLOCKED)
isolation (gcp pod -> aws backend): HTTP=000 (BLOCKED)
```
