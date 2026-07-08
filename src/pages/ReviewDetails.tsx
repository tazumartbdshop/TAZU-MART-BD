import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import ProductReviews from '../components/product/ProductReviews';

export default function ReviewDetails() {
  const { slug: urlParam } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products } = useProductStore();

  const product = products.find(p => String(p.id) === String(urlParam) || (p.slug && p.slug === urlParam));

  return (
    <div className="bg-white min-h-screen text-zinc-900 font-sans select-none">
      <div className="border-b border-zinc-200 py-4 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate(`/product/${urlParam}`)}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-4.5 h-4.5 stroke-[3]" /> Back to {product ? product.name : 'Product'}
          </button>
          
          {product && (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">SKU: {product.sku}</span>
            </div>
          )}
        </div>
      </div>

      <ProductReviews />
    </div>
  );
}
