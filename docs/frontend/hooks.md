# Hooks

## useAuth

Public hook for working with mock auth state.

```startLine:endLine:filepath
1:47:src/hooks/useAuth.ts
```

Example:

```tsx
import { useAuth } from '@/hooks/useAuth';

export function RoleSwitcher() {
  const { role, switchRole } = useAuth();
  return (
    <button onClick={() => switchRole(role === 'customer' ? 'broker' : 'customer')}>
      Switch to {role === 'customer' ? 'broker' : 'customer'}
    </button>
  );
}
```

## useClients

Paginated client listing.

```startLine:endLine:filepath
1:54:src/hooks/useClients.ts
```

Example:

```tsx
import { useClients } from '@/hooks/useClients';

export function ClientsTable() {
  const { clients, isLoading, error, totalPages, refetch } = useClients('john', 1, 20);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      <ul>
        {clients.map(c => (
          <li key={c.id}>{c.first_name} {c.last_name} - {c.email}</li>
        ))}
      </ul>
      <button onClick={refetch}>Reload</button>
      <div>Pages: {totalPages}</div>
    </div>
  );
}
```

## useAgreements

Agreement listing with filters.

```startLine:endLine:filepath
1:70:src/hooks/useAgreements.ts
```

Example:

```tsx
import { useAgreements } from '@/hooks/useAgreements';

export function AgreementsList() {
  const { agreements, isLoading } = useAgreements('ACTIVE');
  if (isLoading) return <div>Loading...</div>;
  return (
    <ul>
      {agreements.map(a => (
        <li key={a.id}>{a.id} — {a.status}</li>
      ))}
    </ul>
  );
}
```

## useToast

Toast state and helpers.

```startLine:endLine:filepath
1:187:src/hooks/use-toast.ts
```

Re-exported in `src/components/ui/use-toast.ts` for convenience.

```startLine:endLine:filepath
1:3:src/components/ui/use-toast.ts
```

Example:

```tsx
import { useToast } from '@/components/ui/use-toast';

export function SaveButton() {
  const { toast } = useToast();
  return (
    <button onClick={() => toast({ title: 'Saved', description: 'Your changes were saved.' })}>
      Save
    </button>
  );
}
```
