'use client';

import { useAuth } from '@/contexts/AuthContext';
import { api, Category, Product, Order } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import {
  Tags,
  Utensils,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Plus,
  Search,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'secondary' | 'destructive'; color: string; icon: typeof Clock }> = {
  PENDING: { label: 'Pendente', variant: 'warning', color: 'text-yellow-500', icon: Clock },
  PAID: { label: 'Pago', variant: 'info', color: 'text-blue-500', icon: CheckCircle },
  PREPARING: { label: 'Preparando', variant: 'warning', color: 'text-orange-500', icon: ChefHat },
  READY: { label: 'Pronto', variant: 'success', color: 'text-green-500', icon: CheckCircle },
  COMPLETED: { label: 'Concluído', variant: 'secondary', color: 'text-slate-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', variant: 'destructive', color: 'text-red-500', icon: XCircle },
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
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
        (o) => new Date(o.createdAt) >= today && o.status !== 'CANCELLED'
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
        orders: orders.slice(0, 10),
        todayOrders,
        todayRevenue,
        ordersByStatus,
      };
    },
    enabled: true,
  });

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              Erro ao carregar dados. Verifique se o backend está rodando.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ordersByStatusConfig = [
    { status: 'PENDING', icon: Clock, color: 'text-yellow-500' },
    { status: 'PAID', icon: CheckCircle, color: 'text-blue-500' },
    { status: 'PREPARING', icon: ChefHat, color: 'text-orange-500' },
    { status: 'READY', icon: CheckCircle, color: 'text-green-500' },
    { status: 'CANCELLED', icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Bem-vindo, {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar..." className="w-64 pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Categorias"
              value={data?.categories.length || 0}
              icon={Tags}
            />
            <StatCard
              title="Produtos"
              value={data?.products.length || 0}
              icon={Utensils}
            />
            <StatCard
              title="Pedidos Hoje"
              value={data?.todayOrders.length || 0}
              icon={ShoppingCart}
            />
            <StatCard
              title="Receita Hoje"
              value={`R$ ${(data?.todayRevenue || 0).toFixed(2)}`}
              icon={TrendingUp}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pedidos Recentes</CardTitle>
                  <CardDescription>Últimos pedidos</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent>
                {data?.orders && data.orders.length > 0 ? (
                  <div className="space-y-4">
                    {data.orders.map((order) => {
                      const status = statusConfig[order.status];
                      const StatusIcon = status?.icon || Clock;
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                              <span className="text-sm font-semibold text-slate-600">
                                {order.tableNumber}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                Mesa {order.tableNumber}
                              </p>
                              <p className="text-sm text-slate-500">
                                {order.items.length} itens •{' '}
                                {getRelativeTime(order.createdAt)} atrás
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={status?.variant}>
                              {status?.label}
                            </Badge>
                            <p className="font-semibold text-slate-900">
                              R$ {Number(order.total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-8 text-center text-slate-500">
                    Nenhum pedido encontrado
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Pedidos</CardTitle>
                <CardDescription>Resumo do dia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordersByStatusConfig.map(({ status, icon: Icon, color }) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className={cn('flex items-center gap-2', color)}>
                      <Icon className="h-4 w-4" />
                      <span className="text-sm text-slate-600">
                        {statusConfig[status]?.label || status}
                      </span>
                    </div>
                    <span className="font-semibold">
                      {data?.ordersByStatus[status] || 0}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>
                  {data?.products.length || 0} produtos cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data?.products && data.products.length > 0 ? (
                  <div className="space-y-3">
                    {data.products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                            <Utensils className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-slate-500">
                              {product.category?.name}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          R$ {Number(product.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-slate-500">
                    Nenhum produto encontrado
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Operações comuns</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Novo Produto</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Tags className="h-5 w-5" />
                  <span className="text-xs">Nova Categoria</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs">Ver Cardápio</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="text-xs">Ver Pedidos</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
