const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiError {
  message: string;
  statusCode?: number;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let error: ApiError = { message: 'Request failed' };
      try {
        const data = await response.json();
        error = { message: data.message || error.message, statusCode: response.status };
      } catch {
        error.statusCode = response.status;
      }
      throw error;
    }
    return response.json();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient();

// Types
export interface User {
  id: string;
  email: string;
  role: string;
  restaurantId: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  category: Category;
}

export interface OrderItem {
  id: string;
  quantity: number;
  product: { name: string };
}

export interface Order {
  id: string;
  tableNumber: number;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total: string;
  createdAt: string;
  items: OrderItem[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  todayOrders: Order[];
  todayRevenue: number;
  ordersByStatus: Record<string, number>;
}

export interface TemplateColorConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  accentColor: string;
}

export interface TemplateTypography {
  fontFamily: string;
  headingFontFamily: string;
  titleSize: number;
  descriptionSize: number;
  priceSize: number;
  sectionTitleSize: number;
  lineHeight: number;
}

export interface TemplateLayout {
  cardStyle: 'rounded' | 'square' | 'shadow' | 'bordered';
  borderRadius: number;
  cardSize: 'small' | 'medium' | 'large';
  cardSpacing: number;
  imageAspectRatio: '1:1' | '4:3' | '16:9' | 'auto';
  maxImageHeight: number;
}

export interface TemplateProductDisplay {
  showImage: boolean;
  showName: boolean;
  showDescription: boolean;
  showPrice: boolean;
  pricePosition: 'below' | 'overlay';
  showAddButton: boolean;
  addButtonStyle: 'icon' | 'text' | 'full';
  addButtonText: string;
  showBadges: boolean;
  badgePosition: 'top-left' | 'top-right' | 'overlay';
  maxDescriptionLines: number;
}

export interface TemplateHeader {
  showLogo: boolean;
  showRestaurantName: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showDescription: boolean;
  showBusinessHours: boolean;
  headerStyle: 'minimal' | 'full';
}

export interface TemplateFooter {
  showFooter: boolean;
  customText: string | null;
  showPoweredBy: boolean;
}

export interface TemplateMenuStructure {
  displayMode: 'tabs' | 'scroll' | 'list';
  sections: string[];
}

export interface TemplateConfig {
  colors: TemplateColorConfig;
  typography: TemplateTypography;
  layout: TemplateLayout;
  menuStructure: TemplateMenuStructure;
  productDisplay: TemplateProductDisplay;
  header: TemplateHeader;
  footer: TemplateFooter;
}

export interface TemplateSchedule {
  id: string;
  templateId: string;
  type: 'DAY_OF_WEEK' | 'TIME_RANGE' | 'DATE' | 'RECURRING';
  days: string[];
  startTime: string | null;
  endTime: string | null;
  date: string | null;
  pattern: string | null;
  priority: number;
  isActive: boolean;
}

export interface MenuTemplate {
  id: string;
  restaurantId: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  config: TemplateConfig;
  schedules: TemplateSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesResponse {
  userTemplates: MenuTemplate[];
  systemTemplates: MenuTemplate[];
}
