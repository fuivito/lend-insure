# Frontend-Backend Architecture Documentation

## 🏗️ **Frontend-Backend Architecture Overview**

### **Backend Structure (Python FastAPI)**

**Main Entry Point:**
- `server/main.py` - FastAPI application with CORS middleware
- **Port:** 8000 (for customer APIs) and 3001 (for broker APIs)
- **Routers:** Modular API endpoints organized by functionality

**API Endpoints Structure:**
```
/api/broker/
├── /dashboard          # Dashboard statistics
├── /clients           # Client management
├── /agreements        # Agreement management  
├── /policies          # Policy management

/api/customer/
├── /proposals         # Customer proposals
```

**Key Backend Components:**
- **Models** (`server/models.py`): Database entities (Organisation, Client, Agreement, Policy, etc.)
- **Schemas** (`server/schemas.py`): Pydantic models for request/response validation
- **Middleware**: Authentication (`auth.py`) and RBAC (`rbac.py`)
- **Database**: SQLAlchemy ORM with PostgreSQL

### **Frontend Structure (React + TypeScript)**

**API Client Layer:**
- `src/lib/api/client.ts` - **Broker API client** (port 3001)
- `src/lib/api/proposals.ts` - **Customer API client** (port 8000)

**Custom Hooks (Data Layer):**
- `useBrokerDashboard()` - Dashboard statistics
- `useAgreements()` - Agreement management
- `useClients()` - Client management
- `useAuth()` - Authentication state

**Pages (UI Layer):**
- `src/pages/broker/` - Broker interface
- `src/pages/customer/` - Customer interface

## 🔄 **API Call Flow**

### **1. Broker Dashboard Flow:**
```
BrokerDashboard.tsx 
→ useBrokerDashboard() 
→ apiClient.request('/api/broker/dashboard')
→ server/routers/dashboard.py
→ Database queries
→ Return stats
```

### **2. Agreements List Flow:**
```
AgreementsList.tsx
→ useAgreements(status, page, limit)
→ apiClient.getAgreements(params)
→ server/routers/agreements.py
→ Database with pagination
→ Return agreements + pagination info
```

### **3. Customer Proposals Flow:**
```
ProposalsList.tsx
→ fetchProposals() (direct API call)
→ server/routers/proposals.py
→ Database query
→ Transform snake_case → camelCase
→ Return proposals
```

## 🔐 **Authentication & Authorization**

**Frontend:**
- `useAuth()` hook manages user state
- Role-based routing (`BROKER`, `CUSTOMER`)
- Demo headers for development

**Backend:**
- `AuthContext` middleware extracts user info from headers
- `require_role()` decorator enforces permissions
- Organisation-scoped data access

## 📊 **Data Flow Patterns**

### **Pattern 1: Hook-based (Broker APIs)**
```typescript
// Frontend Hook
const { agreements, isLoading, error } = useAgreements(status, page);

// API Client
async getAgreements(params) {
  return this.request(`/api/broker/agreements?${query}`);
}

// Backend Router
@router.get("")
async def list_agreements(status, page, limit, db, auth):
    # Database query with pagination
    return {"data": agreements, "pagination": {...}}
```

### **Pattern 2: Direct API calls (Customer APIs)**
```typescript
// Frontend
const proposals = await fetchProposals(searchTerm);

// API Function
export async function fetchProposals(searchTerm) {
  const response = await fetch(`${API_BASE_URL}/api/customer/proposals`);
  return data.map(transformToCamelCase);
}
```

## 🗄️ **Database Models**

**Core Entities:**
- `Organisation` - Multi-tenant organizations
- `Client` - Customer records
- `Agreement` - Insurance financing contracts
- `Policy` - Insurance policies
- `Instalment` - Payment schedules
- `AuditLog` - Activity tracking

**Key Relationships:**
- Organisation → Clients (1:many)
- Client → Agreements (1:many)
- Agreement → Instalments (1:many)
- Agreement → Policy (many:1)

## 🚀 **Key Features**

1. **Multi-tenant Architecture**: Organisation-scoped data
2. **Role-based Access**: BROKER, CUSTOMER, INTERNAL roles
3. **Pagination**: Consistent across all list endpoints
4. **Audit Logging**: Track all changes
5. **Demo Mode**: Hardcoded headers for development
6. **Type Safety**: TypeScript frontend + Pydantic schemas

