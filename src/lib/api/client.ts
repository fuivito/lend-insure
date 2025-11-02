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

      console.log(`API Response [${method} ${endpoint}]:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log(`API Success Response [${method} ${endpoint}]:`, responseData);
      return responseData;
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

  async updateClient(id: string, data: any) {
    return this.request<any>(`/api/broker/clients/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteClient(id: string) {
    return this.request<any>(`/api/broker/clients/${id}`, {
      method: 'DELETE',
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

  async deleteAgreement(id: string) {
    return this.request<any>(`/api/broker/agreements/${id}`, {
      method: 'DELETE',
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
