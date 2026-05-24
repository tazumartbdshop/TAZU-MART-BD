import React from 'react';
import { Package, Search, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../store/useProductStore';
import { formatPrice } from '../../lib/utils';

export default function AdminStock() {
  const navigate = useNavigate();
  const { products } = useProductStore();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 border border-[#EEEEEE] rounded-none bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#000000]" />
          </button>
          <h3 className="text-xl font-bold text-[#000000]">Stock Management</h3>
        </div>
        <div className="bg-white border border-[#EEEEEE] px-4 py-2 rounded-none text-sm font-bold shadow-sm">
          {products.length} Products in Inventory
        </div>
      </div>

      <div className="bg-white rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#000000] text-[11px] uppercase tracking-widest font-bold border-b border-[#EEEEEE]">
                <th className="p-6">Product Name</th>
                <th className="p-6">Buying Price</th>
                <th className="p-6">Purchase Amount</th>
                <th className="p-6">Stock Quantity</th>
                <th className="p-6">Remaining Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEEE]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors text-sm">
                  <td className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-none border border-[#EEEEEE] overflow-hidden shrink-0">
                      {product.image && <img src={product.image} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div>
                      <p className="font-bold text-[#000000] line-clamp-1">{product.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">{product.sku}</p>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-[#000000] whitespace-nowrap">
                    {formatPrice(product.buyingPrice || product.price * 0.7)}
                  </td>
                  <td className="p-6 font-bold text-[#000000] whitespace-nowrap">
                    {formatPrice((product.buyingPrice || product.price * 0.7) * (product.stock + 5))}
                  </td>
                  <td className="p-6">
                    <span className="bg-[#f8f8f8] text-[#000000] px-3 py-1.5 rounded-none border border-[#EEEEEE] font-bold text-xs">
                      {product.stock + 5} PCS
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-none font-bold text-xs border ${
                      product.stock > 10 ? 'bg-green-50 text-green-700 border-green-100' : 
                      product.stock > 0 ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {product.stock} PCS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
