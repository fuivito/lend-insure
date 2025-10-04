import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Agreement {
  id: string;
  client_id: string;
  policy_id: string;
  principal_amount_pennies: number;
  apr_bps: number;
  term_months: number;
  broker_fee_bps: number;
  status: string;
  created_at: string;
  signed_at?: string;
  activated_at?: string;
}

interface UseAgreementsResult {
  agreements: Agreement[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  refetch: () => void;
}

export function useAgreements(
  status?: string,
  clientId?: string,
  page: number = 1,
  limit: number = 20
): UseAgreementsResult {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgreements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getAgreements({
        status,
        client_id: clientId,
        page,
        limit,
      });
      setAgreements(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agreements');
      console.error('Error fetching agreements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [status, clientId, page, limit]);

  return {
    agreements,
    isLoading,
    error,
    totalPages,
    refetch: fetchAgreements,
  };
}
