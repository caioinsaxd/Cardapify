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

export interface MenuData {
  restaurant: Restaurant;
  orderSettings: OrderSettings;
  businessHours: BusinessHours[];
  categories: Category[];
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
