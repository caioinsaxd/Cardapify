'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Category, Product, Order } from '@/lib/api';
import { OrderStatus, ORDER_STATUSES } from '@/lib/constants';

interface DashboardData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  todayOrders: Order[];
  todayRevenue: number;
  ordersByStatus: Record<string, number>;
}

export function useDashboard() {
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [categories, products, orders] = await Promise.all([
        api.get<Category[]>('/categories'),
        api.get<Product[]>('/products'),
        api.get<Order[]>('/orders'),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(
        (o) => new Date(o.createdAt) >= today && o.status !== ORDER_STATUSES.CANCELLED
      );

      const todayRevenue = todayOrders.reduce(
        (sum, o) => sum + Number(o.total),
        0
      );

      const ordersByStatus: Record<string, number> = {};
      todayOrders.forEach((o) => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      });

      return {
        categories,
        products,
        orders,
        todayOrders,
        todayRevenue,
        ordersByStatus,
      };
    },
  });

  return {
    data,
    isLoading,
    isError,
    refetch,
  };
}
