# API Client

`src/lib/api/client.ts` exposes a minimal API client for broker-side resources. It uses dev headers by default.

```startLine:endLine:filepath
1:116:src/lib/api/client.ts
```

## Usage

```ts
import { apiClient } from '@/lib/api/client';

// List clients (paginated)
const { data, pagination } = await apiClient.getClients({ search: 'john', page: 1, limit: 20 });

// Create a client
const created = await apiClient.createClient({
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
});

// Agreements
const agreements = await apiClient.getAgreements({ status: 'ACTIVE' });
const agreement = await apiClient.getAgreement('agreement-id');
await apiClient.proposeAgreement('agreement-id');

// Policies
const policy = await apiClient.getPolicy('policy-id');
```

## Customer Proposal helpers

`src/lib/api/proposals.ts` provides `fetchProposals`, `fetchProposalById`, `acceptProposal`, `declineProposal` using customer headers in dev.

```startLine:endLine:filepath
1:100:src/lib/api/proposals.ts
```
