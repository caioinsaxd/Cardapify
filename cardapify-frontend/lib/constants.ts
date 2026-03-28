import { LucideIcon } from 'lucide-react';
import { Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];

export interface StatusConfig {
  label: string;
  variant: 'success' | 'warning' | 'info' | 'secondary' | 'destructive';
  color: string;
  icon: LucideIcon;
}

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING: { label: 'Pendente', variant: 'warning', color: 'text-yellow-500', icon: Clock },
  PAID: { label: 'Pago', variant: 'info', color: 'text-blue-500', icon: CheckCircle },
  PREPARING: { label: 'Preparando', variant: 'warning', color: 'text-orange-500', icon: ChefHat },
  READY: { label: 'Pronto', variant: 'success', color: 'text-green-500', icon: CheckCircle },
  COMPLETED: { label: 'Concluído', variant: 'secondary', color: 'text-slate-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', variant: 'destructive', color: 'text-red-500', icon: XCircle },
};

export const ORDER_STATUS_LIST: OrderStatus[] = [
  'PENDING',
  'PAID', 
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
];
