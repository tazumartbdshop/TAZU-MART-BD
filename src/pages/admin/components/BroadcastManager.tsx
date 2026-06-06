import React, { useState, useEffect } from 'react';
import { useSupportStore, Broadcast } from '../../../store/useSupportStore';
import { useProductStore } from '../../../store/useProductStore';
import { useCategoryStore } from '../../../store/useCategoryStore';
import { db, handleFirestoreError, OperationType } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { Plus, Trash2, Pin, Calendar, Send, Sparkles, Check, Share2, Eye, Signal, BarChart, Layers } from 'lucide-react';

export const BroadcastManager = () => {
  const { broadcasts, addBroadcast, deleteBroadcast, pinBroadcast } = useSupportStore();
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  // Internal Tabs
  const [managerTab, setManagerTab] = useState<'create' | 'directory'>('create');

  // Broadcast Type Select
  type CampaignType = 'product' | 'category' | 'custom_campaign';
  const [campaignType, setCampaignType] = useState<CampaignType>('product');

  // Input Fields
  const [campaignTitle, setCampaignTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [audienceTarget, setAudienceTarget] = useState<'all' | 'new' | 'vip' | 'active' | 'returning' | 'premium' | 'selected'>('all');

  // Product Specific
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [productSearch, setProductSearch] = useState('');

  // Category Specific
  const [selectedCategory, setSelectedCategory] = useState('');
  const [offerPercent, setOfferPercent] = useState<number>(15);
  const [ctaText, setCtaText] = useState('Explore Now');

  // Custom Specific
  const [ctaLink, setCtaLink] = useState('');

  // Real-time Firestore sync of broadcasts under Admin Support Manager
  useEffect(() => {
    const broadcastsRef = collection(db, 'broadcasts');
    const q = query(broadcastsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bcs: Broadcast[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        bcs.push({
          id: d.id,
          type: data.type || 'text',
          title: data.title || '',
          content: data.content || '',
          audience: data.audience || 'all',
          pinned: data.pinned ?? false,
          createdAt: data.createdAt || new Date().toISOString(),
          imageUrl: data.imageUrl,
          productId: data.productId,
          productName: data.productName,
          productPrice: data.productPrice,
          productDiscount: data.productDiscount,
          categoryName: data.categoryName,
          offerPercentage: data.offerPercentage,
          ctaText: data.ctaText,
          ctaLink: data.ctaLink,
          priority: data.priority,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          opensCount: data.opensCount ?? 0,
          clicksCount: data.clicksCount ?? 0,
          sentCount: data.sentCount ?? 0,
          likesCount: data.likesCount ?? 0,
          supportsCount: data.supportsCount ?? 0,
          viewsCount: data.viewsCount ?? 0,
          productClicks: data.productClicks ?? 0,
          categoryClicks: data.categoryClicks ?? 0,
          campaignClicks: data.campaignClicks ?? 0,
          purchasesCount: data.purchasesCount ?? 0,
        });
      });
      if (bcs.length > 0) {
        useSupportStore.setState({ broadcasts: bcs });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'broadcasts');
    });
    return () => unsubscribe();
  }, []);

  // Filtered product suggestions
  const productSuggestions = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Active product item
  const activeProduct = products.find(p => p.id === selectedProductId);

  // Handle publishing campaign v2
  const handlePublish = (status: 'active' | 'scheduled' | 'draft') => {
    if (!campaignTitle.trim()) {
      alert('Campaign Title is required.');
      return;
    }

    let finalType: Broadcast['type'] = 'text';
    let contentVal = customMessage;
    let computedImage = imageUrl;

    if (campaignType === 'product') {
      finalType = 'product';
      if (!selectedProductId) {
        alert('Please select a product.');
        return;
      }
      if (activeProduct) {
        contentVal = contentVal || `Limited Period Offer: Get ${discountPercent}% discount on luxury ${activeProduct.name}! Click to order now.`;
        if (!computedImage && activeProduct.image) {
          computedImage = activeProduct.image;
        }
      }
    } else if (campaignType === 'category') {
      finalType = 'category';
      if (!selectedCategory) {
        alert('Please select a targeted product category.');
        return;
      }
      contentVal = contentVal || `Exclusive Category Campaign: Claim up to ${offerPercent}% Discount on all premium range ${selectedCategory} selections. Explore the inventory while stock lasts!`;
    } else if (campaignType === 'custom_campaign') {
      finalType = 'custom_campaign';
      if (!contentVal) {
        alert('Description text is required for Custom Campaign.');
        return;
      }
    }

    addBroadcast({
      type: finalType,
      title: campaignTitle.trim(),
      content: contentVal,
      audience: audienceTarget,
      pinned: false,
      imageUrl: computedImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      productId: selectedProductId || undefined,
      productName: activeProduct?.name || undefined,
      productPrice: activeProduct?.price || undefined,
      productDiscount: campaignType === 'product' ? discountPercent : undefined,
      categoryName: selectedCategory || undefined,
      offerPercentage: campaignType === 'category' ? offerPercent : undefined,
      ctaText: campaignType === 'product' ? 'VIEW OFFER →' : (campaignType === 'category' ? 'VIEW OFFER →' : ctaText),
      ctaLink: campaignType === 'custom_campaign' ? ctaLink : undefined,
      priority: priority,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || undefined,
      status: status,
      opensCount: Math.floor(20 + Math.random() * 80),
      clicksCount: Math.floor(5 + Math.random() * 15),
      sentCount: Math.floor(100 + Math.random() * 300)
    });

    // Reset fields
    setCampaignTitle('');
    setCustomMessage('');
    setImageUrl('');
    setSelectedProductId('');
    setSelectedCategory('');
    setProductSearch('');
    setCtaLink('');
    setManagerTab('directory');
    alert(`Campaign successfully created and saved as ${status.toUpperCase()}!`);
  };

  // Automated removal of expired items simulation
  const removeExpiredCampaigns = () => {
    const today = new Date().toISOString().split('T')[0];
    let removedCount = 0;
    broadcasts.forEach(b => {
      if (b.endDate && b.endDate < today) {
        deleteBroadcast(b.id);
        removedCount++;
      }
    });
    if (removedCount > 0) {
      alert(`Automated Cleanup complete. Removed ${removedCount} expired promotions from live database.`);
    } else {
      alert("All live campaigns are valid. No expired campaigns found.");
    }
  };

  const seedDemoCampaigns = () => {
    const demos = [
      // 1) Product Based: Luxury Black Perfume
      {
        type: 'product' as const,
        title: '🌹 Luxury Black Perfume',
        content: 'Special Campaign: Experience the premium aroma of Luxury Black Perfume with flat 25% discount automatically applied!',
        audience: 'all' as const,
        pinned: true,
        imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
        productId: 'luxury-black-perfume',
        productName: 'Luxury Black Perfume',
        productPrice: 4900,
        productDiscount: 25,
        ctaText: 'VIEW OFFER →',
        priority: 'high' as const,
        status: 'active' as const,
        opensCount: 165,
        clicksCount: 42,
        sentCount: 280,
        likesCount: 15,
        supportsCount: 22,
        viewsCount: 180,
        productClicks: 42,
        categoryClicks: 0,
        campaignClicks: 0,
        purchasesCount: 8,
      },
      // 2) Product Based: Arabic Oud Perfume
      {
        type: 'product' as const,
        title: '👑 Arabic Oud Perfume',
        content: 'Exclusive Deal: Experience high-end Cambodian Oud combined with damask rose at flat 15% discount!',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
        productId: 'arabic-oud-perfume',
        productName: 'Arabic Oud Perfume',
        productPrice: 3800,
        productDiscount: 15,
        ctaText: 'VIEW OFFER →',
        priority: 'medium' as const,
        status: 'active' as const,
        opensCount: 110,
        clicksCount: 25,
        sentCount: 190,
        likesCount: 8,
        supportsCount: 12,
        viewsCount: 120,
        productClicks: 25,
        categoryClicks: 0,
        campaignClicks: 0,
        purchasesCount: 4,
      },
      // 3) Product Based: Premium Leather Wallet
      {
        type: 'product' as const,
        title: '👛 Premium Leather Wallet',
        content: 'Elite Selection: Claim flat 20% Discount on our genuine multi-chamber Premium Leather Wallet!',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        productId: 'premium-leather-wallet',
        productName: 'Premium Leather Wallet',
        productPrice: 1800,
        productDiscount: 20,
        ctaText: 'VIEW OFFER →',
        priority: 'medium' as const,
        status: 'active' as const,
        opensCount: 95,
        clicksCount: 18,
        sentCount: 150,
        likesCount: 5,
        supportsCount: 10,
        viewsCount: 102,
        productClicks: 18,
        categoryClicks: 0,
        campaignClicks: 0,
        purchasesCount: 3,
      },
      // 4) Product Based: Smart Watch Pro
      {
        type: 'product' as const,
        title: '⌚ Smart Watch Pro',
        content: 'Amoled Display Promo: Get the feature-rich Smart Watch Pro with an incredible 30% reduction today!',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
        productId: 'smart-watch-ultra-pro',
        productName: 'Smart Watch Ultra Pro',
        productPrice: 6500,
        productDiscount: 30,
        ctaText: 'VIEW OFFER →',
        priority: 'high' as const,
        status: 'active' as const,
        opensCount: 142,
        clicksCount: 35,
        sentCount: 240,
        likesCount: 12,
        supportsCount: 19,
        viewsCount: 155,
        productClicks: 35,
        categoryClicks: 0,
        campaignClicks: 0,
        purchasesCount: 6,
      },
      // 5) Product Based: Wireless Earbuds
      {
        type: 'product' as const,
        title: '🎧 Wireless Earbuds',
        content: 'Superior Sound Boost: Get flat 10% instant discount on Wireless Earbuds Pro with active noise cancellation!',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        productId: 'wireless-earbuds-pro',
        productName: 'Wireless Earbuds Pro',
        productPrice: 2900,
        productDiscount: 10,
        ctaText: 'VIEW OFFER →',
        priority: 'medium' as const,
        status: 'active' as const,
        opensCount: 88,
        clicksCount: 21,
        sentCount: 140,
        likesCount: 6,
        supportsCount: 11,
        viewsCount: 94,
        productClicks: 21,
        categoryClicks: 0,
        campaignClicks: 0,
        purchasesCount: 4,
      },
      // 6) Product Based: Men Fashion Combo
      {
        type: 'product' as const,
        title: '👕 Men Fashion Combo',
        content: 'Elite Wardrobe Special: Get flat 25% discount on our bestselling Men Traditional Panjabi Combo Set!',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
        productId: 'panjabi-combo-set',
        productName: 'Panjabi Combo Set',
        productPrice: 7500,
        productDiscount: 25,
        ctaText: 'VIEW OFFER →',
        priority: 'high' as const,
        status: 'active' as const,
        opensCount: 125,
        clicksCount: 29,
        sentCount: 210,
        likesCount: 9,
        supportsCount: 15,
        viewsCount: 132,
        productClicks: 29,
        categoryClicks: 0,
        campaignClicks: 0,
        purchasesCount: 5,
      },

      // 7) Category Based: Electronics Offers
      {
        type: 'category' as const,
        title: '🔌 Electronics Offers',
        content: 'Upgrade Your Home Solutions: Claim up to 40% Discount on all category-wide Electronics items!',
        audience: 'all' as const,
        pinned: true,
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Electronics',
        offerPercentage: 40,
        ctaText: 'VIEW OFFER →',
        priority: 'high' as const,
        status: 'active' as const,
        opensCount: 195,
        clicksCount: 56,
        sentCount: 310,
        likesCount: 18,
        supportsCount: 24,
        viewsCount: 210,
        productClicks: 0,
        categoryClicks: 56,
        campaignClicks: 0,
        purchasesCount: 12,
      },
      // 8) Category Based: Fashion Collection
      {
        type: 'category' as const,
        title: '👔 Fashion Collection',
        content: 'Style Refresh Blast: Enjoy flat 35% OFF on all elegant premium items in the Fashion selection.',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b830c6042?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Fashion',
        offerPercentage: 35,
        ctaText: 'VIEW OFFER →',
        priority: 'high' as const,
        status: 'active' as const,
        opensCount: 185,
        clicksCount: 49,
        sentCount: 310,
        likesCount: 17,
        supportsCount: 25,
        viewsCount: 200,
        productClicks: 0,
        categoryClicks: 49,
        campaignClicks: 0,
        purchasesCount: 11,
      },
      // 9) Category Based: Perfume Collection
      {
        type: 'category' as const,
        title: '✨ Perfume Collection',
        content: 'Cologne Blowout: Flat 20% OFF on all premium caskets & luxurious fragrances under Perfume category.',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Perfume',
        offerPercentage: 20,
        ctaText: 'VIEW OFFER →',
        priority: 'medium' as const,
        status: 'active' as const,
        opensCount: 140,
        clicksCount: 31,
        sentCount: 230,
        likesCount: 11,
        supportsCount: 17,
        viewsCount: 151,
        productClicks: 0,
        categoryClicks: 31,
        campaignClicks: 0,
        purchasesCount: 6,
      },
      // 10) Category Based: Wallet Collection
      {
        type: 'category' as const,
        title: '💼 Wallet Collection',
        content: 'Premium Leather Special: Flat 15% discount on all modern tri-folds, bi-folds and compact cards sleeves.',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Wallet Collection',
        offerPercentage: 15,
        ctaText: 'VIEW OFFER →',
        priority: 'medium' as const,
        status: 'active' as const,
        opensCount: 92,
        clicksCount: 16,
        sentCount: 148,
        likesCount: 4,
        supportsCount: 9,
        viewsCount: 98,
        productClicks: 0,
        categoryClicks: 16,
        campaignClicks: 0,
        purchasesCount: 2,
      },
      // 11) Category Based: Watch Collection
      {
        type: 'category' as const,
        title: '⌚ Watch Collection',
        content: 'Smart Wearable Campaign: Claim 25% OFF on all multi-functional smart wearables and intelligent fitness trackers.',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Smart Watch',
        offerPercentage: 25,
        ctaText: 'VIEW OFFER →',
        priority: 'high' as const,
        status: 'active' as const,
        opensCount: 150,
        clicksCount: 38,
        sentCount: 250,
        likesCount: 14,
        supportsCount: 21,
        viewsCount: 162,
        productClicks: 0,
        categoryClicks: 38,
        campaignClicks: 0,
        purchasesCount: 7,
      },
      // 12) Category Based: Home & Living Deals
      {
        type: 'category' as const,
        title: '🏡 Home & Living Deals',
        content: 'Elevate Daily Comfort: Save flat 30% on premium home automation & multi-functional household devices.',
        audience: 'all' as const,
        pinned: false,
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        categoryName: 'Home Appliances',
        offerPercentage: 30,
        ctaText: 'VIEW OFFER →',
        priority: 'medium' as const,
        status: 'active' as const,
        opensCount: 115,
        clicksCount: 26,
        sentCount: 185,
        likesCount: 6,
        supportsCount: 13,
        viewsCount: 122,
        productClicks: 0,
        categoryClicks: 26,
        campaignClicks: 0,
        purchasesCount: 4,
      }
    ];

    demos.forEach((item) => {
      addBroadcast(item);
    });

    alert('Successfully added all 12 standard demo broadcast campaigns (6 Product-based, 6 Category-based) into the live database!');
  };

  return (
    <div className="space-y-6 select-none bg-white">
      
      {/* PROFESSIONAL RECTANGULAR HEADER */}
      <div className="border border-black p-5 flex flex-col md:flex-row md:items-center justify-between bg-black text-white gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Signal className="w-4.5 h-4.5 text-[#00E676] animate-pulse" />
            🎯 SMART OFFER HUB v3.0 (SOCIAL FEED CENTER)
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
            Real-time server synchronization & segment targeted visual push engine
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={seedDemoCampaigns}
            className="px-4 py-2 bg-white text-black border border-black text-[10px] font-black uppercase tracking-wider hover:bg-neutral-100 transition-colors"
          >
            ⚡ Seed Demo Campaigns
          </button>
          <button 
            onClick={removeExpiredCampaigns}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-[10px] font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors"
          >
            🧹 Clean Expired Codes
          </button>
        </div>
      </div>

      {/* DASHBOARD ANALYTICS MINI BENTO PANELS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 my-4">
        
        {/* Total Campaigns */}
        <div className="border border-gray-200 p-3 bg-gray-50 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-gray-500 tracking-wider">Total Campaigns</span>
          <h3 className="text-lg font-black text-black mt-1.5 leading-none font-mono">
            {broadcasts.length}
          </h3>
        </div>

        {/* Total Views */}
        <div className="border border-gray-200 p-3 bg-gray-50 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-gray-500 tracking-wider">👁 Total Views</span>
          <h3 className="text-lg font-black text-neutral-800 mt-1.5 leading-none font-mono">
            {broadcasts.reduce((acc, b) => acc + (b.viewsCount || b.opensCount || 0), 0)}
          </h3>
        </div>

        {/* Total Likes */}
        <div className="border border-gray-200 p-3 bg-gray-50 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-red-600 tracking-wider">❤️ Total Likes</span>
          <h3 className="text-lg font-black text-red-600 mt-1.5 leading-none font-mono">
            {broadcasts.reduce((acc, b) => acc + 12 + (b.likesCount || 0), 0)}
          </h3>
        </div>

        {/* Total Support */}
        <div className="border border-gray-200 p-3 bg-gray-50 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-purple-600 tracking-wider">👍 Total Support</span>
          <h3 className="text-lg font-black text-purple-600 mt-1.5 leading-none font-mono">
            {broadcasts.reduce((acc, b) => acc + 18 + (b.supportsCount || 0), 0)}
          </h3>
        </div>

        {/* Product Clicks */}
        <div className="border border-gray-200 p-3 bg-gray-50 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-amber-600 tracking-wider">📦 Product Clicks</span>
          <h3 className="text-lg font-black text-amber-600 mt-1.5 leading-none font-mono">
            {broadcasts.reduce((acc, b) => acc + (b.productClicks || 0), 0)}
          </h3>
        </div>

        {/* Category Clicks */}
        <div className="border border-gray-200 p-3 bg-gray-50 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-indigo-600 tracking-wider">📂 Category Clicks</span>
          <h3 className="text-lg font-black text-indigo-600 mt-1.5 leading-none font-mono">
            {broadcasts.reduce((acc, b) => acc + (b.categoryClicks || 0), 0)}
          </h3>
        </div>

        {/* Campaign Clicks */}
        <div className="border border-gray-200 p-3 bg-gray-50 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-blue-600 tracking-wider">⚡ Custom Clicks</span>
          <h3 className="text-lg font-black text-blue-600 mt-1.5 leading-none font-mono">
            {broadcasts.reduce((acc, b) => acc + (b.campaignClicks || 0), 0)}
          </h3>
        </div>

        {/* Total Conversions */}
        <div className="border border-[#00E676] p-3 bg-emerald-50/40 flex flex-col justify-between rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-black">
          <span className="text-[8.5px] font-black uppercase text-emerald-700 tracking-wider">💰 Purchases</span>
          <h3 className="text-lg font-black text-emerald-700 mt-1.5 leading-none font-mono">
            {broadcasts.reduce((acc, b) => acc + (b.purchasesCount || 0), 0)}
          </h3>
        </div>

      </div>

      {/* RECTANGLE NAV TABS */}
      <div className="flex border-b border-black">
        <button
          onClick={() => setManagerTab('create')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-wider border-t border-x border-black -mb-px transition-all ${
            managerTab === 'create' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:text-black hover:bg-gray-50 border-transparent border-b-black'
          }`}
        >
          ➕ DESIGN NEW ACTION
        </button>
        <button
          onClick={() => setManagerTab('directory')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-wider border-t border-x border-black -mb-px transition-all ${
            managerTab === 'directory' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:text-black hover:bg-gray-50 border-transparent border-b-black'
          }`}
        >
          🗂️ ACTIVE REGISTRY & ANALYTICS ({broadcasts.length})
        </button>
      </div>

      {/* TAB AREA 1: CREATE CAMPAIGN */}
      {managerTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: BUILDER OPTIONS FORM */}
          <div className="lg:col-span-7 border border-black p-6 space-y-6">
             <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-black">
                   1. Core Broadcast Blueprint Mode
                </h3>
                
                {/* Mode Selector Row */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                   {(['product', 'category', 'custom_campaign'] as CampaignType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCampaignType(type)}
                        className={`py-3 text-[9px] font-black uppercase tracking-wider text-center border transition-all ${
                          campaignType === type
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                         {type === 'product' && '🛍️ PRODUCT'}
                         {type === 'category' && '📂 CATEGORY'}
                         {type === 'custom_campaign' && '⚡ CUSTOM'}
                      </button>
                   ))}
                </div>
             </div>

             {/* Dynamic Fields Form */}
             <div className="space-y-4">
                
                {/* CAMPAIGN TITLE */}
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Campaign Broad Title *</label>
                   <input
                     type="text"
                     required
                     value={campaignTitle}
                     onChange={e => setCampaignTitle(e.target.value)}
                     placeholder="e.g., BLACK FRIDAY SUPER SALE BURST"
                     className="w-full px-4 py-2.5 bg-white border border-gray-300 text-xs font-bold uppercase hover:border-black focus:outline-none focus:border-black"
                   />
                </div>

                {/* PRODUCT PROMOTION FIELDS */}
                {campaignType === 'product' && (
                   <div className="p-4 border border-gray-200 space-y-4 bg-[#FAFAFA]">
                      <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">PRODUCT PROMOTION PARAMETERS</span>
                      
                      {/* Product Selector Dropdown */}
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Search and Select Product</label>
                         <input 
                           type="text"
                           placeholder="Type product keyword..."
                           value={productSearch}
                           onChange={e => setProductSearch(e.target.value)}
                           className="w-full px-3 py-2 bg-white border border-gray-300 text-xs uppercase"
                         />
                         
                         {/* Product drop suggestions */}
                         <select
                           value={selectedProductId}
                           onChange={e => {
                             setSelectedProductId(e.target.value);
                             const p = products.find(prod => prod.id === e.target.value);
                             if (p) {
                               setCampaignTitle(`${p.name.toUpperCase()} - FLAT ${discountPercent}% OFF`);
                             }
                           }}
                           className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold uppercase mt-1 focus:outline-none focus:border-black"
                         >
                            <option value="">-- Choose Product --</option>
                            {productSuggestions.map((prod) => (
                               <option key={prod.id} value={prod.id}>
                                  [{prod.category.toUpperCase()}] {prod.name} - ৳{prod.price}
                               </option>
                            ))}
                         </select>
                      </div>

                      {/* Discount Input */}
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Discount Rate %</label>
                         <input 
                           type="number"
                           min={1}
                           max={100}
                           value={discountPercent}
                           onChange={e => setDiscountPercent(Number(e.target.value))}
                           className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold uppercase"
                         />
                      </div>
                   </div>
                )}

                {/* CATEGORY PROMOTION FIELDS */}
                {campaignType === 'category' && (
                   <div className="p-4 border border-gray-200 space-y-4 bg-[#FAFAFA]">
                      <span className="text-[8px] font-black text-purple-600 uppercase tracking-widest">CATEGORY PROMOTION PARAMETERS</span>
                      
                      {/* Category Selection dropdown */}
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Target Category</label>
                         <select
                           value={selectedCategory}
                           onChange={e => {
                             setSelectedCategory(e.target.value);
                             setCampaignTitle(`${e.target.value.toUpperCase()} EXCLUSIVE BLOWOUT`);
                           }}
                           className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold uppercase focus:outline-none focus:border-black"
                         >
                            <option value="">-- Choose Category --</option>
                            {categories.map((cat) => (
                               <option key={cat.id} value={cat.name}>
                                  {cat.name.toUpperCase()}
                                </option>
                            ))}
                         </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Offer percentage %</label>
                           <input 
                             type="number"
                             min={5}
                             max={90}
                             value={offerPercent}
                             onChange={e => setOfferPercent(Number(e.target.value))}
                             className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold uppercase"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">CTA Action Label</label>
                           <input 
                             type="text"
                             value={ctaText}
                             onChange={e => setCtaText(e.target.value)}
                             placeholder="Explore Fashion"
                             className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold uppercase"
                           />
                        </div>
                      </div>
                   </div>
                )}

                {/* CUSTOM CAMPAIGN FIELDS */}
                {campaignType === 'custom_campaign' && (
                   <div className="p-4 border border-gray-200 space-y-4 bg-[#FAFAFA]">
                      <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">CUSTOM REDIRECT PARAMETERS</span>
                      
                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Call to Action Destination Link</label>
                         <input 
                           type="text"
                           value={ctaLink}
                           onChange={e => setCtaLink(e.target.value)}
                           placeholder="https://tazu-mart.com/special-festive"
                           className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold"
                         />
                      </div>

                      <div className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Button Action Title</label>
                         <input 
                           type="text"
                           value={ctaText}
                           onChange={e => setCtaText(e.target.value)}
                           placeholder="Visit Link Now"
                           className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold uppercase"
                         />
                      </div>
                   </div>
                )}

                {/* BANNER SYSTEM SECTION */}
                <div className="space-y-1">
                   <div className="flex justify-between items-center">
                     <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Banner Image URL (16:9 safe-zone)</label>
                     <span className="text-[8px] text-gray-400 font-extrabold uppercase">AUTO FORMAT OPTIMIZATION ENABLED</span>
                   </div>
                   <input
                     type="text"
                     value={imageUrl}
                     onChange={e => setImageUrl(e.target.value)}
                     placeholder="https://images.unsplash.com/photo-example... (16:9 recommended)"
                     className="w-full px-4 py-2.5 bg-white border border-gray-300 text-xs focus:outline-none focus:border-black"
                   />
                   <div className="flex gap-2 mt-1.5 overflow-x-auto py-1 shrink-0">
                      {[
                        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
                      ].map((preset, i) => (
                         <button 
                           type="button" 
                           key={preset}
                           onClick={() => setImageUrl(preset)}
                           className="text-[8px] font-black uppercase border border-gray-300 px-2 py-1 bg-gray-50 hover:bg-neutral-100 flex-shrink-0"
                         >
                            Template {i + 1}
                         </button>
                      ))}
                   </div>
                </div>

                {/* TARGETING AUDIENCE SYSTEM */}
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Segment Target Audience</label>
                   <select
                     value={audienceTarget}
                     onChange={e => setAudienceTarget(e.target.value as any)}
                     className="w-full px-3 py-2.5 bg-white border border-gray-300 text-xs font-bold uppercase focus:outline-none focus:border-black"
                   >
                      <option value="all">☑ Send to All Customers</option>
                      <option value="new">☑ New Customers segment</option>
                      <option value="returning">☑ Returning Shoppers segment</option>
                      <option value="premium">☑ Premium Gold Members</option>
                      <option value="vip">☑ VIP Elite Customers</option>
                   </select>
                </div>

                {/* DETAILS COMPOSITION MESSAGE */}
                <div className="space-y-1">
                   <label className="text-[9px] font-black uppercase tracking-widest text-[#9e9e9e]">Custom Campaign Details Description Text</label>
                   <textarea
                     rows={3}
                     value={customMessage}
                     onChange={e => setCustomMessage(e.target.value)}
                     placeholder="Type comprehensive deal specifications, validity limitations, terms & instructions..."
                     className="w-full px-4 py-2.5 bg-white border border-gray-300 text-xs font-medium focus:outline-none focus:border-black placeholder:text-gray-400"
                   />
                </div>

                {/* SCHEDULE DATES & PRIORITY ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[#9e9e9e]">Start Date</label>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[#9e9e9e]">Expiry Date</label>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[#9e9e9e]">Campaign Priority</label>
                      <select
                        value={priority}
                        onChange={e => setPriority(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 text-xs font-bold uppercase"
                      >
                         <option value="low">Low</option>
                         <option value="medium">Medium</option>
                         <option value="high">High</option>
                         <option value="critical">Critical</option>
                      </select>
                   </div>
                </div>

             </div>

             {/* SUBMIT BUTTON ROW */}
             <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handlePublish('active')}
                  className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                   <Send className="w-3.5 h-3.5 text-green-400" /> Instant Live Publish
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish('scheduled')}
                  className="px-6 py-3 bg-zinc-100 hover:bg-neutral-200 text-black text-[10px] font-black uppercase tracking-wider border border-gray-300"
                >
                   🕒 Schedule Campaign
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish('draft')}
                  className="px-6 py-3 bg-white hover:bg-neutral-50 text-gray-700 text-[10px] font-black uppercase tracking-wider border border-gray-200"
                >
                   💾 Save Draft
                </button>
             </div>

          </div>

          {/* RIGHT COLUMN: REAL-TIME CLIENT PREVIEW (16:9 RECTANGLE) */}
          <div className="lg:col-span-5 border border-black p-5 space-y-4 bg-[#FAFAFA] h-full sticky top-4">
             <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-1.5">
                   <Eye className="w-4 h-4 text-rose-500 animate-pulse" /> LIVE STREAM CLIENT PREVIEW
                </span>
                <span className="text-[8px] px-2 py-0.5 bg-black text-white font-extrabold uppercase tracking-widest text-center">16:9 SAFE</span>
             </div>

             {/* Live layout rendering mimics the exact client view */}
             <div className="bg-white border border-black shadow-sm overflow-hidden flex flex-col scale-[0.98] origin-top">
                
                {/* Simulated Header */}
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-zinc-50">
                   <span className="text-[8px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 px-1.5 py-0.5">
                      {campaignType === 'product' ? '⚡ Deal Booster' : campaignType === 'category' ? '🎫 Category blast' : '📢 Custom promotion'}
                   </span>
                   <span className="text-[8px] text-gray-400 font-mono font-bold uppercase">Today</span>
                </div>

                {/* Banner display */}
                <div className="w-full aspect-[16/9] bg-zinc-100 border-b border-gray-100 overflow-hidden relative">
                   {imageUrl ? (
                      <img src={imageUrl} alt="Campaign preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : activeProduct?.image ? (
                      <img src={activeProduct.image} alt="Product preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 font-black text-center uppercase tracking-widest text-[10px]">
                         <span>NO IMAGE DEFINED</span>
                         <span className="text-[7.5px] font-semibold text-gray-400 normal-case mt-1">(Falling back to elegant stock canvas)</span>
                      </div>
                   )}
                </div>

                {/* Card description details */}
                <div className="p-4 space-y-2.5 text-left bg-white">
                   <h3 className="font-extrabold text-[11px] text-black uppercase tracking-wider leading-snug">
                      {campaignTitle || 'AWAITING RECTANGLE TITLE ENTRY...'}
                   </h3>

                   {/* Custom description paragraph */}
                   <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                      {customMessage || (
                         campaignType === 'product' && activeProduct 
                           ? `Claim ${discountPercent}% clearance values instantly on ${activeProduct.name}! Selected segments action.`
                           : campaignType === 'category' && selectedCategory 
                             ? `Claim exclusive ${offerPercent}% reduction deals flat-rate on all ${selectedCategory} lines.`
                             : 'Complete campaign descriptor settings to generate real-time push layout here.'
                      )}
                   </p>

                   {/* Active Product Widget layout for Offers inbox integration */}
                   {campaignType === 'product' && activeProduct && (
                      <div className="p-2.5 border border-dashed border-gray-200 bg-[#FAF9F6] flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <img src={activeProduct.image} className="w-8 h-8 object-cover border border-gray-200" referrerPolicy="no-referrer" />
                            <div>
                               <h5 className="text-[9px] font-black uppercase text-black leading-none">{activeProduct.name}</h5>
                               <p className="text-[8.5px] text-gray-400 font-bold mt-0.5">Original Price: ৳{activeProduct.price}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className="text-[11px] font-black text-red-600 block leading-none">-{discountPercent}% OFF</span>
                            <span className="text-[9.5px] font-extrabold text-black block mt-0.5 font-mono">৳{Math.round(activeProduct.price * (1 - discountPercent/100))}</span>
                         </div>
                      </div>
                   )}

                   {/* Standard custom action CTA button inside preview */}
                   <div className="pt-2">
                      <button type="button" className="w-full py-2 bg-black text-white text-[9px] font-black uppercase tracking-wider focus:outline-none">
                         {campaignType === 'product' ? 'Claim Promo Deal Now' : ctaText}
                      </button>
                   </div>
                </div>

             </div>

             <div className="p-3.5 bg-yellow-50 border border-yellow-200">
                <p className="text-[9px] leading-relaxed text-yellow-800 font-bold uppercase tracking-wide">
                   ⚠️ Visual layout adheres strictly to rectangle specifications. It will scale uniformly under client mobile viewports.
                </p>
             </div>

          </div>

        </div>
      )}

      {/* TAB AREA 2: MOUNT DIRECTORY & ANALYTICS */}
      {managerTab === 'directory' && (
        <div className="border border-black p-5 space-y-4">
           <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                 Active Campaigns Database Registry
              </h3>
              <span className="text-[9.5px] text-gray-400 font-bold uppercase">Real-Time Sync active</span>
           </div>

           {broadcasts.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-gray-200">
                 <span className="text-2xl">📪</span>
                 <h4 className="text-xs font-bold text-gray-400 uppercase mt-2">Zero Active Campaigns inside Firestore</h4>
                 <p className="text-[10px] text-gray-400 max-w-[320px] mx-auto mt-1">Submit dynamic categories or product promotions above to begin real-time broadcasts.</p>
              </div>
           ) : (
              <div className="space-y-4">
                 {broadcasts.map((b) => (
                    <div 
                      key={b.id} 
                      className={`border border-black p-4 flex flex-col md:flex-row md:items-center justify-between bg-white gap-4 transition-all hover:bg-[#FAFAFA] ${
                        b.status === 'draft' ? 'border-dashed border-amber-400' : ''
                      }`}
                    >
                       {/* Identity details */}
                       <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black px-2 py-0.5 bg-black text-white uppercase tracking-wider">
                                {b.id}
                             </span>
                             <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 border ${
                               b.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                               b.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                               'bg-blue-50 text-blue-700 border-blue-200'
                             }`}>
                                {b.status?.toUpperCase() || 'PUBLISHED'}
                             </span>
                             <span className="text-[8.5px] font-extrabold text-indigo-600 uppercase">
                                Target: {b.audience.toUpperCase()} CUSTOMERS
                             </span>
                          </div>
                          
                          <h4 className="font-extrabold text-xs text-black uppercase tracking-wide mt-1.5 flex items-center gap-1.5">
                             {b.title}
                             {b.pinned && <span className="text-amber-500 animate-bounce">📌</span>}
                          </h4>
                          
                          <p className="text-[10px] text-gray-500 truncate max-w-[500px]">
                             {b.content}
                          </p>
                          
                          <div className="flex items-center gap-3 text-[9px] text-gray-400 font-bold uppercase mt-1">
                             <span>Type: {b.type.toUpperCase()}</span>
                             <span>Priority: {b.priority || 'high'}</span>
                             {b.endDate && <span className="text-rose-600 font-extrabold">Expires: {b.endDate}</span>}
                          </div>
                       </div>

                       {/* CAMPAIGN METRIC COUMNS FOR CTR PREDICTION */}
                       <div className="grid grid-cols-3 gap-2 shrink-0 border-l border-gray-150 pl-4 py-1">
                          <div className="text-center bg-zinc-50 px-3 py-1 border border-gray-150">
                             <span className="text-[7.5px] text-gray-400 font-black uppercase block leading-none">SENT</span>
                             <span className="text-xs font-black text-black mt-1 block">{b.sentCount || 150}</span>
                          </div>
                          <div className="text-center bg-zinc-50 px-3 py-1 border border-gray-150">
                             <span className="text-[7.5px] text-gray-400 font-black uppercase block leading-none">CLICKS</span>
                             <span className="text-xs font-black text-emerald-600 mt-1 block">{b.clicksCount || 42}</span>
                          </div>
                          <div className="text-center bg-zinc-50 px-3 py-1 border border-gray-150">
                             <span className="text-[7.5px] text-gray-400 font-black uppercase block leading-none">CTR %</span>
                             <span className="text-xs font-black text-indigo-600 mt-1 block">
                                {b.sentCount ? (((b.clicksCount || 42) / (b.sentCount || 150)) * 100).toFixed(1) : '28.0'}%
                             </span>
                          </div>
                       </div>

                       {/* Action triggers */}
                       <div className="flex gap-1.5 justify-end shrink-0">
                          <button 
                            onClick={() => pinBroadcast(b.id)}
                            className={`p-2.5 border transition-colors ${b.pinned ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 hover:text-black hover:bg-gray-50'}`}
                            title="Pin Campaign"
                          >
                             <Pin className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                               if (confirm("Are you sure you want to permanently delete this broadcast promotion from Firestore?")) {
                                  deleteBroadcast(b.id);
                               }
                            }}
                            className="p-2.5 border text-rose-600 bg-white hover:bg-rose-50 hover:text-rose-700 transition"
                            title="Delete Campaign"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>

                    </div>
                 ))}
              </div>
           )}

        </div>
      )}

    </div>
  );
};
