import React from 'react';
import { MapPin, Warehouse, Truck, Search, Navigation, Info, ChevronRight, Map as MapIcon, Compass, Plus, Home, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function DeliveryPoints() {
  const navigate = useNavigate();

  const hubs = [
    {
      id: 1,
      name: 'Dhaka Main Hub',
      address: 'Plot 12, Road 7, Sector 3, Uttara, Dhaka',
      city: 'Dhaka',
      type: 'Central Warehouse',
      status: 'Open',
      distance: '2.5 km',
      phone: '01700000001'
    },
    {
      id: 2,
      name: 'Chattogram Express Point',
      address: 'Agrabad C/A, Chattogram',
      city: 'Chattogram',
      type: 'Pickup Center',
      status: 'Open',
      distance: '5.1 km',
      phone: '01700000002'
    },
    {
      id: 3,
      name: 'Dhanmondi Delivery Hub',
      address: 'House 42, Road 27, Dhanmondi, Dhaka',
      city: 'Dhaka',
      type: 'Sorting Center',
      status: 'Closed',
      distance: '1.2 km',
      phone: '01700000003'
    },
    {
      id: 4,
      name: 'Sylhet Regional Point',
      address: 'Zindabazar Main Road, Sylhet',
      city: 'Sylhet',
      type: 'Pickup Center',
      status: 'Open',
      distance: '8.4 km',
      phone: '01700000004'
    }
  ];

  return (
    <div className="bg-[#F8F9FE] min-h-screen pb-24 font-sans">
      {/* Header */}
      <div className="bg-white pt-12 pb-8 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors"
          >
            <Compass className="w-4 h-4" /> Go Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Delivery Points</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your addresses or find pickup hubs.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <MapPin className="w-8 h-8 text-gray-900" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        
        {/* Section 1: My Saved Addresses */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">My Saved Addresses</h2>
            <button className="flex items-center gap-2 text-gray-900 font-bold text-[10px] uppercase tracking-widest bg-white border border-gray-100 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all">
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 1, label: 'Home', address: 'House 12, Road 5, Block C, Dhanmondi, Dhaka', isDefault: true },
              { id: 2, label: 'Work', address: 'Plot 4, Level 5, Gulshan 1, Dhaka', isDefault: false }
            ].map(addr => (
              <div key={addr.id} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-gray-200 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                    {addr.label === 'Home' ? <Home className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-900">{addr.label}</h4>
                      {addr.isDefault && <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-900 text-white rounded-full">Default</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{addr.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-3 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition-all">
                      <Edit2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Nearby Pickup Hubs */}
        <section className="space-y-6">
          <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">Nearby Pickup Points</h2>
          
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by city or area..."
              className="w-full bg-white border border-gray-100 h-16 pl-14 pr-6 rounded-[24px] text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/5 transition-all shadow-sm"
            />
          </div>

        {/* Quick Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['All Points', 'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi'].map((city, i) => (
            <button 
              key={city}
              className={cn(
                "px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                i === 0 ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
              )}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Hubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hubs.map((hub) => (
            <motion.div 
              key={hub.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[28px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{hub.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{hub.type}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm",
                  hub.status === 'Open' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                )}>
                  {hub.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <Navigation className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{hub.address}</p>
                </div>
                
                <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Distance</span>
                    <span className="text-sm font-bold text-gray-900">{hub.distance}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Response Time</span>
                    <span className="text-sm font-bold text-gray-900">Fast</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button className="flex-1 h-12 bg-gray-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                    <MapIcon className="w-4 h-4" /> Locate
                  </button>
                  <button className="h-12 w-12 bg-gray-50 text-gray-900 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center hover:bg-gray-100 transition-all">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Global Stats Footer inside Delivery Points */}
        <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Truck className="w-32 h-32" />
          </div>
          <div className="relative z-10 max-w-sm">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Can't find a hub near you?</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">We are expanding rapidly. Select Home Delivery at checkout for door-to-door service anywhere in Bangladesh.</p>
            <button className="flex items-center gap-2 text-gray-900 font-black text-[10px] uppercase tracking-widest group">
              Support Inquiry <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
