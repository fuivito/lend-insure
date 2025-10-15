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

interface UseAgreementResult {
  agreement: Agreement | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAgreement(id: string | undefined): UseAgreementResult {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreement = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getAgreement(id);
      setAgreement(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agreement');
      console.error('Error fetching agreement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreement();
  }, [id]);

  return {
    agreement,
    isLoading,
    error,
    refetch: fetchAgreement,
  };
}
