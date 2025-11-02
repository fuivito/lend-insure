# Endpoints

Routers and their base paths:

- `/api/broker/clients` — Broker - Clients
- `/api/broker/agreements` — Broker - Agreements
- `/api/broker/policies` — Broker - Policies
- `/api/broker/dashboard` — Broker - Dashboard
- `/health` — System health
- `/api/customer/proposals` — Customer proposals

Note: In `server/main.py` some routers are commented out. Enable as needed.

```startLine:endLine:filepath
20:30:server/main.py
```

## Clients

- `GET /api/broker/clients`
  - Query: `search?`, `page` (>=1), `limit` (1-100)
  - Returns `{ data: Client[], pagination: { page, limit, total, total_pages } }`
- `GET /api/broker/clients/{id}`
  - Returns a `Client`
- `POST /api/broker/clients`
  - Body: `ClientCreate`
  - Returns the created `Client`

```startLine:endLine:filepath
12:101:server/routers/clients.py
```

## Agreements

- `GET /api/broker/agreements`
  - Query: `status?`, `client_id?`, `page` (>=1), `limit` (1-100)
  - Returns `{ data: Agreement[], pagination: {...} }`
- `GET /api/broker/agreements/{id}`
  - Returns an `Agreement`
- `POST /api/broker/agreements`
  - Body: `AgreementCreate`
  - Returns created `Agreement` and creates instalments/events
- `POST /api/broker/agreements/{id}/propose`
  - Transitions `Agreement` DRAFT -> PROPOSED and logs event

```startLine:endLine:filepath
13:190:server/routers/agreements.py
```

## Policies

- `POST /api/broker/policies`
  - Body: `PolicyCreate`
  - Returns created `Policy`
- `GET /api/broker/policies/{id}`
  - Returns a `Policy`

```startLine:endLine:filepath
9:69:server/routers/policies.py
```

## Dashboard

- `GET /api/broker/dashboard`
  - Returns dashboard KPIs and recent events

```startLine:endLine:filepath
11:105:server/routers/dashboard.py
```

## Health

- `GET /health`
  - Returns `{ ok, ts, database }`

```startLine:endLine:filepath
7:22:server/routers/health.py
```

## Customer Proposals

- `GET /api/customer/proposals`
- `GET /api/customer/proposals/{proposal_id}`
- `POST /api/customer/proposals/{proposal_id}/accept`
- `POST /api/customer/proposals/{proposal_id}/decline`

```startLine:endLine:filepath
10:107:server/routers/proposals.py
```
