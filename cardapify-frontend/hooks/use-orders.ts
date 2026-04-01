'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  product: { name: string };
}

export interface Order {
  id: string;
  tableNumber: number;
  status: 'PENDING' | 'PAID' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  total: string;
  observations: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string;
  fetchOrders: () => Promise<void>;
  updateStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.get<Order[]>('/orders');
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pedidos');
      showToast('Erro ao carregar pedidos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const updateStatus = useCallback(async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      showToast('Status atualizado', 'success');
      await fetchOrders();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status', 'error');
      return false;
    }
  }, [fetchOrders, showToast]);

  return {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateStatus,
  };
}
