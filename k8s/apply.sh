#!/usr/bin/env bash
# Provision the ShopSphere Kubernetes multi-cloud simulation.
#
# Creates the literal namespaces aws-simulation and gcp-simulation, seeds the
# per-namespace backend secrets, and deploys the isolated frontend/backend
# Deployments + Services with strict NetworkPolicy isolation.
#
# The backend secrets default to local-only placeholders so the manifests stay
# free of real credentials. Override with your cloud databases when you want a
# fully live simulation, e.g.:
#
#   export DATABASE_URL="postgresql://postgres.<ref>:<pw>@<host>:6543/postgres"
#   export DIRECT_URL="postgresql://postgres.<ref>:<pw>@<host>:5432/postgres"
#   export MONGODB_URI="mongodb+srv://<user>:<pw>@<cluster>.mongodb.net/ecommence"
#   ./apply.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

kubectl apply -f "$ROOT/namespaces.yaml"

DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/ecommence}"
DIRECT_URL="${DIRECT_URL:-postgresql://postgres:postgres@localhost:5432/ecommence}"
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/ecommence}"

for NS in aws-simulation gcp-simulation; do
  JWT_SECRET="$(openssl rand -hex 32)"
  kubectl delete secret app-secrets -n "$NS" --ignore-not-found >/dev/null
  kubectl create secret generic app-secrets -n "$NS" \
    --from-literal=DATABASE_URL="$DATABASE_URL" \
    --from-literal=DIRECT_URL="$DIRECT_URL" \
    --from-literal=MONGODB_URI="$MONGODB_URI" \
    --from-literal=JWT_SECRET="$JWT_SECRET"
done

kubectl apply -f "$ROOT/aws-simulation"
kubectl apply -f "$ROOT/gcp-simulation"

echo "Done. Check with: kubectl get pods -A"
