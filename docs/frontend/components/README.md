# Components

Below are key public components with props and usage examples.

## UI Primitives

### Button

```startLine:endLine:filepath
1:48:src/components/ui/button.tsx
```

Usage:

```tsx
import { Button } from '@/components/ui/button';

<Button variant="secondary" size="sm">Click me</Button>
```

### Input

```startLine:endLine:filepath
1:22:src/components/ui/input.tsx
```

Usage:

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Email" type="email" />
```

### Dialog

```startLine:endLine:filepath
1:95:src/components/ui/dialog.tsx
```

Usage:

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content here
  </DialogContent>
</Dialog>
```

## Domain Components

### PlanCard

```startLine:endLine:filepath
11:14:src/components/customer/PlanCard.tsx
```

```startLine:endLine:filepath
16:29:src/components/customer/PlanCard.tsx
```

Usage:

```tsx
import { PlanCard } from '@/components/customer/PlanCard';
import type { Agreement } from '@/lib/demo/fixtures';

const agreement: Agreement = /* ... */;
<PlanCard agreement={agreement} />
```

### RepaymentPlanner

```startLine:endLine:filepath
20:24:src/components/customer/RepaymentPlanner.tsx
```

Usage:

```tsx
import { RepaymentPlanner } from '@/components/customer/RepaymentPlanner';
import type { Agreement } from '@/lib/demo/fixtures';

<RepaymentPlanner agreement={agreement} />
```

### ArrearsBanner

```startLine:endLine:filepath
5:10:src/components/dashboard/ArrearsBanner.tsx
```

Usage:

```tsx
<ArrearsBanner isInArrears={true} />
```

### PaymentHeroCard

```startLine:endLine:filepath
6:12:src/components/dashboard/PaymentHeroCard.tsx
```

Usage:

```tsx
import { mockPayments } from '@/lib/fixtures';

<PaymentHeroCard nextPayment={mockPayments[0]} daysUntil={7} />
```

### PaymentProgressCard

```startLine:endLine:filepath
6:12:src/components/dashboard/PaymentProgressCard.tsx
```

Usage:

```tsx
<PaymentProgressCard />
```

### ProposalCard

```startLine:endLine:filepath
7:10:src/components/proposals/ProposalCard.tsx
```

Usage:

```tsx
import { ProposalCard } from '@/components/proposals/ProposalCard';
import type { Proposal } from '@/types/proposals';

<ProposalCard proposal={proposal} onClick={(p) => console.log(p)} />
```

### ProposalSummary

```startLine:endLine:filepath
7:11:src/components/proposals/ProposalSummary.tsx
```

Usage:

```tsx
import { ProposalSummary } from '@/components/proposals/ProposalSummary';
import type { ProposalTerms } from '@/types/proposals';

<ProposalSummary terms={terms} customSchedule={false} />
```
