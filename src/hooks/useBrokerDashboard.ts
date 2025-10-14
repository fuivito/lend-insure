import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface DashboardStats {
  active_agreements: number;
  defaults: number;
  terminated: number;
  revenue_ytd: number;
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    agreement_id: string;
  }>;
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
      const response = await apiClient.request<any>('/api/broker/dashboard');
      setStats(response);
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
