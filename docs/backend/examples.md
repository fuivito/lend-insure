# Examples

## Authenticated request (development headers)

```bash
curl -s 'http://localhost:8000/api/broker/clients?page=1&limit=10' \
  -H 'X-User-Id: 650e8400-e29b-41d4-a716-446655440000' \
  -H 'X-Org-Id: 550e8400-e29b-41d4-a716-446655440000' \
  -H 'X-Role: BROKER'
```

## Create Client

```bash
curl -s -X POST 'http://localhost:8000/api/broker/clients' \
  -H 'Content-Type: application/json' \
  -H 'X-User-Id: 650e8400-e29b-41d4-a716-446655440000' \
  -H 'X-Org-Id: 550e8400-e29b-41d4-a716-446655440000' \
  -H 'X-Role: BROKER' \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com"
  }'
```

## Create Agreement

```bash
curl -s -X POST 'http://localhost:8000/api/broker/agreements' \
  -H 'Content-Type: application/json' \
  -H 'X-User-Id: 650e8400-e29b-41d4-a716-446655440000' \
  -H 'X-Org-Id: 550e8400-e29b-41d4-a716-446655440000' \
  -H 'X-Role: BROKER' \
  -d '{
    "client_id": "<client-id>",
    "policy_id": "<policy-id>",
    "principal_amount": 1200.00,
    "apr_bps": 1299,
    "term_months": 12
  }'
```

## Customer proposals (frontend dev headers)

```ts
import { fetchProposals, acceptProposal } from '@/lib/api/proposals';

const list = await fetchProposals('motor');
await acceptProposal(list[0].id);
```