## 🔧 **Development Setup**

**Backend:**
- FastAPI on port 8000/3001
- PostgreSQL database
- SQLAlchemy ORM

**Frontend:**
- React + Vite
- TypeScript
- Tailwind CSS
- React Router

## 📁 **File Structure Reference**

### Backend
```
server/
├── main.py                 # FastAPI app entry point
├── models.py              # Database models
├── schemas.py             # Pydantic schemas
├── database.py            # Database connection
├── middleware/
│   ├── auth.py            # Authentication middleware
│   └── rbac.py            # Role-based access control
└── routers/
    ├── agreements.py      # Agreement endpoints
    ├── clients.py         # Client endpoints
    ├── dashboard.py       # Dashboard endpoints
    ├── policies.py        # Policy endpoints
    └── proposals.py       # Proposal endpoints
```

### Frontend
```
src/
├── lib/api/
│   ├── client.ts          # Broker API client
│   └── proposals.ts       # Customer API client
├── hooks/
│   ├── useAuth.ts         # Authentication hook
│   ├── useBrokerDashboard.ts
│   ├── useAgreements.ts
│   └── useClients.ts
├── pages/
│   ├── broker/            # Broker interface pages
│   └── customer/          # Customer interface pages
└── components/            # Reusable UI components
```

## 🔍 **API Endpoints Reference**

### Broker APIs (Port 3001)
- `GET /api/broker/dashboard` - Dashboard statistics
- `GET /api/broker/clients` - List clients with search/pagination
- `GET /api/broker/clients/{id}` - Get specific client
- `POST /api/broker/clients` - Create new client
- `GET /api/broker/agreements` - List agreements with filters
- `GET /api/broker/agreements/{id}` - Get specific agreement
- `POST /api/broker/agreements` - Create new agreement
- `POST /api/broker/agreements/{id}/propose` - Propose agreement
- `POST /api/broker/policies` - Create policy
- `GET /api/broker/policies/{id}` - Get specific policy

### Customer APIs (Port 8000)
- `GET /api/customer/proposals` - List proposals with search
- `GET /api/customer/proposals/{id}` - Get specific proposal
- `POST /api/customer/proposals/{id}/accept` - Accept proposal
- `POST /api/customer/proposals/{id}/decline` - Decline proposal

## 🎯 **Common Patterns**

### Error Handling
- Frontend hooks return `{ data, isLoading, error }` pattern
- Backend uses HTTP status codes and structured error responses
- API clients throw errors that hooks catch and expose

### Data Transformation
- Backend uses snake_case (database convention)
- Frontend uses camelCase (JavaScript convention)
- Customer APIs transform data in the API layer
- Broker APIs use consistent naming

### State Management
- React hooks for local component state
- Custom hooks for API state management
- No global state management (Redux/Zustand) - kept simple

The architecture follows a clean separation of concerns with the frontend hooks acting as a data layer abstraction over the API clients, making it easy to manage state and handle loading/error states consistently across the application.

## 🧠 **Development Notes & Patterns**

### **UUID Field Validators**
**CRITICAL**: When creating `@field_validator` for UUID fields, always convert UUID objects to strings.

**Pattern:**
```python
@field_validator('id', 'organisation_id', mode='before')
@classmethod
def convert_uuid_to_str(cls, v):
    if isinstance(v, uuid.UUID):
        return str(v)
    return v
```

**Key Points:**
- Use `mode='before'` to run before Pydantic validation
- Always check `isinstance(v, uuid.UUID)` before conversion
- Return original value if not a UUID
- UUIDs are stored as Python objects in the database but need to be strings for API responses
- Include `json_encoders = {uuid.UUID: str}` in Config class

**Fields that typically need UUID validation:**
- `id` (primary keys)
- `organisation_id`
- `client_id`
- `policy_id`
- `agreement_id`
- `broker_id`

### **Schema Configuration Pattern**
Every response schema with UUID fields should include:
```python
class Config:
    from_attributes = True
    json_encoders = {
        uuid.UUID: str
    }
```

### **Database UUID Generation**
- Use `generate_uuid()` function from `models.py` for default values
- Database stores UUIDs as strings in String columns
- Supabase migrations use `UUID` type with `gen_random_uuid()`