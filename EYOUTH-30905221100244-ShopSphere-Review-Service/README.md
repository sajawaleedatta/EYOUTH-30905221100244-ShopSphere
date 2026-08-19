# ShopSphere Review Service

Standalone microservice extracted from the ShopSphere monolith. Manages product reviews with its own MongoDB database.

## Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/reviews/product/:productId` | No | Get reviews for a product |
| POST | `/api/reviews` | Yes | Create a review |
| DELETE | `/api/reviews/:id` | Yes | Delete a review (own or admin) |

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5001 |
| `MONGODB_URI` | MongoDB connection string | required |
| `JWT_SECRET` | Shared secret with main app | required |
| `MAIN_APP_URL` | Main ShopSphere app URL for rating sync | http://localhost:5000 |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:5173 |

## Docker

```bash
docker build -t shopsphere-review-service .
docker run -p 5001:5001 --env-file .env shopsphere-review-service
```
