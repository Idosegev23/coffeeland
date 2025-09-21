'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductQuickView } from '@/components/products/ProductQuickView';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

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

interface Banner {
  id: string;
  title: string;
  body: string | null;
  cta_text: string | null;
  cta_url: string | null;
  bg_hex: string | null;
  text_hex: string | null;
  layout_mode: 'marquee' | 'bento';
  dismissible: boolean;
  active_to: string | null;
  products: Product[];
}

interface HotBannerProps {
  className?: string;
}

export function HotBanner({ className }: HotBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if banner is dismissed
    const dismissed = localStorage.getItem('banner_dismissed');
    if (dismissed) {
      const dismissedUntil = new Date(dismissed);
      if (dismissedUntil > new Date()) {
        setIsDismissed(true);
        setLoading(false);
        return;
      }
    }

    // Fetch banner data
    fetchBanner();
  }, []);

  useEffect(() => {
    if (banner?.active_to) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(banner.active_to!).getTime();
        const distance = end - now;

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [banner]);

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/hot-banner');
      const data = await response.json();
      
      if (data.success && data.banner) {
        setBanner(data.banner);
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for a week
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 7);
    localStorage.setItem('banner_dismissed', dismissUntil.toISOString());
  };

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
      const existingItem = cart.items.find((item: any) => item.ref_id === product.id && item.item_type === 'product');
      
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.items.push({
          item_type: 'product',
          ref_id: product.id,
          title_snapshot: product.title,
          unit_price_cents: product.price_cents,
          qty: 1,
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show toast notification would go here
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-tropical-600 h-24 w-full" />
    );
  }

  if (isDismissed || !banner) {
    return null;
  }

  const bannerStyle = {
    backgroundColor: banner.bg_hex || '#5f614c',
    color: banner.text_hex || '#ffffff',
  };

  if (banner.layout_mode === 'bento') {
    return (
      <div 
        className={cn('relative overflow-hidden py-6', className)}
        style={bannerStyle}
      >
        {banner.dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-10 text-current hover:bg-white/10"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{banner.title}</h2>
            {banner.body && (
              <p className="text-lg opacity-90">{banner.body}</p>
            )}
            {timeLeft && (
              <div className="flex items-center justify-center mt-3 space-x-2 rtl:space-x-reverse">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg font-bold">{timeLeft}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {banner.products.map((product) => (
              <div
                key={product.id}
                className="bg-white/10 backdrop-blur rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-200"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-24 object-cover rounded-md mb-3"
                  />
                )}
                <h3 className="font-semibold text-sm mb-2">{product.title}</h3>
                <div className="mb-3">
                  {product.compare_at_price_cents && (
                    <span className="text-xs line-through opacity-60 mr-2">
                      {formatPrice(product.compare_at_price_cents)}
                    </span>
                  )}
                  <span className="text-lg font-bold">
                    {formatPrice(product.price_cents)}
                  </span>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-white/20 border-white/30 hover:bg-white/30"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    צפה
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-white/20 hover:bg-white/30"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    הוסף
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProduct && (
          <ProductQuickView
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </div>
    );
  }

  // Marquee layout
  return (
    <div 
      className={cn('relative overflow-hidden py-3', className)}
      style={bannerStyle}
    >
      {banner.dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 left-1 z-10 text-current hover:bg-white/10"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      
      <div className="flex animate-marquee space-x-8 rtl:space-x-reverse">
        <div className="flex items-center space-x-8 rtl:space-x-reverse whitespace-nowrap">
          <span className="text-lg font-bold">{banner.title}</span>
          {banner.body && <span className="opacity-90">{banner.body}</span>}
          {timeLeft && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{timeLeft}</span>
            </div>
          )}
          {banner.products.map((product) => (
            <div key={product.id} className="flex items-center space-x-4 rtl:space-x-reverse">
              <span className="font-medium">{product.title}</span>
              <span className="text-lg font-bold">{formatPrice(product.price_cents)}</span>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/20 border-white/30 hover:bg-white/30"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                הוסף לעגלה
              </Button>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}
