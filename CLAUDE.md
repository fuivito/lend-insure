# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LendInsure is a full-stack insurance financing platform with a React frontend and Python FastAPI backend. It supports two user roles: **Brokers** (manage clients and agreements) and **Customers** (view proposals and payments).

## Development Commands

### Frontend (React + Vite)
```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run lint         # Run ESLint
```

### Backend (FastAPI)
```bash
# Activate virtual environment first
source server/.venv/bin/activate

# Then run commands
cd server
uvicorn main:app --reload --port 3001    # Broker API
uvicorn main:app --reload --port 8000    # Customer API
python seed.py                            # Seed database
```

**Important:** Always activate the virtual environment (`source server/.venv/bin/activate`) before running any Python commands.

## Architecture

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack React Query
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL (Supabase), Pydantic
- **Python Version:** 3.12.3

### Directory Structure
```
src/                    # Frontend
├── components/         # UI components (ui/ = shadcn, layout/, broker/, customer/)
├── pages/              # Route pages (broker/, customer/, onboarding/)
├── hooks/              # Data fetching hooks (useAgreements, useClients, etc.)
├── lib/api/            # API clients (client.ts for broker, proposals.ts for customer)
└── types/              # TypeScript types

server/                 # Backend
├── main.py             # FastAPI app entry
├── models.py           # SQLAlchemy ORM models
├── schemas.py          # Pydantic schemas
├── routers/            # API endpoints (clients.py, agreements.py, dashboard.py, etc.)
└── middleware/         # auth.py, rbac.py
```

### API Structure
- **Broker API (port 3001):** `/api/broker/dashboard`, `/api/broker/clients`, `/api/broker/agreements`, `/api/broker/policies`
- **Customer API (port 8000):** `/api/customer/proposals`

### Data Flow Patterns
1. **Broker APIs:** Component → Custom Hook → API Client → FastAPI → Database
2. **Customer APIs:** Component → Direct Fetch → FastAPI → Database

### Database Models
```
Organisation (multi-tenant)
├── BrokerUser
├── Client
│   ├── Policy
│   └── Agreement
│       └── Instalment
└── AuditLog
```

## Key Conventions

### UUID Field Validators (Pydantic)
Always use this pattern for UUID fields in schemas:
```python
@field_validator('id', 'client_id', mode='before')
@classmethod
def convert_uuid(cls, v):
    if isinstance(v, uuid.UUID):
        return str(v)
    return v

class Config:
    from_attributes = True
    json_encoders = {uuid.UUID: str}
```

### Case Conversion
- Backend uses **snake_case**
- Frontend uses **camelCase**
- Transformation happens in API client layer

### Authentication (Development)
Currently mocked. Demo headers used:
- `X-User-Id`, `X-Org-Id`, `X-Role`

### Path Aliases
- Frontend: `@/` maps to `src/` directory

## Key Enums
- **BrokerRoleEnum:** BROKER, BROKER_ADMIN, INTERNAL
- **AgreementStatusEnum:** DRAFT, PROPOSED, SIGNED, ACTIVE, DEFAULTED, TERMINATED
- **InstalmentStatusEnum:** UPCOMING, PAID, MISSED
- **ProposalStatusEnum:** new, viewed, accepted, declined, expired
