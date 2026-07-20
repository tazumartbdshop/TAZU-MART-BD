import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Plus, 
  Settings, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  ChevronRight,
  Filter,
  Check,
  Mail,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Phone,
  Calendar,
  UserCircle2
} from 'lucide-react';
import { useModeratorStore, Moderator } from '../../store/useModeratorStore';
import { useMenuSortStore } from '../../store/useMenuSortStore';
import { motion, AnimatePresence } from 'motion/react';
import SecureLockScreen from '../../components/admin/SecureLockScreen';

const MODULES = [
  { id: 'dashboard', name: 'Dashboard', path: '/admin' },
  { id: 'orders', name: 'Order Management', path: '/admin/orders' },
  { id: 'products', name: 'Product Management', path: '/admin/products' },
  { id: 'users', name: 'User Management', path: '/admin/customers' },
  { id: 'categories', name: 'Category Management', path: '/admin/categories' },
  { id: 'coupons', name: 'Coupon Management', path: '/admin/coupons' },
  { id: 'payments', name: 'Payment Management', path: '/admin/payments' },
  { id: 'analytics', name: 'Report & Analytics', path: '/admin/analytics' },
  { id: 'notifications', name: 'Notifications', path: '/admin/notifications' },
  { id: 'logs', name: 'Activity Logs', path: '/admin/activity-logs' },
  { id: 'settings', name: 'Website Settings', path: '/admin/settings' },
  { id: 'banners', name: 'Banner Management', path: '/admin/banners' },
  { id: 'support', name: 'Support System', path: '/admin/support' },
  { id: 'roles', name: 'Role Management', path: '/admin/management/moderators' },
  { id: 'permissions', name: 'Permission Management', path: '/admin/management/moderators' },
];

