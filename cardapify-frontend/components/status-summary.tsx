'use client';

import { Clock, CheckCircle, ChefHat, XCircle } from 'lucide-react';
import { STATUS_CONFIG, OrderStatus, ORDER_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusSummaryProps {
  ordersByStatus: Record<string, number>;
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  PENDING: Clock,
  PAID: CheckCircle,
  PREPARING: ChefHat,
  READY: CheckCircle,
  CANCELLED: XCircle,
};

const STATUS_ORDER = ['PENDING', 'PAID', 'PREPARING', 'READY', 'CANCELLED'];

export function StatusSummary({ ordersByStatus }: StatusSummaryProps) {
  return (
    <div className="space-y-4">
      {STATUS_ORDER.map((status) => {
        const config = STATUS_CONFIG[status as OrderStatus];
        if (!config) return null;
        
        const Icon = STATUS_ICONS[status];
        const count = ordersByStatus[status] || 0;

        return (
          <div key={status} className="flex items-center justify-between">
            <div className={cn('flex items-center gap-2', config.color)}>
              <Icon className="h-4 w-4" />
              <span className="text-sm text-slate-600">{config.label}</span>
            </div>
            <span className="font-semibold">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
