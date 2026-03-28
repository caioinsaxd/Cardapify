'use client';

import { useState, useEffect } from 'react';
import { useCategories, CategoryWithCount } from '@/hooks/use-categories';
import { Modal } from '@/components/ui/modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

interface FormData {
  name: string;
}

interface FormProps {
  initialData?: FormData;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function CategoryForm({ initialData, onSubmit, onCancel, isLoading }: FormProps) {
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nome da Categoria
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Bebidas, Lanches, Sobremesas"
          maxLength={100}
          required
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !name.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : initialData ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const { categories, isLoading, error, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithCount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryWithCount) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCreate = async (data: FormData) => {
    setIsSubmitting(true);
    const success = await createCategory(data.name);
    setIsSubmitting(false);
    if (success) closeModal();
  };

  const handleEdit = async (data: FormData) => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    const success = await updateCategory(selectedCategory.id, data.name);
    setIsSubmitting(false);
    if (success) closeModal();
  };

  const openDeleteModal = (category: CategoryWithCount) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    await deleteCategory(categoryToDelete.id);
    setIsDeleting(false);
    closeDeleteModal();
  };

  const getProductCountText = (count: number) => {
    return `${count} produto${count !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
          <p className="text-slate-500">Gerencie as categorias do seu cardápio</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todas as Categorias</CardTitle>
          <CardDescription>
            {categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500">Nenhuma categoria encontrada</p>
              <Button variant="outline" className="mt-4" onClick={openCreateModal}>
                Criar primeira categoria
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <span className="text-sm font-semibold text-slate-600">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{category.name}</p>
                      <p className="text-sm text-slate-500">
                        {getProductCountText(category._count?.products || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(category)}>
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(category)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
      >
        <CategoryForm
          initialData={selectedCategory ? { name: selectedCategory.name } : undefined}
          onSubmit={modalMode === 'create' ? handleCreate : handleEdit}
          onCancel={closeModal}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Excluir Categoria"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Tem certeza que deseja excluir a categoria <strong>{categoryToDelete?.name}</strong>?
          </p>
          {(categoryToDelete?._count?.products ?? 0) > 0 && (
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                Esta categoria possui {categoryToDelete?._count?.products} produto(s). 
                Ao excluir, todos os produtos serão excluídos também.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeDeleteModal} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
