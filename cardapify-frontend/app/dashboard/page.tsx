"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  TrendingDown,
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "secondary" | "destructive" }> = {
  PENDING: { label: "Pendente", variant: "warning" },
  PAID: { label: "Pago", variant: "info" },
  PREPARING: { label: "Preparando", variant: "warning" },
  READY: { label: "Pronto", variant: "success" },
  COMPLETED: { label: "Concluído", variant: "secondary" },
  CANCELLED: { label: "Cancelado", variant: "destructive" },
};

const mockOrders = [
  { id: "1", table: 5, status: "PAID", total: 45.90, time: "2 min", items: 3 },
  { id: "2", table: 12, status: "PREPARING", total: 89.50, time: "8 min", items: 5 },
  { id: "3", table: 3, status: "READY", total: 32.00, time: "12 min", items: 2 },
  { id: "4", table: 8, status: "PENDING", total: 156.80, time: "1 min", items: 8 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Bem-vindo ao Cardapify Admin</p>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Categorias"
          value={8}
          icon={Tags}
          description="+2 este mês"
          trend={{ value: 33, isPositive: true }}
        />
        <StatCard
          title="Produtos"
          value={47}
          icon={Utensils}
          description="+5 este mês"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Pedidos Hoje"
          value={24}
          icon={ShoppingCart}
          description="+15% vs ontem"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Receita Hoje"
          value="R$ 1.234"
          icon={TrendingUp}
          description="+23% vs ontem"
          trend={{ value: 23, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Últimos pedidos do dia</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockOrders.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <span className="text-sm font-semibold text-slate-600">
                          {order.table}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          Mesa {order.table}
                        </p>
                        <p className="text-sm text-slate-500">
                          {order.items} itens • {order.time} atrás
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <p className="font-semibold text-slate-900">
                        R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
            <CardDescription>Resumo do dia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-slate-600">Pendente</span>
              </div>
              <span className="font-semibold">4</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-600">Pago</span>
              </div>
              <span className="font-semibold">8</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-slate-600">Preparando</span>
              </div>
              <span className="font-semibold">6</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">Pronto</span>
              </div>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-slate-600">Cancelado</span>
              </div>
              <span className="font-semibold">1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produtos Populares</CardTitle>
            <CardDescription>Mais vendidos hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "X-Burger Especial", sales: 24, revenue: 479.76 },
                { name: "Pizza Margherita", sales: 18, revenue: 359.82 },
                { name: "Coca-Cola 600ml", sales: 32, revenue: 159.68 },
                { name: "Batata Frita G", sales: 15, revenue: 134.85 },
              ].map((product, i) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{product.sales} vendas</p>
                    <p className="text-xs text-slate-500">
                      R$ {product.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}
