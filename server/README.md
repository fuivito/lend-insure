# Lendinsure Broker Backend

Backend service for managing broker clients, policies, and financing agreements.

## Technology Stack

- **Runtime**: Node.js + TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **API Framework**: Fastify
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose

### Installation

1. **Navigate to the server directory:**

```bash
cd server
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults should work for local development).

4. **Start PostgreSQL with Docker:**

```bash
docker compose up -d
```

Wait a few seconds for the database to initialize.

5. **Run database migrations:**

```bash
npx prisma migrate dev --name init
```

6. **Seed the database with demo data:**

```bash
npx prisma db seed
```

This creates:
- 1 demo organisation
- 1 broker admin user
- 1 broker user
- 1 client
- 1 policy
- 1 active agreement with 12 instalments

7. **Start the development server:**

```bash
npm run dev
```

The server will start at `http://localhost:3001`

## API Documentation

Once the server is running, visit:

**Swagger UI**: [http://localhost:3001/docs](http://localhost:3001/docs)

## Authentication & RBAC

### Roles

- `BROKER`: Can manage clients and agreements for their organisation
- `BROKER_ADMIN`: Same as BROKER with additional administrative capabilities
- `INTERNAL`: Can access all organisations (system admin)

### Development Authentication

In development mode (`NODE_ENV=development`), you can use HTTP headers to simulate authentication:

```bash
curl -H "X-User-Id: <user-id>" \
     -H "X-Org-Id: <org-id>" \
     -H "X-Role: BROKER" \
     http://localhost:3001/api/broker/clients
```

Get the IDs from the seeded data:

```bash
npx prisma studio
```

This opens a web UI at `http://localhost:5555` where you can view your data.

### Production Authentication

In production, use JWT tokens:

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     http://localhost:3001/api/broker/clients
```

## Endpoints

### System

- `GET /health` - Health check

### Broker - Clients

- `GET /api/broker/clients` - List clients (with search)
- `POST /api/broker/clients` - Create client
- `GET /api/broker/clients/:id` - Get client details

### Broker - Policies

- `POST /api/broker/policies` - Create policy for client
- `GET /api/broker/policies/:id` - Get policy details

### Broker - Agreements

- `GET /api/broker/agreements` - List agreements (filter by status/client)
- `POST /api/broker/agreements` - Create draft agreement (auto-generates instalments)
- `GET /api/broker/agreements/:id` - Get agreement details
- `POST /api/broker/agreements/:id/propose` - Mark agreement as PROPOSED

### Broker - Dashboard

- `GET /api/broker/dashboard` - Get KPIs (active agreements, defaults, revenue, notifications)

## Database Management

### View data in browser

```bash
npx prisma studio
```

### Create a new migration

```bash
npx prisma migrate dev --name <migration-name>
```

### Reset database

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Run all migrations
4. Run seed script

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
├── src/
│   ├── lib/
│   │   └── prisma.ts       # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.ts         # Authentication middleware
│   │   └── rbac.ts         # Role-based access control
│   ├── routes/
│   │   ├── health.ts       # Health check
│   │   └── broker/         # Broker endpoints
│   │       ├── clients.ts
│   │       ├── policies.ts
│   │       ├── agreements.ts
│   │       └── dashboard.ts
│   └── index.ts            # Server entry point
├── docker-compose.yml      # PostgreSQL service
├── .env.example            # Environment variables template
└── package.json
```

## Organisation Scoping

All broker endpoints enforce organisation scoping:

- `BROKER` and `BROKER_ADMIN` can only access data for their own organisation
- `INTERNAL` role can access all organisations

The middleware automatically filters queries based on the authenticated user's organisation.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:seed` - Seed database

## Troubleshooting

### Database connection fails

Make sure PostgreSQL is running:

```bash
docker compose ps
```

If not running:

```bash
docker compose up -d
```

### Port 3001 already in use

Change the `PORT` in `.env` file:

```
PORT=3002
```

### Reset everything

```bash
docker compose down -v
docker compose up -d
npx prisma migrate reset
npm run dev
```
