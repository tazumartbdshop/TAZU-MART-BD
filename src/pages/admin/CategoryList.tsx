import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, ChevronLeft, MoreVertical, Check, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategoryStore, Category } from '../../store/useCategoryStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryList() {
  const navigate = useNavigate();
  const { categories, deleteCategory, updateCategory } = useCategoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [openMenuCategoryId, setOpenMenuCategoryId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuCategoryId(null);
    };
    if (openMenuCategoryId) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [openMenuCategoryId]);

  const toggleMenu = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (openMenuCategoryId === categoryId) {
      setOpenMenuCategoryId(null);
    } else {
      setOpenMenuCategoryId(categoryId);
    }
  };

  // Extract horizontal chips filter (All + category names)
  const filterTabs = ['All', ...categories.map(c => c.name)];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          category.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChip = activeTab === 'All' || category.name === activeTab;
    return matchesSearch && matchesChip;
  });

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 border border-[#EEEEEE] rounded-none bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#000000]" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-[#000000] uppercase tracking-tight">Categories</h3>
            <p className="text-xs text-[#666666]">Configure your category details & aesthetics</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-white border border-[#EEEEEE] px-3 py-1.5 rounded-none text-sm font-semibold shadow-sm">
            {filteredCategories.length} Total
          </div>
          <Link 
            to="/admin/categories/add" 
            className="bg-[#a855f7] text-white p-2.5 rounded-none shadow-md hover:bg-[#9333ea] transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Search Bar - styled exactly like Product Listing */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search categories by name or ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#EEEEEE] rounded-none text-sm focus:outline-none focus:border-[#a855f7] shadow-sm transition-colors" 
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Filter Chips - horizontal scrolling tab-chips styled like Product Listing */}
      <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${
                activeTab === tab 
                  ? 'bg-[#000000] text-white border-[#000000]' 
                  : 'bg-white text-[#666666] border-[#EEEEEE] hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid - premium modern card layout exactly matching Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
        {filteredCategories.map((category) => {
          // Use iconImage or fallback to bannerImage
          const categoryImage = category.iconImage || category.bannerImage;

          return (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-none p-4 border border-[#EEEEEE] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-4">
                  {/* 1:1 Square Category Image/Thumbnail */}
                  <div className="w-24 h-24 rounded-[12px] bg-gray-100 shrink-0 overflow-hidden relative border border-[#EEEEEE] flex items-center justify-center">
                    {categoryImage ? (
                      <img 
                        src={categoryImage} 
                        alt={category.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        {/* SKU / Category ID */}
                        <span className="text-[10px] font-bold text-[#a855f7] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 truncate mt-1">
                          ID: {category.id}
                        </span>
                        
                        {/* Three-Dot Menu */}
                        <div className="relative">
                          <button 
                            onClick={(e) => toggleMenu(category.id, e)}
                            className="p-1 px-1.5 text-[#666666] hover:bg-black/5 active:bg-black/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                            title="Options"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          <AnimatePresence>
                            {openMenuCategoryId === category.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 w-44 bg-white border border-[#EEEEEE] rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-1 z-40 text-left origin-top-right overflow-hidden"
                              >
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/admin/categories/edit/${category.id}`);
                                    setOpenMenuCategoryId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Edit className="w-4 h-4 text-gray-400" />
                                  <span>✏️ Edit Category</span>
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowConfirmDelete(category.id);
                                    setOpenMenuCategoryId(null);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                  <span className="text-red-600">🗑 Delete Category</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      
                      {/* Category Title - MAIN visual focus */}
                      <h4 className="font-bold text-[#000000] text-base leading-tight mb-1 select-none">
                        {category.name}
                      </h4>
                      
                      <p className="text-[11px] text-[#666666] font-medium leading-snug line-clamp-2 h-8 overflow-hidden select-none">
                        {category.description || category.bannerName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Buttons Group - selectable active controls */}
                <div className="flex items-center gap-1.5 mt-4">
                  {/* ACTIVE Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateCategory(category.id, { status: category.status === 'Active' ? 'Inactive' : 'Active' });
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      category.status === 'Active'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'bg-gray-100 text-[#666666] hover:bg-gray-200'
                    }`}
                  >
                    <span>🟢 ACTIVE</span>
                  </button>

                  {/* VISIBLE Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateCategory(category.id, { showOnHomepage: true });
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      category.showOnHomepage
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'bg-gray-100 text-[#666666] hover:bg-gray-200'
                    }`}
                  >
                    <span>👁️ VISIBLE</span>
                  </button>

                  {/* HIDE Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateCategory(category.id, { showOnHomepage: false });
                    }}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      !category.showOnHomepage
                        ? 'bg-neutral-800 text-white shadow-sm shadow-neutral-800/20'
                        : 'bg-gray-100 text-[#666666] hover:bg-gray-200'
                    }`}
                  >
                    <span>🙈 HIDE</span>
                  </button>
                </div>
              </div>

              {/* Card Footer: Banner Status & Display Order */}
              <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex flex-col gap-1 items-start justify-center">
                <div>
                  {/* Banner homepage status indicator */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none border ${
                    category.bannerImage 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : 'bg-gray-50 text-gray-400 border-[#EEEEEE]'
                  }`}>
                    {category.bannerImage ? '🖼️ Banner Added' : '⚪ No Banner'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#666666] font-bold">
                    Order: {category.displayOrder !== undefined && category.displayOrder !== null ? category.displayOrder : 'None'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid Empty State Illustration matching Products Empty State */}
      {filteredCategories.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <Search className="w-6 h-6 text-gray-405 text-gray-400" />
          </div>
          <h4 className="text-[#000000] font-bold uppercase tracking-wider text-base mb-1">NO CATEGORIES FOUND</h4>
          <p className="text-sm text-[#666666] mb-6 max-w-sm">No matching elements matched your tags or keyword query parameters.</p>
          <button 
            onClick={() => navigate('/admin/categories/add')}
            className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-md"
          >
            CREATE CATEGORY
          </button>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-none p-10 shadow-2xl overflow-hidden border border-[#EEEEEE]"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-red-500 rounded-none flex items-center justify-center mb-8 border border-red-600 shadow-lg shadow-red-500/10">
                  <Trash2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black uppercase tracking-wider mb-2">DELETE CATEGORY</h3>
                <p className="text-gray-500 text-xs font-semibold leading-relaxed mb-8">
                  Are you sure you want to permanently delete this category?
                </p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      if (showConfirmDelete) {
                        deleteCategory(showConfirmDelete);
                        setShowConfirmDelete(null);
                      }
                    }}
                    className="w-full bg-[#000000] text-white py-4 rounded-none font-bold uppercase text-xs tracking-widest hover:bg-neutral-900 transition-all shadow-md"
                  >
                    Delete Permanently
                  </button>
                  <button 
                    onClick={() => setShowConfirmDelete(null)}
                    className="w-full bg-white text-black py-4 rounded-none font-bold uppercase text-xs tracking-widest hover:bg-gray-50 transition-all border border-[#EEEEEE]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
