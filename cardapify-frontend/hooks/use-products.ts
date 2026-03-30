'use client';

import { useState, useCallback } from 'react';
import { api, Product, Category } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export interface ProductWithCategory {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  category: { id: string; name: string };
}

export interface ProductsData {
  products: ProductWithCategory[];
  categories: Category[];
}

export interface UseProductsReturn {
  products: ProductWithCategory[];
  categories: Category[];
  isLoading: boolean;
  error: string;
  fetchProducts: () => Promise<void>;
  createProduct: (data: { name: string; description?: string; price: number; categoryId: string; imageUrl?: string }) => Promise<boolean>;
  updateProduct: (id: string, data: { name?: string; description?: string; price?: number; categoryId?: string; imageUrl?: string }) => Promise<boolean>;
  toggleProductActive: (id: string) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [productsData, categoriesData] = await Promise.all([
        api.get<ProductWithCategory[]>('/products'),
        api.get<Category[]>('/categories'),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos');
      showToast('Erro ao carregar produtos', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const createProduct = useCallback(async (data: { name: string; description?: string; price: number; categoryId: string; imageUrl?: string }): Promise<boolean> => {
    try {
      await api.post('/products', data);
      showToast('Produto criado com sucesso', 'success');
      await fetchProducts();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar produto', 'error');
      return false;
    }
  }, [fetchProducts, showToast]);

  const updateProduct = useCallback(async (id: string, data: { name?: string; description?: string; price?: number; categoryId?: string; imageUrl?: string }): Promise<boolean> => {
    try {
      await api.patch(`/products/${id}`, data);
      showToast('Produto atualizado com sucesso', 'success');
      await fetchProducts();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar produto', 'error');
      return false;
    }
  }, [fetchProducts, showToast]);

  const toggleProductActive = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.get(`/products/${id}/toggle-active`);
      showToast('Status do produto atualizado', 'success');
      await fetchProducts();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar produto', 'error');
      return false;
    }
  }, [fetchProducts, showToast]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/products/${id}`);
      showToast('Produto excluído com sucesso', 'success');
      await fetchProducts();
      return true;
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir produto', 'error');
      return false;
    }
  }, [fetchProducts, showToast]);

  return {
    products,
    categories,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    toggleProductActive,
    deleteProduct,
  };
}
