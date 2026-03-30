'use client';

import { useState, useEffect } from 'react';
import { useProducts, ProductWithCategory } from '@/hooks/use-products';
import { Modal } from '@/components/ui/modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon, EyeOff, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FormData {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  imageUrl: string;
}

interface FormProps {
  initialData?: FormData;
  categories: { id: string; name: string }[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function ProductForm({ initialData, categories, onSubmit, onCancel, isLoading }: FormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNumber = parseFloat(price.replace(',', '.'));
    if (isNaN(priceNumber) || priceNumber <= 0) return;
    onSubmit({ name, description, price, categoryId, imageUrl });
  };

  const isValid = name.trim() && price && parseFloat(price.replace(',', '.')) > 0 && categoryId;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome</label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: X-Burger" maxLength={100} required autoFocus />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição</label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Hambúrguer artesanal com queijo" maxLength={500} />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-slate-700">Preço (R$)</label>
        <Input id="price" type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" required />
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoria</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          required
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700">URL da Imagem (opcional)</label>
        <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading || !isValid}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : initialData ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const { products, categories, isLoading, error, fetchProducts, createProduct, updateProduct, toggleProductActive, deleteProduct } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductWithCategory) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCreate = async (data: FormData) => {
    setIsSubmitting(true);
    const priceNumber = parseFloat(data.price.replace(',', '.'));
    const success = await createProduct({
      name: data.name,
      description: data.description || undefined,
      price: priceNumber,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl || undefined,
    });
    setIsSubmitting(false);
    if (success) closeModal();
  };

  const handleEdit = async (data: FormData) => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    const priceNumber = parseFloat(data.price.replace(',', '.'));
    const success = await updateProduct(selectedProduct.id, {
      name: data.name,
      description: data.description || undefined,
      price: priceNumber,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl || undefined,
    });
    setIsSubmitting(false);
    if (success) closeModal();
  };

  const openDeleteModal = (product: ProductWithCategory) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    await deleteProduct(productToDelete.id);
    setIsDeleting(false);
    closeDeleteModal();
  };

  const handleToggleActive = async (product: ProductWithCategory) => {
    await toggleProductActive(product.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
          <p className="text-slate-500">Gerencie os produtos do seu cardápio</p>
        </div>
        <Button onClick={openCreateModal} disabled={categories.length === 0}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {categories.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-800">Crie uma categoria primeiro para adicionar produtos.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos os Produtos</CardTitle>
          <CardDescription>{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500">Nenhum produto encontrado</p>
              <Button variant="outline" className="mt-4" onClick={openCreateModal} disabled={categories.length === 0}>
                Criar primeiro produto
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.id} className={`flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50 ${!product.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{product.name}</p>
                        {!product.isActive && <Badge variant="secondary">Inativo</Badge>}
                      </div>
                      <p className="text-sm text-slate-500">
                        {product.description || 'Sem descrição'} • {product.category?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-slate-900">{formatCurrency(product.price)}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleActive(product)} title={product.isActive ? 'Desativar' : 'Ativar'}>
                      {product.isActive ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}>
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(product)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'create' ? 'Novo Produto' : 'Editar Produto'}>
        <ProductForm
          initialData={selectedProduct ? { name: selectedProduct.name, description: selectedProduct.description || '', price: selectedProduct.price, categoryId: selectedProduct.category?.id || '', imageUrl: selectedProduct.imageUrl || '' } : undefined}
          categories={categories}
          onSubmit={modalMode === 'create' ? handleCreate : handleEdit}
          onCancel={closeModal}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Excluir Produto">
        <div className="space-y-4">
          <p className="text-slate-600">Tem certeza que deseja excluir o produto <strong>{productToDelete?.name}</strong>?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeDeleteModal} disabled={isDeleting}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
