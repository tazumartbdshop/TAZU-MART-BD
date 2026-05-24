import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Smartphone,
  Cpu,
  ShieldCheck,
  Signal,
  History,
  Settings2,
  Trash2,
  Plus
} from 'lucide-react';
import { useModeratorStore } from '../../store/useModeratorStore';
import { motion, AnimatePresence } from 'framer-motion';

import SecureLockScreen from '../../components/admin/SecureLockScreen';

export default function SIMLockSecurity() {
  const { isUnlocked, setUnlocked, sectionPassword } = useModeratorStore();

  const handleUnlock = (password: string) => {
    if (password === sectionPassword) {
      setUnlocked(true);
      return true;
    }
    return false;
  };

  if (!isUnlocked) {
    return (
      <SecureLockScreen 
        title="SIM LOCK SECURITY"
        subtitle="Protected Security Area • Authorized Access Only"
        logoSubText="Secure Access Control"
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="space-y-8 font-sans pb-20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">
            SIM LOCK SECURITY PANEL
          </h2>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-green-500" /> Authorized Admin Session Active
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setUnlocked(false)}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-900 font-black uppercase tracking-widest text-[9px] hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" /> Re-Lock Section
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SecurityStatCard label="Locked Devices" value="482" icon={Smartphone} color="text-purple-600" />
        <SecurityStatCard label="Active SIMs" value="1,294" icon={Signal} color="text-green-600" />
        <SecurityStatCard label="Suspicious Attempts" value="12" icon={AlertCircle} color="text-red-600" />
        <SecurityStatCard label="Binding Protocol" value="AES-256" icon={Shield} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border border-[#EEEEEE] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <Cpu className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-black text-black uppercase tracking-widest">Global Device Binding Protocol</h3>
              </div>
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between">
                          IMEI Verification
                          <span className="text-green-500 font-bold">Active</span>
                       </label>
                       <div className="flex bg-gray-50 p-1 border border-gray-100">
                          <button className="flex-1 py-2 text-[10px] font-black uppercase bg-black text-white">Strict</button>
                          <button className="flex-1 py-2 text-[10px] font-black uppercase text-gray-400">Lenient</button>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between">
                          SIM Network Pairing
                          <span className="text-green-500 font-bold">Encrypted</span>
                       </label>
                       <div className="flex bg-gray-50 p-1 border border-gray-100">
                          <button className="flex-1 py-2 text-[10px] font-black uppercase text-gray-400">Manual</button>
                          <button className="flex-1 py-2 text-[10px] font-black uppercase bg-black text-white">Auto-Bind</button>
                       </div>
                    </div>
                 </div>

                 <div className="bg-purple-50/50 border border-purple-100 p-6">
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 bg-purple-600 flex items-center justify-center text-white shrink-0">
                          <Settings2 className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-purple-900 mb-1">Advanced Access Token Rotation</h4>
                          <p className="text-[10px] text-purple-800 font-medium leading-relaxed opacity-70">
                             Automatically rotate SIM binding tokens every 24 hours to prevent man-in-the-middle decryption attacks on mobile endpoints.
                          </p>
                          <button className="mt-3 text-[9px] font-black uppercase tracking-widest text-purple-600 underline">Configure Rotation Frequency</button>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black/90 transition-all">
                    Update Configuration
                  </button>
              </div>
           </div>

           {/* SIM List Table */}
           <div className="bg-white border border-[#EEEEEE] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-purple-600" />
                   <h3 className="text-sm font-black text-black uppercase tracking-widest">Restricted Device Entries</h3>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Manual Bind
                </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-[#F9F9FB] border-b border-[#EEEEEE]">
                       <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <th className="px-6 py-4">Device ID</th>
                          <th className="px-6 py-4">SIM ICCID</th>
                          <th className="px-6 py-4">Phone Number</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {[
                         { id: 'DEV_49201', sim: '898801720349120', phone: '+880 1711223344', status: 'Locked' },
                         { id: 'DEV_49202', sim: '898801720349121', phone: '+880 1711223345', status: 'Active' },
                         { id: 'DEV_49203', sim: '898801720349122', phone: '+880 1711223346', status: 'Locked' },
                       ].map((item) => (
                         <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-black text-xs text-gray-900">{item.id}</td>
                            <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{item.sim}</td>
                            <td className="px-6 py-4 font-bold text-xs text-gray-700">{item.phone}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${item.status === 'Locked' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                  {item.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button className="text-gray-400 hover:text-red-500 p-1">
                                  <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Sidebar logs */}
        <div className="space-y-8">
           <div className="bg-white border border-[#EEEEEE] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/30">
                <History className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-black text-black uppercase tracking-widest">Live Security Audit</h3>
              </div>
              <div className="p-6 space-y-6">
                 {[
                   { time: '12:45 PM', event: 'New Device Locked', desc: 'Auto-lock triggered for IMEI ending in ...4922' },
                   { time: '11:20 AM', event: 'Rotation Success', desc: 'Global token rotation protocol successful' },
                   { time: '09:05 AM', event: 'Auth Attempt', desc: 'Secure panel access granted to Super Admin' },
                   { time: 'Yesterday', event: 'Blocked IP', desc: 'Blocked repetitive binding request from IP: 103.4.1.' },
                 ].map((log, idx) => (
                    <div key={idx} className="relative pl-6 border-l border-gray-100 pb-6 last:pb-0">
                       <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-purple-600"></div>
                       <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{log.time}</span>
                       <h4 className="text-[10px] font-black text-black uppercase tracking-tight mt-1">{log.event}</h4>
                       <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{log.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function SecurityStatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 border border-[#EEEEEE] flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <Icon className={`w-5 h-5 ${color}`} />
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
