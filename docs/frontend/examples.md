# Examples

## Using `useToast`

```tsx
import { useToast } from '@/components/ui/use-toast';

export function Demo() {
  const { toast } = useToast();
  return (
    <button onClick={() => toast({ title: 'Hi', description: 'Example' })}>Toast</button>
  );
}
```

## Listing broker clients

```tsx
import { useClients } from '@/hooks/useClients';

export function Clients() {
  const { clients, isLoading, error } = useClients('john', 1, 10);
  if (isLoading) return 'Loading';
  if (error) return `Error: ${error}`;
  return (
    <ul>
      {clients.map(c => (
        <li key={c.id}>{c.first_name} {c.last_name}</li>
      ))}
    </ul>
  );
}
```

## Showing a proposal card

```tsx
import { ProposalCard } from '@/components/proposals/ProposalCard';
import type { Proposal } from '@/types/proposals';

function ProposalsList({ proposals, onSelect }: { proposals: Proposal[]; onSelect: (p: Proposal) => void; }) {
  return (
    <div className="grid gap-3">
      {proposals.map(p => (
        <ProposalCard key={p.id} proposal={p} onClick={onSelect} />)
      )}
    </div>
  );
}
```
