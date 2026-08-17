import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Percent } from 'lucide-react';
import { campaignService, Campaign } from '../services/campaignService';
import { useProductStore, Product } from '../store/useProductStore';
import ProductCard from '../components/ui/ProductCard';

export default function CampaignProductsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProductStore();
  
  const [campaign, setCampaign] = useState<any | null>(null);
  const [campaignProducts, setCampaignProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    // We fetch all active campaigns and find the one that matches.
    campaignService.getActiveCampaigns()
      .then(data => {
        const found = data.find(c => String(c.id) === String(id));
        if (found) {
          setCampaign(found);
          
          // Filter products based on selected product IDs
          const allowedIds = found.products || [];
          const filtered = products.filter(p => allowedIds.includes(String(p.id)));
          setCampaignProducts(filtered);
        } else {
          setCampaign(null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center pb-24">
         <h1 className="text-xl font-bold mb-4">Campaign Not Found</h1>
         <button onClick={() => navigate('/offers')} className="text-blue-600 underline">Back to Offers</button>
      </div>
    );
  }

  const campaignTitle = campaign.title || campaign.name || 'Campaign Offer';
  const campaignDesc = campaign.description;

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24 font-sans selection:bg-black selection:text-white">
      <div className="bg-black text-white pt-10 pb-6 px-4 relative flex flex-col items-center justify-center text-center">
        <button 
          onClick={() => navigate('/offers')}
          className="absolute left-4 top-10 p-2 hover:bg-neutral-800 rounded-full transition-all cursor-pointer text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-[#00E676] mb-1">
          {campaignTitle}
        </h1>
        {campaignDesc ? (
          <p className="text-xs text-gray-300 font-medium max-w-lg mx-auto mt-1 leading-relaxed">
            {campaignDesc}
          </p>
        ) : (
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
            Special Selected Products
          </p>
        )}
      </div>

      <div className="pt-6 px-3 sm:px-6 max-w-7xl mx-auto">
         {campaignProducts.length === 0 ? (
            <div className="text-center py-20 px-6 border border-gray-200 mt-10 bg-white rounded-xl">
               <Percent className="w-10 h-10 text-gray-300 mx-auto mb-4" />
               <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-800">No products available for this offer.</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Check back later</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
               {campaignProducts.map(product => (
                  <div key={product.id}>
                     <ProductCard product={product} />
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
}
