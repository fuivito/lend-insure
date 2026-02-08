import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface RecentClient {
  id: string;
  name: string;
  email: string;
  created_at: string | null;
}

interface RecentAgreement {
  id: string;
  client_name: string;
  principal_amount_pennies: number;
  status: string;
  created_at: string | null;
}

interface ProposedAgreement {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  principal_amount_pennies: number;
  created_at: string | null;
}

interface DashboardStats {
  total_clients: number;
  total_agreements: number;
  draft_agreements: number;
  proposed_agreements: number;
  signed_agreements: number;
  active_agreements: number;
  total_financed_pennies: number;
  recent_clients: RecentClient[];
  recent_agreements: RecentAgreement[];
  proposed_agreements_list: ProposedAgreement[];
}

interface UseBrokerDashboardResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBrokerDashboard(): UseBrokerDashboardResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getDashboard();
      setStats(response as DashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
