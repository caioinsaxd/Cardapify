'use client';

import { useState, useCallback } from 'react';
import { api, Category } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export interface CategoryWithCount extends Category {
  _count?: { products: number };
}

export interface UseCategoriesReturn {
  categories: CategoryWithCount[];
  isLoading: boolean;
  error: string;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<boolean>;
  updateCategory: (id: string, name: string) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await api.get<CategoryWithCount[]>('/categories');
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar categorias');
      showToast('Erro ao carregar categorias', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const createCategory = useCallback(async (name: string): Promise<boolean> => {
    try {
      await api.post('/categories', { name });
      showToast('Categoria criada com sucesso', 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar categoria', 'error');
      return false;
    }
  }, [fetchCategories, showToast]);

  const updateCategory = useCallback(async (id: string, name: string): Promise<boolean> => {
    try {
      await api.patch(`/categories/${id}`, { name });
      showToast('Categoria atualizada com sucesso', 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar categoria', 'error');
      return false;
    }
  }, [fetchCategories, showToast]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/categories/${id}`);
      showToast('Categoria excluída com sucesso', 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir categoria', 'error');
      return false;
    }
  }, [fetchCategories, showToast]);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
