const API_BASE_URL = 'http://localhost:3001';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    // Dev mode: Use demo headers
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Id': '650e8400-e29b-41d4-a716-446655440000', // Demo broker user
      'X-Org-Id': '550e8400-e29b-41d4-a716-446655440000', // Demo org
      'X-Role': 'BROKER',
    };

    const config: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...headers },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Clients
  async getClients(params?: { search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request<any>(`/api/broker/clients${query ? `?${query}` : ''}`);
  }

  async getClient(id: string) {
    return this.request<any>(`/api/broker/clients/${id}`);
  }

  async createClient(data: any) {
    return this.request<any>('/api/broker/clients', {
      method: 'POST',
      body: data,
    });
  }

  // Agreements
  async getAgreements(params?: { status?: string; client_id?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.client_id) searchParams.append('client_id', params.client_id);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return this.request<any>(`/api/broker/agreements${query ? `?${query}` : ''}`);
  }

  async getAgreement(id: string) {
    return this.request<any>(`/api/broker/agreements/${id}`);
  }

  async createAgreement(data: any) {
    return this.request<any>('/api/broker/agreements', {
      method: 'POST',
      body: data,
    });
  }

  async proposeAgreement(id: string) {
    return this.request<any>(`/api/broker/agreements/${id}/propose`, {
      method: 'POST',
    });
  }

  // Policies
  async createPolicy(data: any) {
    return this.request<any>('/api/broker/policies', {
      method: 'POST',
      body: data,
    });
  }

  async getPolicy(id: string) {
    return this.request<any>(`/api/broker/policies/${id}`);
  }

  // Dashboard
  async getDashboard() {
    return this.request<any>('/api/broker/dashboard');
  }
}

export const apiClient = new APIClient(API_BASE_URL);
