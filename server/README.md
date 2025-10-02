# Lendinsure Broker Backend

Backend service for managing broker clients, policies, and financing agreements.

## Technology Stack

- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL 16
- **ORM**: SQLAlchemy
- **Documentation**: Swagger/OpenAPI (automatic)

## Getting Started

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Docker and Docker Compose

### Installation

1. **Navigate to the server directory:**

```bash
cd server
```

2. **Create a virtual environment:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults should work for local development).

5. **Start PostgreSQL with Docker:**

```bash
docker compose up -d
```

Wait a few seconds for the database to initialize.

6. **Seed the database with demo data:**

```bash
python seed.py
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
python main.py
```

The server will start at `http://localhost:3001`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: [http://localhost:3001/docs](http://localhost:3001/docs)
- **ReDoc**: [http://localhost:3001/redoc](http://localhost:3001/redoc)

## Authentication & RBAC

### Roles

- `BROKER`: Can manage clients and agreements for their organisation
- `BROKER_ADMIN`: Same as BROKER with additional administrative capabilities
- `INTERNAL`: Can access all organisations (system admin)

### Development Authentication

In development mode (`ENVIRONMENT=development`), you can use HTTP headers to simulate authentication:

```bash
curl -H "X-User-Id: <user-id>" \
     -H "X-Org-Id: <org-id>" \
     -H "X-Role: BROKER" \
     http://localhost:3001/api/broker/clients
```

To get the IDs from seeded data, you can query the database directly or use a tool like pgAdmin.

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

## Project Structure

```
server/
├── models.py              # SQLAlchemy models (database schema)
├── schemas.py             # Pydantic schemas (validation)
├── database.py            # Database connection
├── config.py              # Configuration settings
├── main.py                # FastAPI app entry point
├── seed.py                # Database seed script
├── middleware/
│   ├── auth.py           # Authentication middleware
│   └── rbac.py           # Role-based access control
├── routers/
│   ├── health.py         # Health check
│   ├── clients.py        # Client endpoints
│   ├── policies.py       # Policy endpoints
│   ├── agreements.py     # Agreement endpoints
│   └── dashboard.py      # Dashboard endpoints
├── docker-compose.yml     # PostgreSQL service
├── .env.example          # Environment variables template
└── requirements.txt      # Python dependencies
```

## Organisation Scoping

All broker endpoints enforce organisation scoping:

- `BROKER` and `BROKER_ADMIN` can only access data for their own organisation
- `INTERNAL` role can access all organisations

The middleware automatically filters queries based on the authenticated user's organisation.

## Development

### Running with auto-reload

```bash
uvicorn main:app --reload --port 3001
```

Or simply:

```bash
python main.py
```

### Database Inspection

Connect to the database using any PostgreSQL client:

```
Host: localhost
Port: 5432
Database: lendinsure
Username: lendinsure
Password: lendinsure
```

### Reset Database

```bash
docker compose down -v
docker compose up -d
python seed.py
```

## Testing Endpoints

### Example: Create a client

```bash
curl -X POST http://localhost:3001/api/broker/clients \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <broker-user-id>" \
  -H "X-Org-Id: <org-id>" \
  -H "X-Role: BROKER" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+44 20 1234 5678"
  }'
```

### Example: Get dashboard KPIs

```bash
curl http://localhost:3001/api/broker/dashboard \
  -H "X-User-Id: <broker-user-id>" \
  -H "X-Org-Id: <org-id>" \
  -H "X-Role: BROKER"
```

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

Then restart the server.

### Python dependencies issues

Recreate the virtual environment:

```bash
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Reset everything

```bash
docker compose down -v
docker compose up -d
python seed.py
python main.py
```
