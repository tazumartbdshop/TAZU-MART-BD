import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { ArrowLeft } from 'lucide-react';
import { CompactProductCard } from '../components/product/CompactProductCard';

export default function AllProducts() {
  const navigate = useNavigate();
  const { products } = useProductStore();

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [products]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="flex items-center h-14 px-4 gap-3 max-w-7xl mx-auto w-full">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-gray-900">All Products</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {sortedProducts.map((product) => (
            <CompactProductCard key={product.id} product={product} />
          ))}
          {sortedProducts.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 text-sm font-bold uppercase tracking-wider">
              No products found
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
