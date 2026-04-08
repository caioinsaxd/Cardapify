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

//Types pro page builder
export enum SectionType {
  PRODUCT_GRID = 'PRODUCT_GRID',
  TEXT_BLOCK = 'TEXT_BLOCK',
  BANNER = 'BANNER',
  SPACER = 'SPACER',
}

export enum BackgroundType {
  SOLID = 'solid',
  GRADIENT = 'gradient',
  IMAGE = 'image',
}

export enum ImageAspectRatio {
  SQUARE = '1:1',
  FOUR_THREE = '4:3',
  SIXTEEN_NINE = '16:9',
}

export enum TextAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum BadgeType {
  POPULAR = 'popular',
  NEW = 'new',
  PROMO = 'promo',
  CUSTOM = 'custom',
}

export enum BadgePosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
}

export enum PricePosition {
  BELOW = 'below',
  OVERLAY = 'overlay',
}

export enum AddButtonStyle {
  ICON = 'icon',
  TEXT = 'text',
  FULL = 'full',
}

export enum HeaderStyle {
  MINIMAL = 'minimal',
  FULL = 'full',
  NONE = 'none',
}

export enum FontSize {
  SM = 'sm',
  BASE = 'base',
  LG = 'lg',
  XL = 'xl',
}

export enum FontWeight {
  NORMAL = 'normal',
  MEDIUM = 'medium',
  BOLD = 'bold',
}

export interface ImageConfig {
  show: boolean;
  aspectRatio: '1:1' | '4:3' | '16:9';
  borderRadius: number;
}

export interface TextStyleConfig {
  show: boolean;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  fontWeight?: 'normal' | 'medium' | 'bold';
}

export interface DescriptionConfig {
  show: boolean;
  maxLines?: number;
}

export interface PriceConfig {
  show: boolean;
  position?: 'below' | 'overlay';
  style?: 'normal' | 'highlighted';
}

export interface BadgeConfig {
  show: boolean;
  position?: 'top-left' | 'top-right';
  type?: 'popular' | 'new' | 'promo' | 'custom';
  customText?: string;
}

export interface AddButtonConfig {
  show: boolean;
  style?: 'icon' | 'text' | 'full';
  text: string;
}

export interface ProductCardConfig {
  image: ImageConfig;
  name: TextStyleConfig;
  description: DescriptionConfig;
  price: PriceConfig;
  badge: BadgeConfig;
  addButton: AddButtonConfig;
}

export interface ProductGridConfig {
  categoryId?: string;
  productIds?: string[];
  columns: number;
  cardConfig: ProductCardConfig;
}

export interface TextBlockConfig {
  title?: string;
  content: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface BannerConfig {
  imageUrl?: string;
  overlayColor?: string;
  overlayOpacity: number;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface SpacerConfig {
  height: number;
}

export interface SectionStyling {
  backgroundColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
}

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  styling?: SectionStyling;
  config?: ProductGridConfig | TextBlockConfig | BannerConfig | SpacerConfig;
}

export interface Tab {
  id: string;
  name: string;
  icon?: string;
  sectionIds: string[];
  isDefault: boolean;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image';
  solidColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  imageUrl?: string;
  imageOverlay?: string;
  imageOverlayOpacity?: number;
}

export interface ColorsConfig {
  primary: string;
  text: string;
  textSecondary: string;
  surface: string;
  border: string;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily?: string;
  baseSize: number;
  lineHeight: number;
}

export interface LayoutConfig {
  maxWidth: number;
  padding: number;
  cardBorderRadius: number;
}

export interface HeaderConfig {
  show: boolean;
  style?: 'minimal' | 'full' | 'none';
  showLogo?: boolean;
  showRestaurantName?: boolean;
  showBusinessHours?: boolean;
}

export interface FooterConfig {
  show: boolean;
  text?: string;
  showPoweredBy?: boolean;
}

export interface PageStyling {
  background: BackgroundConfig;
  colors: ColorsConfig;
  typography: TypographyConfig;
  layout: LayoutConfig;
  header?: HeaderConfig;
  footer?: FooterConfig;
}

export interface MenuPage {
  id: string;
  restaurantId: string;
  name: string;
  isActive: boolean;
  useTabs: boolean;
  tabs?: Tab[];
  sections?: Section[];
  styling?: PageStyling;
  createdAt: string;
  updatedAt: string;
}

export interface MenuPageWithProducts extends MenuPage {
  sections: (Section & { products?: Product[]; category?: Category })[];
  categories: Category[];
}
