# Flexra Auth, Tenancy & RLS Architecture

> **Purpose**: This document describes the authentication, authorization, and multi-tenancy system for Flexra. It is designed to be readable by both humans and LLMs working on this codebase.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Database Schema](#database-schema)
4. [Role Hierarchy](#role-hierarchy)
5. [Auth Flows](#auth-flows)
6. [API Endpoints](#api-endpoints)
7. [RLS (Row-Level Security)](#rls-row-level-security)
8. [Frontend Integration](#frontend-integration)
9. [Environment Variables](#environment-variables)
10. [File Locations](#file-locations)

---

## Overview

Flexra uses **Supabase Auth** for authentication with a **membership-based** authorization model.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Supabase Auth  │────►│  users table    │────►│  memberships    │
│  (auth.users)   │     │  (public.users) │     │  table          │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  organisations  │
                                                └─────────────────┘
```

**Key concept**: A user authenticates via Supabase, which gives them a JWT. The backend verifies this JWT and looks up their `membership` to determine which organisation they belong to and what role they have.

---

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Single source of truth** | The `memberships` table is the ONLY source for authorization decisions |
| **One user = One org** | Users can only belong to ONE organisation (enforced by `UNIQUE(user_id)` constraint) |
| **RLS as final boundary** | Row-Level Security in PostgreSQL is the last line of defense |
| **No service role for normal API** | Backend uses user's JWT for RLS-protected queries, service role only for auth operations |

---

## Database Schema

### Entity Relationship

```
auth.users (Supabase)
     │
     │ 1:1
     ▼
┌─────────────────────────────────────────────────────────────┐
│                        users                                 │
├─────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                            │
│ auth_user_id    UUID UNIQUE NOT NULL → auth.users(id)       │
│ email           TEXT NOT NULL                               │
│ name            TEXT NOT NULL                               │
│ created_at      TIMESTAMPTZ                                 │
│ updated_at      TIMESTAMPTZ                                 │
└─────────────────────────────────────────────────────────────┘
     │
     │ 1:1 (UNIQUE constraint on user_id)
     ▼
┌─────────────────────────────────────────────────────────────┐
│                      memberships                             │
├─────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                            │
│ organisation_id UUID NOT NULL → organisations(id)           │
│ user_id         UUID NOT NULL UNIQUE → users(id)            │
│ role            membership_role_enum (OWNER/ADMIN/MEMBER/   │
│                                       READ_ONLY)            │
│ status          membership_status_enum (INVITED/ACTIVE/     │
│                                         SUSPENDED/REMOVED)  │
│ created_at      TIMESTAMPTZ                                 │
│ updated_at      TIMESTAMPTZ                                 │
└─────────────────────────────────────────────────────────────┘
     │
     │ N:1
     ▼
┌─────────────────────────────────────────────────────────────┐
│                     organisations                            │
├─────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                            │
│ name            TEXT NOT NULL                               │
│ org_type        org_type_enum (BROKER/MGA/INSURER/          │
│                                FLEXRA_INTERNAL)             │
│ status          organisation_status_enum                    │
│ created_at      TIMESTAMPTZ                                 │
│ updated_at      TIMESTAMPTZ                                 │
└─────────────────────────────────────────────────────────────┘
     │
     │ 1:N
     ▼
┌─────────────────────────────────────────────────────────────┐
│              clients, policies, agreements, etc.             │
│                  (all have organisation_id FK)               │
└─────────────────────────────────────────────────────────────┘
```

### Invitation System

```
┌─────────────────────────────────────────────────────────────┐
│                  membership_invitations                      │
├─────────────────────────────────────────────────────────────┤
│ id              UUID PRIMARY KEY                            │
│ organisation_id UUID NOT NULL → organisations(id)           │
│ email           TEXT NOT NULL                               │
│ role            membership_role_enum                        │
│ token_hash      TEXT NOT NULL (SHA256 of invitation token)  │
│ expires_at      TIMESTAMPTZ NOT NULL                        │
│ accepted_at     TIMESTAMPTZ (NULL until redeemed)           │
│ created_at      TIMESTAMPTZ                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Role Hierarchy

```
OWNER (level 3)
  │
  ├── Can do everything
  ├── Transfer ownership
  ├── Delete organisation
  │
  ▼
ADMIN (level 2)
  │
  ├── Manage members (invite, update roles, remove)
  ├── Manage invitations
  ├── Delete clients
  ├── All MEMBER permissions
  │
  ▼
MEMBER (level 1)
  │
  ├── Create/update clients, policies, agreements
  ├── View all org data
  │
  ▼
READ_ONLY (level 0)
  │
  └── View all org data (no writes)
```

### Permission Matrix

| Action | READ_ONLY | MEMBER | ADMIN | OWNER |
|--------|-----------|--------|-------|-------|
| View org data | ✓ | ✓ | ✓ | ✓ |
| Create/update clients | ✗ | ✓ | ✓ | ✓ |
| Create/update agreements | ✗ | ✓ | ✓ | ✓ |
| Delete clients | ✗ | ✗ | ✓ | ✓ |
| Invite members | ✗ | ✗ | ✓ | ✓ |
| Update member roles | ✗ | ✗ | ✓ | ✓ |
| Remove members | ✗ | ✗ | ✓ | ✓ |
| Promote to ADMIN | ✗ | ✗ | ✗ | ✓ |
| Transfer ownership | ✗ | ✗ | ✗ | ✓ |

---

## Auth Flows

### Flow A: New User Creates Organisation

```
┌──────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│  User    │    │   Frontend   │    │  Supabase Auth  │    │   Backend    │
└────┬─────┘    └──────┬───────┘    └────────┬────────┘    └──────┬───────┘
     │                 │                     │                    │
     │  1. Click       │                     │                    │
     │  "Sign Up"      │                     │                    │
     │────────────────►│                     │                    │
     │                 │                     │                    │
     │                 │  2. supabase.auth   │                    │
     │                 │     .signUp()       │                    │
     │                 │────────────────────►│                    │
     │                 │                     │                    │
     │                 │  3. Returns session │                    │
     │                 │     with JWT        │                    │
     │                 │◄────────────────────│                    │
     │                 │                     │                    │
     │  4. Redirect to │                     │                    │
     │  /create-org    │                     │                    │
     │◄────────────────│                     │                    │
     │                 │                     │                    │
     │  5. Enter org   │                     │                    │
     │  name & type    │                     │                    │
     │────────────────►│                     │                    │
     │                 │                     │                    │
     │                 │  6. POST /api/auth/signup-with-org      │
     │                 │     Authorization: Bearer <JWT>         │
     │                 │     { name: "Acme Ltd", org_type: "BROKER" }
     │                 │─────────────────────────────────────────►│
     │                 │                     │                    │
     │                 │                     │      7. Verify JWT │
     │                 │                     │      8. Create org │
     │                 │                     │      9. Create user│
     │                 │                     │     10. Create     │
     │                 │                     │         membership │
     │                 │                     │         (OWNER)    │
     │                 │                     │                    │
     │                 │ 11. Returns user, org, membership       │
     │                 │◄─────────────────────────────────────────│
     │                 │                     │                    │
     │  12. Redirect   │                     │                    │
     │  to dashboard   │                     │                    │
     │◄────────────────│                     │                    │
```

### Flow B: Admin Invites User

```
STEP 1: Admin creates invitation
─────────────────────────────────
Admin calls: POST /api/broker/memberships/invite
             { email: "new@user.com", role: "MEMBER" }

Backend:
  1. Generates secure random token
  2. Stores SHA256(token) in membership_invitations
  3. Returns invite URL (in dev): /accept-invite?token=abc123

STEP 2: User receives invitation (email - not implemented yet)
─────────────────────────────────────────────────────────────

STEP 3: User redeems invitation
───────────────────────────────
User visits: /accept-invite?token=abc123

If not logged in:
  → Redirect to /login or /signup

If logged in:
  → Frontend calls: POST /api/auth/redeem-invitation
                    { token: "abc123" }

Backend:
  1. Verifies JWT
  2. Hashes token, finds invitation
  3. Checks: not expired, not already accepted
  4. CRITICAL: Checks user has NO existing membership
  5. Creates user record (if not exists)
  6. Creates membership with invited role
  7. Marks invitation as accepted
```

### Flow C: Returning User Login

```
┌──────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│  User    │    │   Frontend   │    │  Supabase Auth  │    │   Backend    │
└────┬─────┘    └──────┬───────┘    └────────┬────────┘    └──────┬───────┘
     │                 │                     │                    │
     │  1. Login       │                     │                    │
     │────────────────►│                     │                    │
     │                 │  2. signIn()        │                    │
     │                 │────────────────────►│                    │
     │                 │  3. JWT             │                    │
     │                 │◄────────────────────│                    │
     │                 │                     │                    │
     │                 │  4. GET /api/auth/me                    │
     │                 │─────────────────────────────────────────►│
     │                 │                     │                    │
     │                 │                     │  5. Verify JWT     │
     │                 │                     │  6. Lookup user +  │
     │                 │                     │     membership     │
     │                 │                     │                    │
     │                 │  7. { user, org, membership }           │
     │                 │◄─────────────────────────────────────────│
     │                 │                     │                    │
     │  8. Dashboard   │                     │                    │
     │◄────────────────│                     │                    │
```

---

## API Endpoints

### Auth Endpoints (`/api/auth/*`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/signup-with-org` | JWT (no membership) | Create org and become OWNER |
| POST | `/api/auth/redeem-invitation` | JWT (no membership) | Join org via invitation token |
| GET | `/api/auth/me` | JWT + membership | Get current user, org, membership |
| GET | `/api/auth/check-membership` | JWT (no membership) | Check if user has membership |

### Membership Endpoints (`/api/broker/memberships/*`)

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/broker/memberships` | Any member | List all org members |
| POST | `/api/broker/memberships/invite` | ADMIN+ | Invite new member |
| GET | `/api/broker/memberships/{id}` | Any member | Get specific membership |
| PUT | `/api/broker/memberships/{id}` | ADMIN+ | Update role/status |
| DELETE | `/api/broker/memberships/{id}` | ADMIN+ | Remove member |
| GET | `/api/broker/memberships/invitations` | ADMIN+ | List pending invitations |
| DELETE | `/api/broker/memberships/invitations/{id}` | ADMIN+ | Cancel invitation |
| POST | `/api/broker/memberships/transfer-ownership` | OWNER | Transfer ownership |

### Organisation Endpoints (`/api/broker/organisation`)

| Method | Endpoint | Role Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/broker/organisation` | Any member | Get organisation details |
| PUT | `/api/broker/organisation` | ADMIN+ | Update organisation |

---

## RLS (Row-Level Security)

### Helper Functions

These functions are used in RLS policies:

```sql
-- Get current user's org_id
public.current_user_org_id() → UUID

-- Check if user is active member of org
public.is_active_member_of_org(org_id UUID) → BOOLEAN

-- Get user's role in org
public.current_role_in_org(org_id UUID) → membership_role_enum

-- Check if user is OWNER or ADMIN
public.is_admin_in_org(org_id UUID) → BOOLEAN

-- Check if user is MEMBER or above
public.is_member_or_above_in_org(org_id UUID) → BOOLEAN
```

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | Own record | - | Own record | - |
| organisations | Active member | - | Admin only | - |
| memberships | Org members | Admin | Admin | Admin |
| membership_invitations | Admin | Admin | Admin | Admin |
| clients | Active member | MEMBER+ | MEMBER+ | Admin |
| policies | Active member | MEMBER+ | MEMBER+ | - |
| agreements | Active member | MEMBER+ | MEMBER+ | - |
| instalments | Via agreement | MEMBER+ | MEMBER+ | - |
| audit_logs | Active member | - | - | - |

---

## Frontend Integration

### Auth Context

Located at: `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextValue {
  // State
  session: Session | null;           // Supabase session
  supabaseUser: SupabaseUser | null; // Supabase user
  user: User | null;                 // App user (from public.users)
  organisation: Organisation | null;
  membership: Membership | null;
  isLoading: boolean;
  hasMembership: boolean;
  hasPendingInvitation: boolean;

  // Actions
  signIn(email, password): Promise<{ error }>
  signUp(email, password): Promise<{ error }>
  signOut(): Promise<void>
  resetPassword(email): Promise<{ error }>
  createOrganisation(name, orgType): Promise<{ error }>
  redeemInvitation(token): Promise<{ error }>

  // Role checks
  isOwner: boolean;
  isAdmin: boolean;
  canWrite: boolean;
  canManageMembers: boolean;
}
```

### Protected Routes

```tsx
// Requires authentication + membership
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Requires specific role
<RequireAdmin>
  <MemberManagementPage />
</RequireAdmin>

// Requires minimum role
<RequireRole minimumRole="MEMBER">
  <CreateClientButton />
</RequireRole>
```

### API Client

Located at: `src/lib/api/client.ts`

The API client automatically:
1. Gets JWT from Supabase session
2. Adds `Authorization: Bearer <JWT>` header
3. Falls back to dev headers if no session (for dev mode)

---

## Environment Variables

### Backend (`server/.env`)

```bash
# Required
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

# Optional
JWT_SECRET=legacy-jwt-secret
ENVIRONMENT=development
INVITATION_EXPIRY_HOURS=72
INVITATION_BASE_URL=http://localhost:8080/accept-invite
```

### Frontend (`.env`)

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=http://localhost:3001
```

---

## File Locations

### Backend

```
server/
├── config.py                    # Environment variables
├── models.py                    # SQLAlchemy models (User, Membership, etc.)
├── schemas.py                   # Pydantic schemas
├── middleware/
│   ├── auth.py                  # JWT verification, AuthContext
│   └── rbac.py                  # Role checking utilities
├── routers/
│   ├── auth.py                  # /api/auth/* endpoints
│   ├── memberships.py           # /api/broker/memberships/* endpoints
│   └── organisations.py         # /api/broker/organisation endpoints
└── services/
    └── supabase.py              # Supabase client wrapper
```

### Frontend

```
src/
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── hooks/
│   ├── useAuth.ts               # Re-exports from AuthContext
│   └── useMembership.ts         # Membership management hooks
├── components/auth/
│   ├── ProtectedRoute.tsx       # Route guard
│   └── RequireRole.tsx          # Role-based rendering
├── pages/auth/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── CreateOrgPage.tsx
│   ├── AcceptInvitePage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
├── lib/api/
│   └── client.ts                # API client with JWT auth
└── integrations/supabase/
    └── client.ts                # Supabase client config
```

### Database

```
supabase/migrations/
└── 20260202120000_flexra_auth_schema.sql   # Full migration
```

---

## Common Operations (For LLMs)

### Adding a new protected endpoint

```python
# In a router file
from middleware.auth import AuthContext, get_auth_context
from middleware.rbac import require_admin, require_member

@router.post("/something")
async def create_something(
    data: SomeSchema,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db)
):
    # For MEMBER+ access:
    require_member(auth)

    # Use auth.organisation_id for queries
    something = Something(
        organisation_id=auth.organisation_id,
        ...
    )
```

### Adding role-protected UI

```tsx
import { RequireAdmin, RequireRole } from '@/components/auth/RequireRole';

// Only visible to ADMIN and OWNER
<RequireAdmin>
  <InviteMemberButton />
</RequireAdmin>

// Only visible to MEMBER and above
<RequireRole minimumRole="MEMBER">
  <CreateClientButton />
</RequireRole>

// Programmatic check
const { canWrite, isAdmin } = useAuth();
if (canWrite) { /* show button */ }
```

### Checking permissions in components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const {
    user,
    organisation,
    membership,
    isOwner,
    isAdmin,
    canWrite,
    canManageMembers
  } = useAuth();

  // Use these for conditional rendering
}
```

---

## Migration from Old System

The old system used `broker_users` and `user_roles` tables. The migration:

1. Creates new tables (`users`, `memberships`, `membership_invitations`)
2. Migrates existing `broker_users` with `auth_user_id` to new tables
3. Converts roles: `BROKER` → `MEMBER`, `BROKER_ADMIN` → `ADMIN`
4. Sets first admin per org as `OWNER`
5. Deprecates old tables (kept for rollback)

Old tables are NOT dropped - they're kept with deprecation comments for safety.
