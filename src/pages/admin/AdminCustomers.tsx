import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Filter, Plus, Edit, Trash2, X, Image as ImageIcon, Minus, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { useCustomerStore, Customer } from '../../store/useCustomerStore';

export default function AdminCustomers() {
  return (
    <Routes>
      <Route path="/" element={<AdminCustomerList />} />
      <Route path="/add" element={<AdminCustomerAdd />} />
      <Route path="/edit/:id" element={<AdminCustomerAdd />} />
    </Routes>
  );
}

function AdminCustomerList() {
  const { customers, deleteCustomer, updateCustomer } = useCustomerStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phones.some(phone => phone.includes(q)) ||
      c.emails.some(email => email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-none border border-[#222] overflow-hidden flex flex-col min-h-[70vh]">
      <div className="p-6 border-b border-[#222] flex flex-col md:flex-row md:justify-between md:items-center gap-4 shrink-0 bg-black text-white">
        <div>
           <h3 className="text-xl font-black uppercase tracking-tighter">Customer Directory</h3>
           <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Enterprise member management</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 md:min-w-[300px]">
            <input 
              type="text" 
              placeholder="Search directory..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-[44px] bg-zinc-900 border border-zinc-700 text-white rounded-none text-xs focus:outline-none focus:border-white uppercase tracking-tight font-bold" 
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
          <Link to="/admin/customers/add" className="flex items-center gap-2 bg-white text-black px-5 h-[44px] rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4" /> Register New
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-black text-[10px] uppercase tracking-[0.2em] font-black border-b border-[#222]">
              <th className="p-4">Entity Identity</th>
              <th className="p-4">Contact Logic</th>
              <th className="p-4">Location Data</th>
              <th className="p-4">Auth Access</th>
              <th className="p-4">Verification</th>
              <th className="p-4 text-right">System Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] text-sm">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none bg-gray-50 flex items-center justify-center overflow-hidden border border-[#E5E5E5] group-hover:border-black transition-colors shrink-0">
                      {customer.profileImage ? (
                        <img src={customer.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <span className="text-[#000000] font-black block leading-none uppercase tracking-tight">{customer.name}</span>
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1.5 block">UUID: {customer.id}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-[12px] font-black text-black">{customer.phones[0]}</div>
                  {customer.emails[0] && (
                    <div className="text-[10px] text-gray-500 mt-0.5 font-bold italic">{customer.emails[0]}</div>
                  )}
                </td>
                <td className="p-4 max-w-[200px]">
                  <div className="text-[11px] font-bold text-gray-600 truncate">{customer.address.street}</div>
                  <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5 truncate">
                    {customer.address.city} • {customer.address.country}
                  </div>
                </td>
                <td className="p-4">
                  {customer.emails[0] && customer.password ? (
                    <div className="bg-white border border-black p-2 rounded-none inline-block">
                       <div className="flex items-center gap-1.5 text-[10px] text-black font-black mb-1">
                          <Mail className="w-3 h-3" /> {customer.emails[0]}
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black font-mono">
                          <Lock className="w-3 h-3" /> {customer.password}
                       </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-2 py-1 border border-dashed border-gray-200">Offline Profile</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-none border ${
                      customer.status === 'Blocked' 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black border-black/10'
                    }`}>
                      {customer.status || 'Active'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-black font-mono">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                   <div className="flex items-center justify-end gap-2">
                     <button 
                       onClick={() => updateCustomer(customer.id, { status: customer.status === 'Blocked' ? 'Active' : 'Blocked' })}
                       className="p-2 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all text-gray-400 rounded-none"
                       title={customer.status === 'Blocked' ? 'Enable Access' : 'Suspend Access'}
                     >
                        {customer.status === 'Blocked' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                     </button>

                     <button 
                       onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
                       className="p-2 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all text-gray-400 rounded-none"
                       title="Edit Record"
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                     
                     <button 
                       onClick={() => {
                         if (window.confirm('IRREVERSIBLE: Execute permanent deletion of this record?')) deleteCustomer(customer.id);
                       }}
                       className="p-2 border border-gray-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all text-gray-400 rounded-none"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}function AdminCustomerAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { customers, addCustomer, updateCustomer } = useCustomerStore();
  
  const editingCustomer = customers.find(c => c.id === id);

  const [formData, setFormData] = useState({
    name: '',
    phones: [''],
    emails: [''],
    address: {
      country: 'Bangladesh',
      city: '',
      area: '',
      zipCode: '',
      street: '',
    },
    whatsApp: '',
    note: '',
    profileImage: '',
    socialLinks: [{ platform: 'Facebook', username: '' }],
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        ...editingCustomer,
        password: '', // Don't show existing password
        confirmPassword: '',
      });
    }
  }, [editingCustomer]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPhone = () => setFormData({ ...formData, phones: [...formData.phones, ''] });
  const removePhone = (index: number) => setFormData({ ...formData, phones: formData.phones.filter((_, i) => i !== index) });

  const addEmail = () => setFormData({ ...formData, emails: [...formData.emails, ''] });
  const removeEmail = (index: number) => setFormData({ ...formData, emails: formData.emails.filter((_, i) => i !== index) });

  const addSocial = () => setFormData({ ...formData, socialLinks: [...formData.socialLinks, { platform: 'Facebook', username: '' }] });
  const removeSocial = (index: number) => setFormData({ ...formData, socialLinks: formData.socialLinks.filter((_, i) => i !== index) });
  const updateSocialPlatform = (index: number, value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index].platform = value;
    setFormData({ ...formData, socialLinks: newLinks });
  };
  const updateSocialUsername = (index: number, value: string) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index].username = value;
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phones[0]) newErrors.phone = 'Phone is required';
    
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Min 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { confirmPassword, ...payload } = formData;
    if (id && !payload.password) {
      delete (payload as any).password;
    }

    if (id) {
      updateCustomer(id, payload as any);
    } else {
      addCustomer(payload as any);
    }
    navigate('/admin/customers');
  };

  return (
    <div className="bg-white rounded-none border border-[#222] overflow-hidden">
        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-black text-white">
           <div>
             <h3 className="text-xl font-black uppercase tracking-tighter">
               {id ? 'Modify Customer Record' : 'Enroll New Entity'}
             </h3>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Enterprise database system</p>
           </div>
           <button onClick={() => navigate('/admin/customers')} className="text-white hover:bg-zinc-800 p-2 rounded-none transition-colors border border-zinc-700">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-6 md:p-8">
           <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl">
              {/* Core Identity */}
              <div className="space-y-6">
                <h4 className="text-[12px] font-black text-black border-b border-[#222] pb-2 uppercase tracking-widest">Core Identity Details</h4>
                
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-black uppercase tracking-widest">Full Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-4 py-3 bg-white border ${errors.name ? 'border-red-500' : 'border-[#222]'} rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm`} 
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-black uppercase tracking-widest">Communication Channels (Phone)</label>
                    {formData.phones.map((phone, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input 
                          type="tel" 
                          placeholder="017XXXXXXXX" 
                          value={phone}
                          onChange={e => {
                            const newPhones = [...formData.phones];
                            newPhones[index] = e.target.value;
                            setFormData({...formData, phones: newPhones});
                          }}
                          className={`flex-1 px-4 py-3 bg-white border ${errors.phone && index === 0 ? 'border-red-500' : 'border-[#222]'} rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm`} 
                        />
                        {index === 0 ? (
                           <button type="button" onClick={addPhone} className="px-4 bg-black text-white hover:bg-zinc-800 transition-colors uppercase text-[10px] font-black tracking-widest">
                             Add channel
                           </button>
                        ) : (
                           <button type="button" onClick={() => removePhone(index)} className="px-4 bg-red-600 text-white hover:bg-red-700 transition-colors uppercase text-[10px] font-black tracking-widest">
                             Remove
                           </button>
                        )}
                      </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-black uppercase tracking-widest">Operational Location</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Country" 
                        value={formData.address.country}
                        onChange={e => setFormData({...formData, address: {...formData.address, country: e.target.value}})}
                        className="w-full px-4 py-3 bg-white border border-[#222] rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm" 
                      />
                      <input 
                        type="text" 
                        placeholder="City" 
                        value={formData.address.city}
                        onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                        className="w-full px-4 py-3 bg-white border border-[#222] rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm" 
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Street Address Data" 
                      value={formData.address.street}
                      onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                      className="w-full px-4 py-3 bg-white border border-[#222] rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm" 
                    />
                </div>
              </div>

              {/* Security Credentials */}
              <div className="space-y-6 pt-10 border-t border-[#E5E5E5]">
                  <h4 className="text-[12px] font-black text-black border-b border-[#222] pb-2 uppercase tracking-widest">System Access Credentials</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-black uppercase tracking-widest">Primary Identity Address (Gmail)</label>
                        <input 
                          type="email" 
                          placeholder="customer@gmail.com" 
                          value={formData.emails[0]}
                          onChange={e => {
                            const newEmails = [...formData.emails];
                            newEmails[0] = e.target.value;
                            setFormData({...formData, emails: newEmails});
                          }}
                          className="w-full px-4 py-3 bg-white border border-[#222] rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm" 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-black uppercase tracking-widest">Access Key</label>
                        <input 
                          type="password" 
                          placeholder="Min 6 characters" 
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-[#222] rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-black uppercase tracking-widest">Confirm Access Key</label>
                        <input 
                          type="password" 
                          placeholder="Match entry" 
                          value={formData.confirmPassword}
                          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-[#222] rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm" 
                        />
                      </div>
                    </div>
                  </div>
              </div>

              <div className="flex justify-end gap-4 pt-10 border-t border-[#E5E5E5]">
                 <button type="button" onClick={() => navigate('/admin/customers')} className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-[#666666] hover:text-[#000000] transition-colors">
                    Abondon changes
                 </button>
                 <button type="submit" className="px-10 py-4 bg-[#000000] text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-none hover:bg-zinc-800 shadow-2xl transition-all active:scale-95">
                    Sync to database
                 </button>
              </div>
           </form>
        </div>
    </div>
  );
}
