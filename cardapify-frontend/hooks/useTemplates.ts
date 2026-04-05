'use client';

import { useState, useCallback } from 'react';
import { api, MenuTemplate, TemplatesResponse, TemplateConfig } from '@/lib/api';

interface UseTemplatesReturn {
  templates: TemplatesResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  updateTemplate: (id: string, data: Partial<{ name: string; description: string; config: TemplateConfig; isActive: boolean }>) => Promise<MenuTemplate>;
  activateTemplate: (id: string) => Promise<MenuTemplate>;
  cloneTemplate: (templateId: string, name: string) => Promise<MenuTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<TemplatesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<TemplatesResponse>('/templates');
      setTemplates(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (
    id: string,
    data: Partial<{ name: string; description: string; config: TemplateConfig; isActive: boolean }>
  ) => {
    const response = await api.patch<MenuTemplate>(`/templates/${id}`, data);
    
    setTemplates(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        userTemplates: prev.userTemplates.map(t => 
          t.id === id ? response : t
        ),
      };
    });
    
    return response;
  }, []);

  const activateTemplate = useCallback(async (id: string) => {
    const response = await api.post<MenuTemplate>(`/templates/${id}/activate`, {});
    
    setTemplates(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        userTemplates: prev.userTemplates.map(t => ({
          ...t,
          isActive: t.id === id,
        })),
      };
    });
    
    return response;
  }, []);

  const cloneTemplate = useCallback(async (templateId: string, name: string) => {
    const response = await api.post<MenuTemplate>('/templates', {
      name,
      cloneFrom: templateId,
    });
    
    setTemplates(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        userTemplates: [...prev.userTemplates, response],
      };
    });
    
    return response;
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await api.delete(`/templates/${id}`);
    
    setTemplates(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        userTemplates: prev.userTemplates.filter(t => t.id !== id),
      };
    });
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    updateTemplate,
    activateTemplate,
    cloneTemplate,
    deleteTemplate,
  };
}
