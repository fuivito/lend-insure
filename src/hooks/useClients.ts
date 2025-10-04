import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface UseClientsResult {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  refetch: () => void;
}

export function useClients(search: string = '', page: number = 1, limit: number = 20): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getClients({ search, page, limit });
      setClients(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, page, limit]);

  return {
    clients,
    isLoading,
    error,
    totalPages,
    refetch: fetchClients,
  };
}
