'use client';

import { Product } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Utensils } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Utensils className="h-4 w-4 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{product.name}</p>
          <p className="text-xs text-slate-500">
            {product.category?.name}
          </p>
        </div>
      </div>
      <p className="font-semibold text-slate-900">
        {formatCurrency(product.price)}
      </p>
    </div>
  );
}
