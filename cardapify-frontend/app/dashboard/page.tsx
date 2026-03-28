'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/use-dashboard';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderCard } from '@/components/order-card';
import { ProductCard } from '@/components/product-card';
import { StatusSummary } from '@/components/status-summary';
import { Loader2 } from 'lucide-react';
import {
  Tags,
  Utensils,
  ShoppingCart,
  Plus,
  Search,
  Bell,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboard();

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo, {user?.email}</p>
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
                <Button variant="outline" size="sm">Ver todos</Button>
              </CardHeader>
              <CardContent>
                {data?.orders && data.orders.length > 0 ? (
                  <div className="space-y-4">
                    {data.orders.slice(0, 10).map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
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
              <CardContent>
                <StatusSummary ordersByStatus={data?.ordersByStatus || {}} />
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
                      <ProductCard key={product.id} product={product} />
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
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Operações comuns</CardDescription>
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
