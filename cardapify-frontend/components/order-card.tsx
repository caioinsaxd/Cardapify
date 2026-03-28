'use client';

import { Order } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG, OrderStatus } from '@/lib/constants';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const status = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <span className="text-sm font-semibold text-slate-600">
            {order.tableNumber}
          </span>
        </div>
        <div>
          <p className="font-medium text-slate-900">Mesa {order.tableNumber}</p>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <Clock className="h-3 w-3" />
            {order.items.length} itens • {getRelativeTime(order.createdAt)} atrás
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        <p className="font-semibold text-slate-900">
          {formatCurrency(order.total)}
        </p>
      </div>
    </div>
  );
}
