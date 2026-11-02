import { ApiResponse } from '@crystalaid/types';

class ApiClient {
  private token: string | null = null;
  private guildId: string = '1100000000000000001';

  setAuth(token: string | null, guildId?: string) {
    this.token = token;
    if (guildId) this.guildId = guildId;
    if (token) {
      localStorage.setItem('crystalaid_token', token);
    } else {
      localStorage.removeItem('crystalaid_token');
    }
  }

  getStoredToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('crystalaid_token');
    }
    return this.token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    const token = this.getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('X-Guild-Id', this.guildId);

    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json: ApiResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        const errorMsg = json.error?.message || `HTTP ${response.status}: Request failed`;
        throw new Error(errorMsg);
      }

      return json.data as T;
    } catch (err: any) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const api = new ApiClient();
