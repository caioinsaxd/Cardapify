import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiError {
  message: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  }

  private async handleResponse<T>(response: { data: T }): Promise<T> {
    return response.data;
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error) && error.response?.data) {
      const apiError: ApiError = {
        message: error.response.data.message || 'Request failed',
        statusCode: error.response.status,
      };
      throw apiError;
    }
    throw { message: 'Network error' };
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const response = await this.client.post<{ token: string; user: User }>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      if (requiresAuth) {
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      const response = await this.client.get<T>(endpoint, { headers });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async post<T>(endpoint: string, body: unknown, requiresAuth = true): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      if (requiresAuth) {
        const token = await this.getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      const response = await this.client.post<T>(endpoint, body, { headers });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async postPublic<T>(endpoint: string, body: unknown): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, body);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export interface User {
  id: string;
  email: string;
  role: string;
  restaurantId: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface OrderSettings {
  requireTableNumber: boolean;
  minimumOrderAmount: number;
  autoConfirmOrders: boolean;
  preparationTimeMinutes: number;
  allowObservations: boolean;
}

export interface BusinessHours {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  description: string | null;
}

export interface MenuData {
  restaurant: Restaurant;
  orderSettings: OrderSettings;
  businessHours: BusinessHours[];
  categories: Category[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderResponse {
  orderId: string;
  tableNumber: number;
  status: string;
  total: string;
  estimatedTime?: number;
}

export const api = new ApiClient();
