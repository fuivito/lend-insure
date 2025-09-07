import { useState, useEffect, useMemo } from 'react';
import { mockAgreements, type Agreement } from './fixtures';

export interface AgreementStats {
  activeCount: number;
  totalOutstanding: number;
  nextPayment: {
    id: string;
    amount: number;
    date: string;
  } | null;
  arrearsCount: number;
}

export interface UseAgreementsResult {
  data: Agreement[];
  isLoading: boolean;
  error: Error | null;
  stats: AgreementStats;
}

export interface AgreementFilters {
  filter: 'all' | 'active' | 'arrears' | 'completed';
  sort: 'nextDue' | 'highestOutstanding' | 'recentlyCreated';
  q: string;
}

export function useAgreements(): UseAgreementsResult {
  const [data, setData] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call with loading delay
    const loadData = async () => {
      try {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setData(mockAgreements);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => getStats(data), [data]);

  return { data, isLoading, error, stats };
}

export function getStats(agreements: Agreement[]): AgreementStats {
  const activeAgreements = agreements.filter(a => a.status === 'ACTIVE' || a.status === 'ARREARS');
  
  const activeCount = agreements.filter(a => a.status === 'ACTIVE').length;
  const totalOutstanding = activeAgreements.reduce((sum, a) => sum + a.outstanding, 0);
  const arrearsCount = agreements.filter(a => a.arrears).length;

  // Find next payment (soonest due date)
  const upcomingPayments = activeAgreements
    .filter(a => a.nextDueDate)
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

  const nextPayment = upcomingPayments.length > 0 
    ? {
        id: upcomingPayments[0].id,
        amount: upcomingPayments[0].monthlyAmount,
        date: upcomingPayments[0].nextDueDate
      }
    : null;

  return {
    activeCount,
    totalOutstanding,
    nextPayment,
    arrearsCount
  };
}

export function filterAndSort(
  agreements: Agreement[], 
  filters: AgreementFilters
): Agreement[] {
  let filtered = [...agreements];

  // Apply status filter
  if (filters.filter === 'active') {
    filtered = filtered.filter(a => a.status === 'ACTIVE');
  } else if (filters.filter === 'arrears') {
    filtered = filtered.filter(a => a.status === 'ARREARS' || a.arrears);
  } else if (filters.filter === 'completed') {
    filtered = filtered.filter(a => a.status === 'COMPLETED');
  }

  // Apply search filter
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(a => 
      a.policyRef.toLowerCase().includes(query) ||
      a.product.toLowerCase().includes(query) ||
      a.insurer.toLowerCase().includes(query) ||
      a.broker.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'nextDue':
        return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
      case 'highestOutstanding':
        return b.outstanding - a.outstanding;
      case 'recentlyCreated':
        // For demo, use policy ref as proxy for creation order
        return b.policyRef.localeCompare(a.policyRef);
      default:
        return 0;
    }
  });

  return filtered;
}