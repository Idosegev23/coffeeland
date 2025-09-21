'use client';

import React from 'react';
import { X, ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  slug: string;
  title: string;
  description_md: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock: number;
  image_url?: string;
}

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, qty?: number) => void;
}

export function ProductQuickView({ product, isOpen, onClose, onAddToCart }: ProductQuickViewProps) {
  const [quantity, setQuantity] = React.useState(1);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-latte-100 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-coffee-200">
          <h2 className="text-lg font-semibold text-coffee-900">פרטי מוצר</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Product Image */}
          {product.image_url && (
            <div className="aspect-square w-full bg-latte-200 rounded-lg overflow-hidden">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-coffee-900">{product.title}</h3>
            
            {/* Price */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {product.compare_at_price_cents && (
                <span className="text-sm line-through text-coffee-600">
                  {formatPrice(product.compare_at_price_cents)}
                </span>
              )}
              <span className="text-2xl font-bold text-tropical-600">
                {formatPrice(product.price_cents)}
              </span>
              {product.compare_at_price_cents && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  חיסכון {formatPrice(product.compare_at_price_cents - product.price_cents)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="text-sm">
              {product.stock > 0 ? (
                <span className="text-green-600">
                  ✓ במלאי ({product.stock} יחידות)
                </span>
              ) : (
                <span className="text-red-600">
                  ✗ אזל מהמלאי
                </span>
              )}
            </div>

            {/* Description */}
            {product.description_md && (
              <div className="prose prose-sm max-w-none">
                <p className="text-coffee-700 leading-relaxed">
                  {product.description_md}
                </p>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-coffee-900">
                כמות
              </label>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-coffee-200 space-y-3">
          {product.stock > 0 ? (
            <>
              <Button
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                הוסף לעגלה - {formatPrice(product.price_cents * quantity)}
              </Button>
              <p className="text-xs text-coffee-600 text-center">
                משלוח חינם על הזמנות מעל ₪100
              </p>
            </>
          ) : (
            <Button
              className="w-full"
              disabled
            >
              אזל מהמלאי
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