export default function ModeratorManagement() {
  const { moderators, addModerator, updateModerator, deleteModerator, isUnlocked, setUnlocked, sectionPassword } = useModeratorStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMod, setEditingMod] = useState<Moderator | null>(null);
  const [expandedModId, setExpandedModId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '' as 'Male' | 'Female' | '',
    password: '',
    confirmPassword: '',
    permissions: [] as string[]
  });

  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      password: '',
      confirmPassword: '',
      permissions: []
    });
    setEditingMod(null);
  };

  const handleTogglePermission = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(moduleId)
        ? prev.permissions.filter(id => id !== moduleId)
        : [...prev.permissions, moduleId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (editingMod) {
      updateModerator(editingMod.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        password: formData.password || editingMod.password,
        permissions: formData.permissions
      });
    } else {
      addModerator({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        password: formData.password,
        role: 'moderator',
        status: 'Active',
        permissions: formData.permissions
      });
    }

    setIsAdding(false);
    resetForm();
  };

  const handleEdit = (mod: Moderator) => {
    setEditingMod(mod);
    setFormData({
      name: mod.name,
      email: mod.email,
      phone: mod.phone || '',
      dob: mod.dob || '',
      gender: mod.gender || '',
      password: '',
      confirmPassword: '',
      permissions: mod.permissions
    });
    setIsAdding(true);
  };

  const handleUnlock = (password: string) => {
    if (password === sectionPassword) {
      setUnlocked(true);
      return true;
    }
    return false;
  };

  const { memberOrder } = useMenuSortStore();

  const getSortedMods = () => {
    let list = [...moderators];
    if (memberOrder && memberOrder.length > 0) {
      list.sort((a, b) => {
        const indexA = memberOrder.indexOf(a.id);
        const indexB = memberOrder.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    return list.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredMods = getSortedMods();

  const activeModsCount = moderators.filter(m => m.status === 'Active').length;
  const allPermissions = moderators.reduce((acc: string[], m) => [...acc, ...m.permissions], []);
  const uniquePermissions = allPermissions.filter((p, i) => allPermissions.indexOf(p) === i);
  const totalPermissionsCount = uniquePermissions.length;

  if (!isUnlocked) {
    return (
      <SecureLockScreen 
        title="SECURE MODERATOR ACCESS"
        onUnlock={handleUnlock}
      />
    );
  }

  if (isAdding) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans px-4 sm:px-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => { setIsAdding(false); resetForm(); }}
              className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-2 text-[10px] font-black uppercase tracking-widest"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              Back to List
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">
              {editingMod ? 'Edit Moderator' : 'Register Moderator'}
            </h2>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Configure access profiles & permissions</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setIsAdding(false); resetForm(); }}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Section 1: Basic Info */}
        <div className="bg-white border border-[#EEEEEE] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
            <Users className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-black uppercase tracking-widest">Personal Identification</h3>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                <div className="relative">
                  <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Login Email (Gmail)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="moderator@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                    className="w-full px-4 py-3.5 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Security */}
        <div className="bg-white border border-[#EEEEEE] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
            <Lock className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-black text-black uppercase tracking-widest">Authentication Key</h3>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Account Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Create secure key"
                    className="w-full pl-11 pr-11 py-3.5 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Identity Key</label>
                <input 
                   type={showPassword ? 'text' : 'password'} 
                   value={formData.confirmPassword}
                   onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                   placeholder="Re-type password"
                   className="w-full px-5 py-3.5 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Permissions */}
        <div className="bg-white border border-[#EEEEEE] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-black text-black uppercase tracking-widest">Assign Permissions (Modules)</h3>
            </div>
            <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 border border-purple-100 italic">
              {formData.permissions.length} Active Modules
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULES.map(module => {
                const isSelected = formData.permissions.includes(module.id);
                return (
                  <button
                    key={module.id}
                    onClick={() => handleTogglePermission(module.id)}
                    className={`flex items-center justify-between p-4 border transition-all text-left relative overflow-hidden group ${
                      isSelected 
                        ? 'bg-purple-600 border-purple-600' 
                        : 'bg-white border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-white border-white text-purple-600' : 'bg-gray-50 border-gray-200 group-hover:border-purple-400'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3px]" />}
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`}>
                        {module.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Final Action */}
        <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center">
           <button 
              onClick={handleSubmit}
              className="w-full sm:w-auto px-12 py-5 bg-black text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 order-1 sm:order-2"
            >
              {editingMod ? 'Update Access Authority' : 'Confirm & Save Moderator'}
            </button>
            <button 
              onClick={() => { setIsAdding(false); resetForm(); }}
              className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-200 text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all order-2 sm:order-1"
            >
              Discard Changes
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <StatsCard 
          label="Total Moderators" 
          value={moderators.length} 
          icon={Users} 
          color="bg-purple-50 text-purple-600" 
        />
        <StatsCard 
          label="Active Moderators" 
          value={activeModsCount} 
          icon={CheckCircle} 
          color="bg-green-50 text-green-600" 
        />
        <StatsCard 
          label="Total Permissions" 
          value={totalPermissionsCount} 
          icon={Shield} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatsCard 
          label="Role Based Access" 
          value="Enabled" 
          icon={Lock} 
          color="bg-orange-50 text-orange-600" 
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-[#EEEEEE] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Moderator List</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Management of existing access controllers</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search moderators email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
            <button 
              onClick={() => { resetForm(); setIsAdding(true); }}
              className="px-8 py-3 bg-black text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black/90 transition-all shadow-lg shadow-black/10"
            >
              <Plus className="w-4 h-4" />
              Create Moderator
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredMods.map((mod) => {
            const isExpanded = expandedModId === mod.id;
            const joinDate = new Date(mod.createdAt);
            const formattedDate = new Intl.DateTimeFormat('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).format(joinDate);

            return (
              <div key={mod.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                {/* Row Header - Clickable to expand */}
                <div 
                  onClick={() => setExpandedModId(isExpanded ? null : mod.id)}
                  className="px-6 py-5 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-purple-50 flex items-center justify-center text-purple-700 font-black border border-purple-100 shrink-0">
                      {mod.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#000000] truncate">{mod.name}</p>
                      <p className="text-[10px] font-medium text-gray-400 truncate uppercase tracking-widest">{mod.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                      mod.status === 'Active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {mod.status}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-90 text-purple-500' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-[#F9F9FB]/50 border-t border-gray-50"
                    >
                      <div className="p-6 sm:p-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Login Email</p>
                            <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {mod.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Phone Number</p>
                            <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {mod.phone || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Security Key</p>
                            <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-gray-400" />
                              ••••••••
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2">Authority Joined</p>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-purple-600 block">Joined: {formattedDate}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                          <div className="flex flex-wrap gap-2">
                             {mod.permissions.map(pId => {
                               const module = MODULES.find(m => m.id === pId);
                               return module ? (
                                 <span key={pId} className="px-3 py-1 bg-white border border-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-[0.1em]">
                                   {module.name}
                                 </span>
                               ) : null;
                             })}
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button 
                              onClick={() => handleEdit(mod)}
                              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest hover:border-purple-200 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => updateModerator(mod.id, { status: mod.status === 'Active' ? 'Inactive' : 'Active' })}
                              className={`flex-1 sm:flex-none px-4 py-2.5 border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                mod.status === 'Active' 
                                  ? 'bg-white border-orange-100 text-orange-600 hover:bg-orange-50' 
                                  : 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {mod.status === 'Active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              {mod.status === 'Active' ? 'Disable' : 'Enable'}
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to permanently revoke this access?")) {
                                  deleteModerator(mod.id);
                                }
                              }}
                              className="w-10 h-10 bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          
          {filteredMods.length === 0 && (
            <div className="px-8 py-20 text-center">
              <div className="max-w-xs mx-auto space-y-3">
                <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">No Database Results Found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-4 sm:p-5 border border-[#EEEEEE] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all group rounded-none">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 ${color} group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-0.5 truncate">{label}</p>
          <h4 className="text-lg sm:text-xl font-black text-gray-900 leading-none">{value}</h4>
        </div>
      </div>
    </div>
  );
}
