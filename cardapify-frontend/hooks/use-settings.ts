'use client';

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export interface OrderSettings {
  requireTableNumber: boolean;
  minimumOrderAmount: number;
  autoConfirmOrders: boolean;
  preparationTimeMinutes: number;
}

export interface BusinessHours {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface RestaurantProfile {
  name: string;
  address: string | null;
  phone: string | null;
  description: string | null;
}

export interface RestaurantSettings {
  profile: RestaurantProfile;
  orderSettings: OrderSettings;
  businessHours: BusinessHours[];
}

export interface UseSettingsReturn {
  profile: RestaurantProfile | null;
  orderSettings: OrderSettings | null;
  businessHours: BusinessHours[];
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  fetchSettings: () => Promise<void>;
  updateProfile: (data: Partial<RestaurantProfile>) => Promise<boolean>;
  updateOrderSettings: (data: Partial<OrderSettings>) => Promise<boolean>;
  updateBusinessHours: (data: BusinessHours[]) => Promise<boolean>;
}

const DEFAULT_ORDER_SETTINGS: OrderSettings = {
  requireTableNumber: true,
  minimumOrderAmount: 0,
  autoConfirmOrders: false,
  preparationTimeMinutes: 30,
};

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: 'monday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'tuesday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'wednesday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'thursday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'friday', openTime: '09:00', closeTime: '23:00', isOpen: true },
  { day: 'saturday', openTime: '10:00', closeTime: '23:00', isOpen: true },
  { day: 'sunday', openTime: '10:00', closeTime: '21:00', isOpen: true },
];

const DAY_NAMES: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export function useSettings(): UseSettingsReturn {
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [orderSettings, setOrderSettings] = useState<OrderSettings | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(DEFAULT_BUSINESS_HOURS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.get<{
        name: string;
        address: string | null;
        phone: string | null;
        description: string | null;
        orderSettings: OrderSettings;
        businessHours: BusinessHours[];
      }>('/settings/profile');
      
      setProfile({
        name: data.name,
        address: data.address,
        phone: data.phone,
        description: data.description,
      });
      setOrderSettings(data.orderSettings || DEFAULT_ORDER_SETTINGS);
      setBusinessHours(data.businessHours?.length > 0 ? data.businessHours : DEFAULT_BUSINESS_HOURS);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar configurações');
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const updateProfile = useCallback(async (data: Partial<RestaurantProfile>): Promise<boolean> => {
    try {
      setIsSaving(true);
      const updated = await api.patch<RestaurantProfile>('/settings/profile', data);
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
      showToast('Perfil atualizado com sucesso', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar perfil', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const updateOrderSettings = useCallback(async (data: Partial<OrderSettings>): Promise<boolean> => {
    try {
      setIsSaving(true);
      const result = await api.patch<{ orderSettings: OrderSettings }>('/settings/orders', {
        orderSettings: data,
      });
      setOrderSettings(result.orderSettings);
      showToast('Configurações de pedido atualizadas', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar configurações', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const updateBusinessHours = useCallback(async (data: BusinessHours[]): Promise<boolean> => {
    try {
      setIsSaving(true);
      const result = await api.patch<{ businessHours: BusinessHours[] }>('/settings/orders', {
        businessHours: data,
      });
      setBusinessHours(result.businessHours);
      showToast('Horário de funcionamento atualizado', 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar horários', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    profile,
    orderSettings,
    businessHours,
    isLoading,
    isSaving,
    error,
    fetchSettings,
    updateProfile,
    updateOrderSettings,
    updateBusinessHours,
  };
}

export { DAY_NAMES };
