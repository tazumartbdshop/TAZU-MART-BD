import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, ShoppingCart, Users, LineChart, 
  Settings as SettingsIcon, Package, Bell, Search, Menu, LogOut, Activity,
  Plus, Trash2, Check, ArrowRight, Edit3, Image as ImageIcon, Sparkles, Coins
} from 'lucide-react';
import { useWebsitesStore } from '../../store/useWebsitesStore';
import { useProductStore } from '../../store/useProductStore';

export default function LiveWebsiteAdmin() {
  const { storeDomain } = useParams();
  const website = useWebsitesStore(state => state.getWebsiteByDomain(storeDomain || ''));
  const updateWebsite = useWebsitesStore(state => state.updateWebsite);
  const { products, addProduct, deleteProduct } = useProductStore();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDiscount, setNewProdDiscount] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdImg, setNewProdImg] = useState('');
  const [newProdCoins, setNewProdCoins] = useState('100');
  const [showAddForm, setShowAddForm] = useState(false);

  // Settings form local editing state initialized from store values
  const [editName, setEditName] = useState(website?.website_name || '');
  const [editBusiness, setEditBusiness] = useState(website?.business_name || '');
  const [editPhone, setEditPhone] = useState(website?.support_number || '');
  const [editEmail, setEditEmail] = useState(website?.admin_email || '');
  const [editColor, setEditColor] = useState(website?.primary_color || '#000000');
  const [editCurrency, setEditCurrency] = useState(website?.currency || 'BDT');
  const [editAddress, setEditAddress] = useState(website?.address || '');
  const [editThemeType, setEditThemeType] = useState(website?.theme_type || 'Sharp Corners (Square)');
  const [editLogo, setEditLogo] = useState(website?.logo || '');
  const [editBanner, setEditBanner] = useState(website?.banner || '');
  const [newCatInput, setNewCatInput] = useState('');
  const [editedCategories, setEditedCategories] = useState<string[]>(website?.categories || []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'settings', label: 'Store Settings', icon: SettingsIcon },
  ];

  if (!website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50">
        <h2 className="text-2xl font-black text-red-600 mb-2 font-mono uppercase">ADMIN PORTAL LOAD ERROR</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Store credentials could not be decrypted.</p>
        <Link to="/admin" className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors">
          Return To Site Builder
        </Link>
      </div>
    );
  }

  // Filter products for this specific store's categories
  const storeCategories = website.categories || [];
  const getStoreProducts = () => {
    return products.filter(p => 
      storeCategories.some(cat => cat.toLowerCase().trim() === p.category?.toLowerCase().trim())
    );
  };

  const currentProducts = getStoreProducts();

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsite(website.domain, {
      website_name: editName,
      business_name: editBusiness,
      support_number: editPhone,
      admin_email: editEmail,
      primary_color: editColor,
      currency: editCurrency,
      address: editAddress,
      theme_type: editThemeType,
      logo: editLogo,
      banner: editBanner,
      categories: editedCategories
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Add category to list helper
  const addCategoryTag = () => {
    if (newCatInput.trim() && !editedCategories.includes(newCatInput.trim())) {
      setEditedCategories([...editedCategories, newCatInput.trim()]);
      setNewCatInput('');
    }
  };

  // Remove category tag helper
  const removeCategoryTag = (catToRemove: string) => {
    setEditedCategories(editedCategories.filter(c => c !== catToRemove));
  };

  // Create Product handler
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim() || !newProdCategory.trim()) return;

    // Call state hook
    addProduct({
      name: newProdName,
      sku: 'PROD-' + Math.floor(100 + Math.random() * 900),
      category: newProdCategory,
      price: parseFloat(newProdPrice),
      discountPrice: newProdDiscount ? parseFloat(newProdDiscount) : undefined,
      stock: 50,
      image: newProdImg || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      rating: 4.8,
      reviews: 1,
      isNew: true,
      status: 'active',
      reward_coins: parseInt(newProdCoins) || 100,
      coin_enabled: true
    });

    // Reset fields
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDiscount('');
    setNewProdImg('');
    setShowAddForm(false);
    alert('Product successfully cataloged and broadcasted live!');
  };

  const currSign = editCurrency === 'USD' ? '$' : '৳';

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-black justify-between">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100 gap-2">
          {editLogo ? (
            <img src={editLogo} className="h-6 max-w-[50px] object-contain" alt="Admin logo" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-6 h-6 bg-black text-white font-black text-[10px] flex items-center justify-center">A</div>
          )}
          <div className="font-extrabold text-sm tracking-tight text-neutral-800 uppercase line-clamp-1 truncate">
            {editName || website.website_name}
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors rounded-none border ${activeTab === item.id ? 'bg-black text-white border-black' : 'text-gray-500 border-transparent hover:bg-zinc-50 hover:text-black'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
            <LogOut className="w-4 h-4 text-red-500" />
            Exit Builder
          </Link>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Workspace banner */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <Menu className="w-5 h-5 md:hidden text-gray-400" />
            <span className="text-zinc-400 font-extrabold text-[10px] uppercase tracking-widest">Enterprise Panel &gt; {activeTab}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <Link 
               to={`/site/${website.domain}`} 
               target="_blank" 
               className="text-[10px] font-black uppercase tracking-widest text-white px-4 py-2 hover:opacity-90 transition-all flex items-center gap-1.5"
               style={{ backgroundColor: editColor || '#000000' }}
             >
               View Live Site <ArrowRight className="w-3.5 h-3.5" />
             </Link>
             <div className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center font-black text-xs">
               AD
             </div>
          </div>
        </header>

        {/* Dynamic tabs viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-50 relative pb-16">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* TAB 1: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <h1 className="text-2xl font-black text-black uppercase tracking-tight">Active Analytics Overview</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time indicators & pipeline status for {website.domain}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 px-3 py-1.5 border border-emerald-200 w-max leading-none">Database Online</span>
                </div>

                {/* KPIs Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Dynamic Products', value: currentProducts.length + ' Live', trend: 'Cataloged', icon: Package, col: 'text-black' },
                    { label: 'Active Channels', value: editedCategories.length + ' Tags', trend: 'Category Sections', icon: Activity, col: 'text-blue-600' },
                    { label: 'Support hotline', value: editPhone || 'Not set', trend: 'Chat Link active', icon: Users, col: 'text-green-600' },
                    { label: 'Visitor Earn Ratio', value: '5% Coins', trend: 'Rewards Enabled', icon: Coins, col: 'text-yellow-500' }
                  ].map((k, i) => (
                    <div key={i} className="bg-white border border-gray-200 p-6 flex flex-col gap-4 shadow-sm text-left">
                      <div className="flex justify-between items-start">
                        <div className={`w-9 h-9 bg-zinc-50 border border-zinc-100 flex items-center justify-center ${k.col}`}>
                          <k.icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-50 border border-zinc-200 px-2.5 py-0.5 text-zinc-500">{k.trend}</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">{k.label}</p>
                        <p className="text-xl font-black tracking-tight">{k.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grid analytics detail and settings integration shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="md:col-span-2 bg-white border border-gray-200 p-6 shadow-sm text-left space-y-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b pb-2">Active Categories Pipeline (For Section Generation)</h3>
                     
                     <div className="space-y-3">
                       {editedCategories.map((cat, idx) => {
                         const matchLength = products.filter(p => p.category?.toLowerCase().trim() === cat.toLowerCase().trim() && p.status === 'active').length;
                         return (
                           <div key={idx} className="flex justify-between items-center bg-zinc-50 border p-3 border-zinc-200 text-sm font-bold text-gray-700">
                             <div className="flex items-center gap-2">
                               <Sparkles className="w-4 h-4" style={{ color: editColor }} />
                               <span className="uppercase text-xs">{cat} Section</span>
                             </div>
                             <div className="flex items-center gap-4">
                               <span className="text-[10px] font-black uppercase bg-white border px-2 py-0.5 text-zinc-500">{matchLength} products registered</span>
                               <span className="text-[9px] font-black uppercase text-zinc-400">Section Active</span>
                             </div>
                           </div>
                         );
                       })}
                       {editedCategories.length === 0 && (
                         <p className="text-xs font-bold text-gray-400 py-4 text-center">No catalog categories defined. The shop will render empty sections.</p>
                       )}
                     </div>
                  </div>

                  <div className="bg-zinc-900 text-white p-6 justify-between flex flex-col text-left">
                     <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Active Brand Identity</h4>
                        <div className="h-0.5 bg-zinc-800 w-12 my-3" />
                        <div className="space-y-4 text-xs font-bold text-zinc-300">
                           <div>
                             <p className="text-[9px] text-zinc-500 font-extrabold uppercase">Primary Color</p>
                             <div className="flex items-center gap-2 mt-1">
                               <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: editColor }} />
                               <span className="font-mono">{editColor}</span>
                             </div>
                           </div>

                           <div>
                             <p className="text-[9px] text-zinc-500 font-extrabold uppercase">Physical currency</p>
                             <p className="text-white mt-0.5">{editCurrency} ({currSign})</p>
                           </div>

                           <div>
                             <p className="text-[9px] text-zinc-500 font-extrabold uppercase">Physical Address</p>
                             <p className="text-white mt-0.5 max-w-[200px] truncate leading-snug">{editAddress || 'Dhaka, Bangladesh'}</p>
                           </div>
                        </div>
                     </div>

                     <button 
                       onClick={() => setActiveTab('settings')}
                       className="w-full bg-white text-black py-2.5 text-center font-black uppercase tracking-widest text-[10px] mt-8 hover:bg-zinc-150 transition-colors"
                     >
                        Edit Brand Parameters
                     </button>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: PRODUCT CATALOG */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-in fade-in duration-300 text-left">
                
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Active Live Catalog</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Manage products displayed within your custom categoric sections</p>
                  </div>
                  
                  <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ backgroundColor: editColor || '#000000' }}
                    className="text-white px-4 py-2 hover:opacity-90 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-1.5"
                  >
                    {showAddForm ? 'Cancel Form' : <><Plus className="w-4 h-4" /> Save New Item</>}
                  </button>
                </div>

                {/* Form to insert custom item to this store */}
                {showAddForm && (
                  <form onSubmit={handleCreateProduct} className="bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-2">Publish Product Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Product Title</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Elegant Fashion Shirt"
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full border border-gray-200 p-2.5 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Dynamic Category Row</label>
                        <select 
                          required
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          className="w-full border border-gray-200 p-2.5 text-xs font-bold outline-none bg-white"
                        >
                          <option value="">-- Choose Category --</option>
                          {editedCategories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Standard Selling Price ({currSign})</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="e.g. 1500"
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(e.target.value)}
                          className="w-full border border-gray-200 p-2.5 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Discount Price (Optional - Leave blank if none) ({currSign})</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 1200"
                          value={newProdDiscount}
                          onChange={(e) => setNewProdDiscount(e.target.value)}
                          className="w-full border border-gray-200 p-2.5 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Product Image URL</label>
                        <input 
                          type="url" 
                          placeholder="e.g. https://images.unsplash.com/photo-..."
                          value={newProdImg}
                          onChange={(e) => setNewProdImg(e.target.value)}
                          className="w-full border border-gray-200 p-2.5 text-xs font-bold outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Reward Coins Amount</label>
                        <input 
                          type="number" 
                          required 
                          placeholder="100"
                          value={newProdCoins}
                          onChange={(e) => setNewProdCoins(e.target.value)}
                          className="w-full border border-gray-200 p-2.5 text-xs font-bold outline-none" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      style={{ backgroundColor: editColor || '#000000' }}
                      className="text-white text-xs font-black uppercase tracking-widest px-6 py-3 hover:opacity-90"
                    >
                      Publish Item Now
                    </button>
                  </form>
                )}

                {/* Products Grid list */}
                <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b bg-zinc-50 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live catalog items ({currentProducts.length})</span>
                    <span className="text-[9px] font-black uppercase text-zinc-400">Double check categories align</span>
                  </div>

                  <div className="divide-y divide-zinc-100">
                    {currentProducts.map((p, idx) => (
                      <div key={idx} className="p-4 flex gap-4 justify-between items-center flex-wrap sm:flex-nowrap">
                         <div className="flex gap-3 items-center min-w-0">
                           <img src={p.image || null} className="w-10 h-12 object-cover shrink-0 border" alt="Catalog product" referrerPolicy="no-referrer" />
                           <div className="min-w-0">
                             <h4 className="text-xs font-black uppercase tracking-tight text-neutral-900 truncate max-w-[250px]">{p.name}</h4>
                             <p className="text-[10px] text-zinc-400 font-extrabold uppercase mt-0.5">{p.category} • SKU: {p.sku}</p>
                           </div>
                         </div>

                         <div className="flex items-center gap-8 justify-end w-full sm:w-auto">
                            <div className="text-left sm:text-right">
                              <p className="text-[8px] font-black uppercase text-zinc-400">Active Price</p>
                              <p className="text-xs font-black">
                                {currSign}{p.discountPrice || p.price}
                                {p.discountPrice && <span className="text-[10px] text-gray-400 line-through ml-1">{currSign}{p.price}</span>}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-[8px] font-black uppercase text-zinc-400">Rewards</p>
                              <p className="text-xs font-black text-yellow-500">+{p.reward_coins || 100} Coins</p>
                            </div>

                            <button 
                              onClick={() => { if(confirm('Delete product?')) deleteProduct(p.id); }}
                              className="text-zinc-300 hover:text-red-650 hover:text-red-600 p-2 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 shrink-0" />
                            </button>
                         </div>
                      </div>
                    ))}
                    {currentProducts.length === 0 && (
                      <div className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                        No custom items created. Click "Save New Item" on upper right to seed your catalogs!
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: STORESETTINGS (Allows full live workspace configuration) */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-gray-200 shadow-sm p-6 text-left space-y-6 animate-in fade-in duration-300">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">Modify Settings & Branding Parameters</h1>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Settings update live in the buyer template instantly without site rebuilding</p>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                    <Check className="w-4 h-4" /> Parameters stored successfully. Check live site!
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Website/Market Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Corporate Enterprise Name</label>
                      <input 
                        type="text" 
                        required 
                        value={editBusiness}
                        onChange={(e) => setEditBusiness(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Support Helpline (WhatsApp / Messenger)</label>
                      <input 
                        type="text" 
                        required 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Corporate Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Dynamic Currency Code</label>
                      <select 
                        value={editCurrency}
                        onChange={(e) => setEditCurrency(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white"
                      >
                        <option value="BDT">BDT (৳)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Visual Theme Corners</label>
                      <select 
                        value={editThemeType}
                        onChange={(e) => setEditThemeType(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white"
                      >
                        <option value="Sharp Corners (Square)">Sharp Corners (Square)</option>
                        <option value="Rounded Corners (Slight)">Rounded Corners (Slight)</option>
                        <option value="Capsule Corners">Capsule Corners</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Visual Theme Color HEX</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-12 h-12 border border-zinc-200 bg-white p-1 select-none cursor-pointer" 
                        />
                        <input 
                          type="text" 
                          required 
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 border border-gray-200 p-3 text-sm font-mono font-bold focus:border-black outline-none bg-white" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 font-bold">Physical Store Address</label>
                      <input 
                        type="text" 
                        required 
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white" 
                      />
                    </div>

                    {/* Logo upload fields */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Brand Favicon / Logo Link</label>
                      <input 
                        type="url" 
                        value={editLogo}
                        onChange={(e) => setEditLogo(e.target.value)}
                        placeholder="Paste image url or binary details"
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white" 
                      />
                    </div>

                    {/* Hero banner config */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Homepage Hero Banner Link</label>
                      <input 
                        type="url" 
                        value={editBanner}
                        onChange={(e) => setEditBanner(e.target.value)}
                        placeholder="Paste hero image URL"
                        className="w-full border border-gray-200 p-3 text-sm font-bold focus:border-black outline-none bg-white" 
                      />
                    </div>

                  </div>

                  {/* Dynamically configure categories row */}
                  <div className="border-t pt-6 space-y-4">
                     <div>
                       <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Catalog Category Sections Config</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Adding categories spawns a new homepage dynamic item section instantly</p>
                     </div>

                     <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={newCatInput}
                         onChange={(e) => setNewCatInput(e.target.value)}
                         placeholder="New Category Tag (e.g. Gadgets, Groceries)"
                         className="flex-1 border border-gray-200 p-3 text-sm font-bold outline-none bg-white focus:border-black" 
                       />
                       <button 
                         type="button" 
                         onClick={addCategoryTag}
                         style={{ backgroundColor: editColor || '#000000' }}
                         className="px-6 text-white font-black uppercase tracking-widest text-xs hover:opacity-90"
                       >
                         Add Tag
                       </button>
                     </div>

                     <div className="flex flex-wrap gap-2 pt-2">
                       {editedCategories.map((cat, idx) => (
                         <div key={idx} className="bg-zinc-100 border border-zinc-200 px-3 py-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-800">
                           <span>{cat}</span>
                           <button type="button" onClick={() => removeCategoryTag(cat)} className="text-zinc-400 hover:text-red-500">&times;</button>
                         </div>
                       ))}
                       {editedCategories.length === 0 && (
                         <p className="text-xs font-bold text-gray-400 py-2">Add a category to spawn display modules.</p>
                       )}
                     </div>
                  </div>

                  <div className="pt-6 border-t">
                    <button 
                      type="submit" 
                      style={{ backgroundColor: editColor || '#000000' }}
                      className="text-white text-xs font-black uppercase tracking-widest px-8 py-4 hover:opacity-95"
                    >
                      Store New parameters
                    </button>
                  </div>

                </form>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
