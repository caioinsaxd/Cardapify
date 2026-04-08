'use client';

import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export interface PageStyling {
  background?: {
    type: string;
    solidColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
  };
  colors?: {
    primary?: string;
    text?: string;
    textSecondary?: string;
    surface?: string;
    border?: string;
  };
  typography?: {
    fontFamily?: string;
    baseSize?: number;
  };
  layout?: {
    maxWidth?: number;
    padding?: number;
    cardBorderRadius?: number;
  };
  header?: {
    show?: boolean;
    style?: string;
  };
  footer?: {
    show?: boolean;
    showPoweredBy?: boolean;
  };
}

export interface Tab {
  id: string;
  name: string;
  icon?: string;
  sectionIds: string[];
  isDefault: boolean;
}

export interface Section {
  id: string;
  type: string;
  order: number;
  styling?: {
    backgroundColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
  };
  config?: {
    categoryId?: string;
    productIds?: string[];
    columns?: number;
    cardConfig?: {
      image?: { show: boolean };
      name?: { show: boolean };
      description?: { show: boolean };
      price?: { show: boolean };
      addButton?: { show: boolean };
    };
    title?: string;
    content?: string;
    alignment?: string;
    imageUrl?: string;
    overlayOpacity?: number;
    height?: number;
  };
  products?: Product[];
  category?: { id: string; name: string };
}

export interface PageInfo {
  id: string;
  name: string;
  useTabs: boolean;
  tabs: Tab[];
  styling: PageStyling;
}

export interface MenuData {
  restaurant: Restaurant;
  orderSettings: OrderSettings;
  businessHours: BusinessHours[];
  categories?: Category[];
  sections?: Section[];
  page?: PageInfo;
  isPageBuilder?: boolean;
}

export function usePublicMenu(restaurantId: string) {
  return useQuery<MenuData>({
    queryKey: ['public-menu', restaurantId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/public/${restaurantId}/menu`);
      if (!response.ok) {
        throw new Error('Failed to load menu');
      }
      return response.json();
    },
    enabled: !!restaurantId,
  });
}
