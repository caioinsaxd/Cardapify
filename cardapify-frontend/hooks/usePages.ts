'use client';

import { useState, useCallback } from 'react';
import { api, MenuPage, MenuPageWithProducts, Section, Tab, PageStyling } from '@/lib/api';

interface UsePagesReturn {
  pages: MenuPage[];
  activePage: MenuPage | null;
  isLoading: boolean;
  error: string | null;
  fetchPages: () => Promise<void>;
  fetchActivePage: () => Promise<void>;
  createPage: (name: string, useTabs?: boolean) => Promise<MenuPage>;
  updatePage: (id: string, data: Partial<MenuPage>) => Promise<MenuPage>;
  deletePage: (id: string) => Promise<void>;
  activatePage: (id: string) => Promise<MenuPage>;
  addSection: (pageId: string, type: string, config?: unknown) => Promise<Section>;
  updateSection: (pageId: string, sectionId: string, data: Partial<{ styling: unknown; config: unknown; order: number }>) => Promise<Section>;
  deleteSection: (pageId: string, sectionId: string) => Promise<void>;
  reorderSections: (pageId: string, sectionIds: string[]) => Promise<Section[]>;
  addTab: (pageId: string, name: string) => Promise<Tab>;
  updateTab: (pageId: string, tabId: string, data: Partial<Tab>) => Promise<Tab>;
  deleteTab: (pageId: string, tabId: string) => Promise<void>;
  updateStyling: (pageId: string, styling: Partial<PageStyling>) => Promise<PageStyling>;
  getPageWithProducts: (pageId: string) => Promise<MenuPageWithProducts>;
}

export function usePages(): UsePagesReturn {
  const [pages, setPages] = useState<MenuPage[]>([]);
  const [activePage, setActivePage] = useState<MenuPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<MenuPage[]>('/pages');
      setPages(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActivePage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<MenuPage | null>('/pages/active');
      setActivePage(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active page');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPage = useCallback(async (name: string, useTabs?: boolean) => {
    const response = await api.post<MenuPage>('/pages', { name, useTabs });
    setPages(prev => [...prev, response]);
    return response;
  }, []);

  const updatePage = useCallback(async (id: string, data: Partial<MenuPage>) => {
    const response = await api.patch<MenuPage>(`/pages/${id}`, data);
    setPages(prev => prev.map(p => p.id === id ? response : p));
    if (activePage?.id === id) {
      setActivePage(response);
    }
    return response;
  }, [activePage]);

  const deletePage = useCallback(async (id: string) => {
    await api.delete(`/pages/${id}`);
    setPages(prev => prev.filter(p => p.id !== id));
    if (activePage?.id === id) {
      setActivePage(null);
    }
  }, [activePage]);

  const activatePage = useCallback(async (id: string) => {
    const response = await api.post<MenuPage>(`/pages/${id}/activate`, {});
    setPages(prev => prev.map(p => ({
      ...p,
      isActive: p.id === id,
    })));
    if (activePage) {
      setActivePage({ ...activePage, isActive: false });
    }
    return response;
  }, [activePage]);

  const addSection = useCallback(async (pageId: string, type: string, config?: unknown) => {
    const response = await api.post<Section>(`/pages/${pageId}/sections`, { type, config });
    await fetchPages();
    return response;
  }, [fetchPages]);

  const updateSection = useCallback(async (
    pageId: string,
    sectionId: string,
    data: Partial<{ styling: unknown; config: unknown; order: number }>
  ) => {
    const response = await api.patch<Section>(`/pages/${pageId}/sections/${sectionId}`, data);
    await fetchPages();
    return response;
  }, [fetchPages]);

  const deleteSection = useCallback(async (pageId: string, sectionId: string) => {
    await api.delete(`/pages/${pageId}/sections/${sectionId}`);
    await fetchPages();
  }, [fetchPages]);

  const reorderSections = useCallback(async (pageId: string, sectionIds: string[]) => {
    const response = await api.post<Section[]>(`/pages/${pageId}/sections/reorder`, { sectionIds });
    await fetchPages();
    return response;
  }, [fetchPages]);

  const addTab = useCallback(async (pageId: string, name: string) => {
    const response = await api.post<Tab>(`/pages/${pageId}/tabs`, { name });
    await fetchPages();
    return response;
  }, [fetchPages]);

  const updateTab = useCallback(async (pageId: string, tabId: string, data: Partial<Tab>) => {
    const response = await api.patch<Tab>(`/pages/${pageId}/tabs/${tabId}`, data);
    await fetchPages();
    return response;
  }, [fetchPages]);

  const deleteTab = useCallback(async (pageId: string, tabId: string) => {
    await api.delete(`/pages/${pageId}/tabs/${tabId}`);
    await fetchPages();
  }, [fetchPages]);

  const updateStyling = useCallback(async (pageId: string, styling: Partial<PageStyling>) => {
    const response = await api.patch<PageStyling>(`/pages/${pageId}/styling`, styling);
    await fetchPages();
    return response;
  }, [fetchPages]);

  const getPageWithProducts = useCallback(async (pageId: string) => {
    const response = await api.get<MenuPageWithProducts>(`/pages/${pageId}/with-products`);
    return response;
  }, []);

  return {
    pages,
    activePage,
    isLoading,
    error,
    fetchPages,
    fetchActivePage,
    createPage,
    updatePage,
    deletePage,
    activatePage,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    addTab,
    updateTab,
    deleteTab,
    updateStyling,
    getPageWithProducts,
  };
}
