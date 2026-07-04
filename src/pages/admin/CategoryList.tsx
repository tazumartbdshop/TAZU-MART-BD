import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, ChevronLeft, MoreVertical, Check, ExternalLink, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategoryStore, Category } from '../../store/useCategoryStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategoryList() {
  const navigate = useNavigate();
  const { categories, fetchCategories, deleteCategory, updateCategory } = useCategoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [openMenuCategoryId, setOpenMenuCategoryId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const filterTabs = ['All', ...Array.from(new Set(categories.map(c => c.name)))];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(category.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChip = activeTab === 'All' || category.name === activeTab;
    return matchesSearch && matchesChip;
  });

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {/* Supabase Table Inspector */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 relative overflow-hidden group mb-4">
        <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
          <Database className="w-16 h-16 text-white" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live Supabase Table Inspector</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-1.5 font-mono text-[11px] text-green-400">
              <span className="text-neutral-600">TABLE:</span>
              categories
            </div>
          </div>

          <div className="flex gap-8">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Entry Count</p>
              <p className="text-sm font-black text-white">{categories.length}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">DB Sync Status</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black text-white uppercase tracking-wider">Cloud Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-black uppercase tracking-tight">Category Listing</h3>
          <p className="text-xs text-gray-400">Manage store catalog sections and displays</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-zinc-50 border border-zinc-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-black">
            {filteredCategories.length} Categories
          </div>
          <Link 
            to="/admin/categories/add" 
            className="bg-black text-white hover:bg-zinc-800 px-5 py-2 text-xs uppercase tracking-widest font-black flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Category
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="SEARCH CATEGORIES BY TITLE OR IDENTIFIER..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-zinc-200 rounded-none text-xs uppercase tracking-widest focus:outline-none focus:border-black transition-colors" 
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
      </div>

      {/* Filter Tabs */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-none text-xs font-black uppercase tracking-widest transition-colors border ${
                activeTab === tab 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-500 border-zinc-200 hover:border-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
        {filteredCategories.map((category) => {
          const categoryImage = category.iconImage || category.bannerImage;

          return (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-none p-4 border border-zinc-200 hover:border-black transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-4">
                  {/* Square Category Image */}
                  <div className="w-20 h-20 rounded-none bg-zinc-50 shrink-0 overflow-hidden relative border border-zinc-200 flex items-center justify-center">
                    {categoryImage ? (
                      <img 
                        src={categoryImage} 
                        alt={category.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-300" />
                    )}
                  </div>

                  {/* Info block */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[9px] font-black text-black bg-zinc-50 px-2 py-0.5 border border-black truncate">
                          ID: {String(category.id).slice(0, 5)}
                        </span>
                        
                        {/* Option Actions */}
                        <div className="relative">
                          <button 
                            onClick={(e) => toggleMenu(String(category.id), e)}
                            className="p-1 px-1.5 text-zinc-400 hover:text-black hover:bg-zinc-50 transition-colors cursor-pointer shrink-0"
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
                                className="absolute right-0 mt-1 w-44 bg-white border border-black rounded-none shadow-xl py-1 z-40 text-left origin-top-right overflow-hidden"
                              >
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/admin/categories/edit/${category.id}`);
                                    setOpenMenuCategoryId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#000000] hover:bg-zinc-50 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit Info</span>
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowConfirmDelete(category.id);
                                    setOpenMenuCategoryId(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-zinc-100 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Section</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      
                      <h4 className="font-extrabold text-black text-sm md:text-base tracking-tight leading-snug">
                        {category.name}
                      </h4>
                      
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-relaxed line-clamp-2 h-8 select-none">
                        {category.description || 'No Custom summary tagline.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Switch row */}
                <div className="flex items-center gap-1.5 mt-4 select-none">
                  {/* ACTIVE Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      updateCategory(category.id, { status: category.status === 'Active' ? 'Inactive' : 'Active' });
                    }}
                    className={`flex-1 flex items-center justify-center py-1.5 px-2 text-[8px] font-black uppercase tracking-widest transition-all rounded-none border pointer-events-auto cursor-pointer ${
                      category.status === 'Active'
                        ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold'
                        : 'bg-white border-zinc-200 text-zinc-400 hover:border-black'
                    }`}
                  >
                    • ACTIVE
                  </button>

                  {/* VISIBLE Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      updateCategory(category.id, { showOnHomepage: !category.showOnHomepage });
                    }}
                    className={`flex-1 flex items-center justify-center py-1.5 px-2 text-[8px] font-black uppercase tracking-widest transition-all rounded-none border pointer-events-auto cursor-pointer ${
                      category.showOnHomepage
                        ? 'bg-black border-black text-white font-extrabold'
                        : 'bg-white border-zinc-200 text-zinc-400 hover:border-black'
                    }`}
                  >
                    • HOMEPAGE
                  </button>
                </div>
              </div>

              {/* displayOrder order */}
              <div className="mt-4 pt-3 border-t border-zinc-150 flex items-center justify-between text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">
                <div>Order Position: {category.displayOrder || 'Auto'}</div>
                <div className="text-zinc-500 font-black">
                  {category.bannerImage ? '🖼️ BANNER' : '⚪ NO HERO'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid Empty State Setup */}
      {filteredCategories.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center border border-zinc-200 bg-white">
          <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <h4 className="text-black font-extrabold uppercase tracking-widest text-sm mb-1">NO CATEGORIES FOUND</h4>
          <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest max-w-xs">Create or edit a store category classification</p>
          <button 
            type="button"
            onClick={() => navigate('/admin/categories/add')}
            className="bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-colors"
          >
            CREATE INSTANCE
          </button>
        </div>
      )}

      {/* Delete Popup Sharp Cornered Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDelete(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white p-8 rounded-none border border-black shadow-2xl overflow-hidden text-center"
            >
              <div className="w-12 h-12 bg-red-600 text-white flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-black uppercase tracking-widest mb-2">Delete Category Permanently?</h3>
              <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed mb-6">
                Actions are irreversible and will un-link connected category widgets.
              </p>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    if (showConfirmDelete) {
                      if (confirm('Are you sure you want to delete this category?')) {
                        deleteCategory(showConfirmDelete);
                        setShowConfirmDelete(null);
                      }
                    }
                  }}
                  className="w-full bg-red-650 bg-red-650 bg-red-600 text-white py-3 font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-colors rounded-none"
                >
                  DELETE PERMANENTLY
                </button>
                <button 
                  onClick={() => setShowConfirmDelete(null)}
                  className="w-full bg-white border border-zinc-200 text-black py-3 font-black uppercase text-xs tracking-widest hover:bg-zinc-50 transition-all rounded-none"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
