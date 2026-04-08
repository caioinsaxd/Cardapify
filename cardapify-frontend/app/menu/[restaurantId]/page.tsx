'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { usePublicMenu, Product, Section, PageStyling, Tab } from '@/hooks/use-public-menu';
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
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

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

  React.useEffect(() => {
    if (data?.page?.tabs && data.page.tabs.length > 0) {
      const defaultTab = data.page.tabs.find(t => t.isDefault) || data.page.tabs[0];
      setActiveTabId(defaultTab.id);
    }
  }, [data?.page?.tabs]);

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
      const requestBody: Record<string, unknown> = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      if (data?.orderSettings?.requireTableNumber) {
        requestBody.tableNumber = parseInt(tableNumber) || 0;
      } else if (tableNumber && parseInt(tableNumber) > 0) {
        requestBody.tableNumber = parseInt(tableNumber);
      }

      if (data?.orderSettings?.allowObservations && observations.trim()) {
        requestBody.observations = observations.trim().slice(0, 500);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public/${restaurantId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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
      setObservations('');
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

  const styling = data.page?.styling;
  const pageBg = styling?.background?.type === 'GRADIENT'
    ? `linear-gradient(135deg, ${styling.background.gradientStart || '#fff'}, ${styling.background.gradientEnd || '#fff'})`
    : styling?.background?.solidColor || '#ffffff';
  const primaryColor = styling?.colors?.primary || '#DC2626';
  const textColor = styling?.colors?.text || '#0F172A';
  const textSecondaryColor = styling?.colors?.textSecondary || '#64748B';
  const surfaceColor = styling?.colors?.surface || '#ffffff';
  const borderColor = styling?.colors?.border || '#E5E7EB';
  const fontFamily = styling?.typography?.fontFamily || 'Inter';
  const cardRadius = styling?.layout?.cardBorderRadius || 12;

  const tabs = data.page?.tabs || [];
  const visibleSections = data.sections || [];

  const renderProductCard = (product: Product, sectionConfig?: Section['config']) => {
    const showImage = sectionConfig?.cardConfig?.image?.show !== false;
    const showName = sectionConfig?.cardConfig?.name?.show !== false;
    const showDescription = sectionConfig?.cardConfig?.description?.show !== false;
    const showPrice = sectionConfig?.cardConfig?.price?.show !== false;
    const showButton = sectionConfig?.cardConfig?.addButton?.show !== false;

    return (
      <div
        key={product.id}
        className="overflow-hidden"
        style={{
          backgroundColor: surfaceColor,
          borderColor: borderColor,
          borderRadius: cardRadius,
          border: `1px solid ${borderColor}`,
        }}
      >
        {showImage && product.imageUrl && (
          <div
            className="w-full bg-gray-200"
            style={{ aspectRatio: '1/1' }}
          />
        )}
        {!showImage && !product.imageUrl && (
          <div
            className="w-full flex items-center justify-center"
            style={{ 
              aspectRatio: '1/1',
              backgroundColor: borderColor,
            }}
          >
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        <div className="p-3">
          {showName && (
            <h3 className="font-medium" style={{ color: textColor }}>{product.name}</h3>
          )}
          {showDescription && product.description && (
            <p className="mt-1 text-sm" style={{ color: textSecondaryColor }}>{product.description}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            {showPrice && (
              <p className="font-semibold" style={{ color: primaryColor }}>
                {formatCurrency(parseFloat(product.price))}
              </p>
            )}
            {showButton && (
              <button
                onClick={() => handleAddToCart(product)}
                disabled={!isRestaurantOpen}
                className="rounded-full p-2 text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (section: Section) => {
    const paddingTop = section.styling?.paddingTop || 0;
    const paddingBottom = section.styling?.paddingBottom || 0;
    const columns = section.config?.columns || 3;

    if (section.type === 'PRODUCT_GRID' && section.products) {
      return (
        <div
          key={section.id}
          style={{
            paddingTop,
            paddingBottom,
          }}
        >
          {section.category && (
            <h2 className="mb-4 text-lg font-semibold" style={{ color: textColor }}>
              {section.category.name}
            </h2>
          )}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {section.products.map(product => renderProductCard(product, section.config))}
          </div>
        </div>
      );
    }

    if (section.type === 'TEXT_BLOCK') {
      return (
        <div
          key={section.id}
          className="py-4 text-center"
          style={{
            paddingTop,
            paddingBottom,
            textAlign: (section.config?.alignment as 'left' | 'center' | 'right') || 'left',
            color: textSecondaryColor,
          }}
        >
          {section.config?.title && (
            <h2 className="text-xl font-bold mb-2" style={{ color: textColor }}>
              {section.config.title}
            </h2>
          )}
          {section.config?.content && (
            <p className="text-sm">{section.config.content}</p>
          )}
        </div>
      );
    }

    if (section.type === 'SPACER') {
      return (
        <div
          key={section.id}
          style={{ height: section.config?.height || 32 }}
        />
      );
    }

    if (section.type === 'BANNER') {
      return (
        <div
          key={section.id}
          className="relative overflow-hidden rounded-lg"
          style={{
            height: 160,
            backgroundColor: primaryColor,
            paddingTop,
            paddingBottom,
          }}
        >
          {section.config?.imageUrl && (
            <img
              src={section.config.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `rgba(0,0,0,${(section.config?.overlayOpacity || 30) / 100})` }}
          >
            <h2 className="text-white text-xl font-bold">
              {section.config?.title || ''}
            </h2>
          </div>
        </div>
      );
    }

    return null;
  };

  const displayedSections = data.isPageBuilder
    ? (tabs.length > 0 && activeTabId
        ? visibleSections.filter(s => {
            const tab = tabs.find(t => t.id === activeTabId);
            return tab?.sectionIds.includes(s.id);
          })
        : visibleSections)
    : [];

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: pageBg,
        fontFamily,
        color: textColor,
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: surfaceColor }}>
        <div
          className="mx-auto px-4 py-4"
          style={{ maxWidth: (styling?.layout?.maxWidth || 768), margin: '0 auto' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold" style={{ color: textColor }}>{data.restaurant.name}</h1>
              {data.restaurant.address && (
                <p className="mt-1 flex items-center gap-1 text-sm" style={{ color: textSecondaryColor }}>
                  <MapPin className="h-3 w-3" />
                  {data.restaurant.address}
                </p>
              )}
              {data.restaurant.phone && (
                <p className="mt-0.5 flex items-center gap-1 text-sm" style={{ color: textSecondaryColor }}>
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
            <p className="mt-2 text-sm" style={{ color: textSecondaryColor }}>{data.restaurant.description}</p>
          )}
          {!isRestaurantOpen && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>No momento não estamos aceptando pedidos</span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs Navigation */}
      {tabs.length > 0 && (
        <div
          className="sticky top-[73px] z-30 overflow-x-auto border-b"
          style={{ backgroundColor: surfaceColor, borderColor: borderColor }}
        >
          <div
            className="flex gap-2 px-4 py-3"
            style={{ maxWidth: (styling?.layout?.maxWidth || 768), margin: '0 auto' }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
                style={
                  activeTabId === tab.id
                    ? { backgroundColor: primaryColor, color: '#fff' }
                    : { backgroundColor: borderColor, color: textColor }
                }
              >
                {tab.icon && <span className="mr-1">{tab.icon}</span>}
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Content */}
      <main
        className="px-4 py-4"
        style={{ maxWidth: (styling?.layout?.maxWidth || 768), margin: '0 auto' }}
      >
        {/* Page Builder Sections */}
        {data.isPageBuilder && displayedSections.length > 0 ? (
          displayedSections.map(renderSection)
        ) : (
          /* Legacy Categories Fallback */
          data.categories?.map((category) => (
            <section key={category.id} className="mb-8">
              <h2 className="mb-4 text-lg font-semibold" style={{ color: textColor }}>{category.name}</h2>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${styling?.layout?.cardBorderRadius ? 2 : 3}, 1fr)` }}>
                {category.products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: surfaceColor,
                      borderColor: borderColor,
                      borderRadius: cardRadius,
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    {product.imageUrl && (
                      <div className="w-full bg-gray-200" style={{ aspectRatio: '1/1' }} />
                    )}
                    <div className="p-3">
                      <h3 className="font-medium" style={{ color: textColor }}>{product.name}</h3>
                      {product.description && (
                        <p className="mt-1 text-sm truncate" style={{ color: textSecondaryColor }}>{product.description}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-semibold" style={{ color: primaryColor }}>
                          {formatCurrency(parseFloat(product.price))}
                        </p>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!isRestaurantOpen}
                          className="rounded-full p-2 text-white disabled:opacity-50"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        disabled={totalItems === 0}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-6 py-4 text-white shadow-lg transition-transform disabled:cursor-not-allowed disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-medium">{totalItems}</span>
      </button>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 w-full max-w-md shadow-xl" style={{ backgroundColor: surfaceColor }}>
            <div className="flex h-full flex-col">
              {/* Cart Header */}
              <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: borderColor }}>
                <h2 className="text-lg font-semibold">Seu Pedido</h2>
                <button onClick={() => setIsCartOpen(false)} className="rounded-lg p-2" style={{ backgroundColor: borderColor }}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Order Success */}
              {orderSuccess ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8">
                  <div className="mb-4 rounded-full p-4" style={{ backgroundColor: '#DCFCE7' }}>
                    <Check className="h-12 w-12" style={{ color: '#22C55E' }} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Pedido Enviado!</h3>
                  <p className="text-center" style={{ color: textSecondaryColor }}>Aguarde a confirmação na tela.</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="flex-1 overflow-auto px-4 py-4">
                    {items.length === 0 ? (
                      <p className="py-8 text-center" style={{ color: textSecondaryColor }}>Seu carrinho está vazio</p>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: borderColor }}>
                            <div className="flex-1">
                              <p className="font-medium" style={{ color: textColor }}>{item.name}</p>
                              <p className="text-sm" style={{ color: textSecondaryColor }}>{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="rounded-lg p-1"
                                style={{ backgroundColor: borderColor }}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="rounded-lg p-1"
                                style={{ backgroundColor: borderColor }}
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
                    <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: borderColor }}>
                      {orderError && (
                        <div className="flex items-center gap-2 rounded-lg p-3 text-sm" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {orderError}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium" style={{ color: textColor }}>Seu Nome</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ex: João"
                          className="mt-1 block w-full rounded-lg border px-3 py-2"
                          style={{ borderColor: borderColor }}
                        />
                      </div>
                      {data.orderSettings.requireTableNumber && (
                        <div>
                          <label className="block text-sm font-medium" style={{ color: textColor }}>
                            Mesa <span style={{ color: '#DC2626' }}>*</span>
                          </label>
                          <input
                            type="number"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="Ex: 5"
                            className="mt-1 block w-full rounded-lg border px-3 py-2"
                            style={{ borderColor: borderColor }}
                          />
                        </div>
                      )}
                      {data.orderSettings.allowObservations && (
                        <div>
                          <label className="block text-sm font-medium" style={{ color: textColor }}>
                            Observações <span style={{ color: textSecondaryColor }}>(opcional)</span>
                          </label>
                          <textarea
                            value={observations}
                            onChange={(e) => setObservations(e.target.value.slice(0, 500))}
                            placeholder="Ex: sem cebola, alérgico a lactose..."
                            rows={2}
                            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm"
                            style={{ borderColor: borderColor }}
                          />
                          <p className="mt-1 text-xs" style={{ color: textSecondaryColor }}>{observations.length}/500</p>
                        </div>
                      )}
                      {data.orderSettings.minimumOrderAmount > 0 && total < data.orderSettings.minimumOrderAmount && (
                        <p className="text-sm" style={{ color: '#F59E0B' }}>
                          Pedido mínimo: {formatCurrency(data.orderSettings.minimumOrderAmount)}
                        </p>
                      )}
                      <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: borderColor }}>
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold">{formatCurrency(total)}</span>
                      </div>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={!canPlaceOrder || isSubmitting}
                        className="w-full rounded-lg py-3 font-semibold text-white transition-colors disabled:opacity-50"
                        style={{ backgroundColor: '#22C55E' }}
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

export default function PublicMenuPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const resolvedParams = React.use(params);
  return (
    <CartProvider>
      <MenuContent restaurantId={resolvedParams.restaurantId} />
    </CartProvider>
  );
}
