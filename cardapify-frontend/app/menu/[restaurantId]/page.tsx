'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { usePublicMenu, Category, Product } from '@/hooks/use-public-menu';
import { CartProvider } from '@/contexts/CartContext';
import { Loader2, Plus, Minus, ShoppingCart, X, Check } from 'lucide-react';
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

  const handleAddToCart = (product: Product) => {
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
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public/${restaurantId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: parseInt(tableNumber) || 1,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to place order');

      setOrderSuccess(true);
      clearCart();
      setCustomerName('');
      setTableNumber('');
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch {
      alert('Erro ao fazer pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-xl font-bold text-slate-900">{data.restaurant.name}</h1>
          <p className="text-sm text-slate-500">Monte seu pedido</p>
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
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-white shadow-lg transition-transform active:scale-95"
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
                        <label className="block text-sm font-medium text-slate-700">Mesa (opcional)</label>
                        <input
                          type="number"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="Ex: 5"
                          className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
                        />
                      </div>
                      <div className="flex items-center justify-between border-t pt-4">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold">{formatCurrency(total)}</span>
                      </div>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={!customerName.trim() || isSubmitting}
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

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white p-4">
      <div className="flex-1">
        <h3 className="font-medium text-slate-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-slate-500">{product.description}</p>
        )}
        <p className="mt-1 font-semibold text-slate-900">{formatCurrency(parseFloat(product.price))}</p>
      </div>
      <button
        onClick={onAdd}
        className="ml-4 rounded-lg bg-slate-900 p-2 text-white transition-colors hover:bg-slate-800"
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
