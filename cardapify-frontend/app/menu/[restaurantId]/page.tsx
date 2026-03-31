'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { usePublicMenu, Category, Product } from '@/hooks/use-public-menu';
import { CartProvider } from '@/contexts/CartContext';
import { Loader2, Plus, Minus, ShoppingCart, X, Check, MapPin, Phone, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MenuContentProps {
  restaurantId: string;
}

function MenuContent({ restaurantId }: MenuContentProps) {
  const { data, isLoading, isError } = usePublicMenu(restaurantId);
  const { items, addItem, removeItem, updateQuantity, clearCart, total, totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');

  const isRestaurantOpen = useMemo(() => {
    if (!data?.businessHours) return true;
    const now = new Date();
    const dayMap: Record<number, string> = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday',
    };
    const today = dayMap[now.getDay()];
    const todayHours = data.businessHours.find(h => h.day === today);
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const currentTime = now.toTimeString().slice(0, 5);
    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  }, [data?.businessHours]);

  const handleAddToCart = (product: Product) => {
    if (!isRestaurantOpen) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
    });
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || items.length === 0) return;

    setIsSubmitting(true);
    setOrderError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public/${restaurantId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: parseInt(tableNumber) || 0,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setOrderError(result.message || 'Erro ao fazer pedido');
        return;
      }

      setOrderSuccess(true);
      clearCart();
      setCustomerName('');
      setTableNumber('');
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch {
      setOrderError('Erro ao fazer pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPlaceOrder = useMemo(() => {
    if (!customerName.trim() || items.length === 0 || !isRestaurantOpen) return false;
    if (data?.orderSettings?.requireTableNumber && (!tableNumber || parseInt(tableNumber) <= 0)) {
      return false;
    }
    if (data?.orderSettings?.minimumOrderAmount && total < data.orderSettings.minimumOrderAmount) {
      return false;
    }
    return true;
  }, [customerName, items, isRestaurantOpen, data?.orderSettings, tableNumber, total]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-900">Cardápio não encontrado</p>
          <p className="text-sm text-slate-500">Verifique o link ou tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{data.restaurant.name}</h1>
              {data.restaurant.address && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {data.restaurant.address}
                </p>
              )}
              {data.restaurant.phone && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                  <Phone className="h-3 w-3" />
                  {data.restaurant.phone}
                </p>
              )}
            </div>
            {!isRestaurantOpen && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                Fechado
              </span>
            )}
          </div>
          {data.restaurant.description && (
            <p className="mt-2 text-sm text-slate-600">{data.restaurant.description}</p>
          )}
          {!isRestaurantOpen && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>No momento não estamos接受ando pedidos</span>
            </div>
          )}
        </div>
      </header>

      {/* Menu */}
      <main className="mx-auto max-w-2xl px-4 py-4">
        {data.categories.map((category) => (
          <section key={category.id} className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">{category.name}</h2>
            <div className="grid gap-3">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => handleAddToCart(product)}
                  disabled={!isRestaurantOpen}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        disabled={totalItems === 0}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-white shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-medium">{totalItems}</span>
      </button>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 w-full max-w-md bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b px-4 py-4">
                <h2 className="text-lg font-semibold">Seu Pedido</h2>
                <button onClick={() => setIsCartOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Order Success */}
              {orderSuccess ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8">
                  <div className="mb-4 rounded-full bg-green-100 p-4">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Pedido Enviado!</h3>
                  <p className="text-center text-slate-500">Aguarde a confirmação na tela.</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="flex-1 overflow-auto px-4 py-4">
                    {items.length === 0 ? (
                      <p className="py-8 text-center text-slate-500">Seu carrinho está vazio</p>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-slate-500">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="rounded-lg p-1 hover:bg-slate-100"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="rounded-lg p-1 hover:bg-slate-100"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Form */}
                  {items.length > 0 && (
                    <div className="border-t px-4 py-4 space-y-4">
                      {orderError && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {orderError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Seu Nome</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ex: João"
                          className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Mesa {data.orderSettings.requireTableNumber && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="number"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="Ex: 5"
                          className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
                        />
                      </div>
                      {data.orderSettings.minimumOrderAmount > 0 && total < data.orderSettings.minimumOrderAmount && (
                        <p className="text-sm text-amber-600">
                          Pedido mínimo: {formatCurrency(data.orderSettings.minimumOrderAmount)}
                        </p>
                      )}
                      <div className="flex items-center justify-between border-t pt-4">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold">{formatCurrency(total)}</span>
                      </div>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={!canPlaceOrder || isSubmitting}
                        className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-slate-300"
                      >
                        {isSubmitting ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Fazer Pedido'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd, disabled }: { product: Product; onAdd: () => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4">
      <div className="flex-1">
        <h3 className={`font-medium ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>{product.name}</h3>
        {product.description && (
          <p className={`mt-1 text-sm ${disabled ? 'text-slate-300' : 'text-slate-500'}`}>{product.description}</p>
        )}
        <p className={`mt-1 font-semibold ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>{formatCurrency(parseFloat(product.price))}</p>
      </div>
      <button
        onClick={onAdd}
        disabled={disabled}
        className="ml-4 rounded-lg bg-slate-900 p-2 text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function PublicMenuPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const resolvedParams = React.use(params);
  return (
    <CartProvider>
      <MenuContent restaurantId={resolvedParams.restaurantId} />
    </CartProvider>
  );
}
