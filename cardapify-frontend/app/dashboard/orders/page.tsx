'use client';

import { useEffect } from 'react';
import { useOrders, Order } from '@/hooks/use-orders';
import { Modal } from '@/components/ui/modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';
import { STATUS_CONFIG, ORDER_STATUSES } from '@/lib/constants';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUS_FLOW: Order['status'][] = ['PENDING', 'PAID', 'PREPARING', 'READY', 'COMPLETED'];

function OrderCard({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (orderId: string, status: Order['status']) => void }) {
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <span className="text-sm font-semibold text-slate-600">{order.tableNumber}</span>
            </div>
            <div>
              <p className="font-medium text-slate-900">Mesa {order.tableNumber}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {getRelativeTime(order.createdAt)} atrás
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={status.variant} className="mb-1">
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(order.total)}</p>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-600">{item.quantity}x {item.product.name}</span>
              <span className="text-slate-900">{formatCurrency(parseFloat(item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>

        {canAdvance && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
          <div className="mt-4 flex items-center justify-between">
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Cancelar
            </Button>
            <Button size="sm" onClick={() => onUpdateStatus(order.id, STATUS_FLOW[currentIndex + 1])}>
              {order.status === 'PENDING' ? 'Confirmar Pagamento' : 
               order.status === 'PAID' ? 'Iniciar Preparo' :
               order.status === 'PREPARING' ? 'Marcar como Pronto' :
               order.status === 'READY' ? 'Finalizar Pedido' : 'Avançar'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusFilter({ selected, onSelect }: { selected: string; onSelect: (status: string) => void }) {
  const statuses = ['TODOS', 'PENDING', 'PAID', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onSelect(status)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            selected === status
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          {status === 'TODOS' ? 'Todos' : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
        </button>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { orders, isLoading, error, fetchOrders, updateStatus } = useOrders();
  const [statusFilter, setStatusFilter] = require('react').useState('TODOS');

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = statusFilter === 'TODOS' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
        <p className="text-slate-500">Gerencie os pedidos dos clientes</p>
      </div>

      {/* Status Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
          if (!config) return null;
          return (
            <div key={status} className="flex min-w-fit items-center gap-2 rounded-lg border bg-white px-3 py-2">
              <div className={cn('h-2 w-2 rounded-full', 
                status === 'PENDING' ? 'bg-yellow-500' :
                status === 'PAID' ? 'bg-blue-500' :
                status === 'PREPARING' ? 'bg-orange-500' :
                status === 'READY' ? 'bg-green-500' :
                status === 'COMPLETED' ? 'bg-slate-400' : 'bg-red-500'
              )} />
              <span className="text-sm text-slate-600">{config.label}</span>
              <span className="font-semibold text-slate-900">{count}</span>
            </div>
          );
        })}
      </div>

      <StatusFilter selected={statusFilter} onSelect={setStatusFilter} />

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
