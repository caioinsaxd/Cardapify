'use client';

import { useState, useEffect } from 'react';
import { useSettings, DAY_NAMES, BusinessHours, OrderSettings, RestaurantProfile } from '@/hooks/use-settings';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Clock, Store, ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'orders' | 'hours';

const TABS = [
  { id: 'profile' as TabType, name: 'Perfil', icon: Store },
  { id: 'orders' as TabType, name: 'Pedidos', icon: ShoppingCart },
  { id: 'hours' as TabType, name: 'Horários', icon: Clock },
];

export default function SettingsPage() {
  const { profile, orderSettings, businessHours, isLoading, isSaving, updateProfile, updateOrderSettings, updateBusinessHours } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  const [profileForm, setProfileForm] = useState<Partial<RestaurantProfile>>({
    name: '',
    address: '',
    phone: '',
    description: '',
  });
  
  const [orderForm, setOrderForm] = useState<Partial<OrderSettings>>({
    requireTableNumber: true,
    minimumOrderAmount: 0,
    autoConfirmOrders: false,
    preparationTimeMinutes: 30,
  });
  
  const [hoursForm, setHoursForm] = useState<BusinessHours[]>([]);
  
  const [profileSaved, setProfileSaved] = useState(false);
  const [ordersSaved, setOrdersSaved] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        address: profile.address || '',
        phone: profile.phone || '',
        description: profile.description || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (orderSettings) {
      setOrderForm({ ...orderSettings });
    }
  }, [orderSettings]);

  useEffect(() => {
    if (businessHours.length > 0) {
      setHoursForm([...businessHours]);
    }
  }, [businessHours]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    const success = await updateProfile(profileForm);
    if (success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    }
  };

  const handleSaveOrders = async () => {
    const success = await updateOrderSettings(orderForm);
    if (success) {
      setOrdersSaved(true);
      setTimeout(() => setOrdersSaved(false), 2000);
    }
  };

  const handleSaveHours = async () => {
    const success = await updateBusinessHours(hoursForm);
    if (success) {
      setHoursSaved(true);
      setTimeout(() => setHoursSaved(false), 2000);
    }
  };

  const handleHoursChange = (day: string, field: keyof BusinessHours, value: string | boolean) => {
    setHoursForm((prev) =>
      prev.map((h) => (h.day === day ? { ...h, [field]: value } : h))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500">Gerencie as configurações do seu restaurante</p>
      </div>

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Perfil do Restaurante</CardTitle>
            <CardDescription>Informações básicas do seu restaurante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome</label>
              <Input
                value={profileForm.name || ''}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do restaurante"
                maxLength={200}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Endereço</label>
              <Input
                value={profileForm.address || ''}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Endereço completo"
                maxLength={500}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Telefone</label>
              <Input
                value={profileForm.phone || ''}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^\d\s\-\(\)\+]/g, '');
                  setProfileForm((prev) => ({ ...prev, phone: sanitized.slice(0, 20) }));
                }}
                placeholder="+55 11 99999-9999"
                maxLength={20}
              />
              <p className="mt-1 text-xs text-slate-500">Apenas números, espaços, hífens, parênteses e +</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Descrição</label>
              <textarea
                value={profileForm.description || ''}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do seu restaurante"
                rows={3}
                maxLength={1000}
                className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} disabled={isSaving || profileSaved}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {profileSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Pedidos</CardTitle>
            <CardDescription>Configure como os pedidos são processados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Exigir número da mesa</label>
                <p className="text-xs text-slate-500">O cliente precisa informar a mesa ao fazer o pedido</p>
              </div>
              <button
                type="button"
                onClick={() => setOrderForm((prev) => ({ ...prev, requireTableNumber: !prev.requireTableNumber }))}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  orderForm.requireTableNumber ? 'bg-slate-900' : 'bg-slate-200'
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    orderForm.requireTableNumber && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Valor mínimo do pedido</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={orderForm.minimumOrderAmount || 0}
                onChange={(e) => setOrderForm((prev) => ({ ...prev, minimumOrderAmount: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="w-40"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Auto-confirmar pedidos</label>
                <p className="text-xs text-slate-500">Pedidos são confirmados automaticamente sem aprovação manual</p>
              </div>
              <button
                type="button"
                onClick={() => setOrderForm((prev) => ({ ...prev, autoConfirmOrders: !prev.autoConfirmOrders }))}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  orderForm.autoConfirmOrders ? 'bg-slate-900' : 'bg-slate-200'
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    orderForm.autoConfirmOrders && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tempo de preparo (minutos)</label>
              <Input
                type="number"
                min="1"
                max="180"
                value={orderForm.preparationTimeMinutes || 30}
                onChange={(e) => setOrderForm((prev) => ({ ...prev, preparationTimeMinutes: parseInt(e.target.value) || 30 }))}
                placeholder="30"
                className="w-32"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveOrders} disabled={isSaving || ordersSaved}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {ordersSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'hours' && (
        <Card>
          <CardHeader>
            <CardTitle>Horário de Funcionamento</CardTitle>
            <CardDescription>Configure os horários de abertura e fechamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(hoursForm.length > 0 ? hoursForm : businessHours).map((hours) => (
              <div key={hours.day} className="flex items-center gap-4 rounded-lg border border-slate-100 p-4">
                <div className="w-32">
                  <span className="text-sm font-medium text-slate-700">
                    {DAY_NAMES[hours.day] || hours.day}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const current = hoursForm.length > 0 ? hoursForm : businessHours;
                      const updated = current.map((h) =>
                        h.day === hours.day ? { ...h, isOpen: !h.isOpen } : h
                      );
                      setHoursForm(updated);
                    }}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors',
                      hours.isOpen ? 'bg-green-500' : 'bg-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                        hours.isOpen && 'translate-x-5'
                      )}
                    />
                  </button>
                  <span className="text-xs text-slate-500">{hours.isOpen ? 'Aberto' : 'Fechado'}</span>
                </div>
                {hours.isOpen && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hoursForm.length > 0 ? hoursForm.find((h) => h.day === hours.day)?.openTime || hours.openTime : hours.openTime}
                      onChange={(e) => handleHoursChange(hours.day, 'openTime', e.target.value)}
                      className="w-28"
                    />
                    <span className="text-slate-400">às</span>
                    <Input
                      type="time"
                      value={hoursForm.length > 0 ? hoursForm.find((h) => h.day === hours.day)?.closeTime || hours.closeTime : hours.closeTime}
                      onChange={(e) => handleHoursChange(hours.day, 'closeTime', e.target.value)}
                      className="w-28"
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveHours} disabled={isSaving || hoursSaved}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {hoursSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
