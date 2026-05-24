import React, { useState } from 'react';
import { 
  Users, UserCheck, ShoppingBag, Eye, MapPin, Search, 
  Filter, Navigation, AlertCircle, EyeOff, Info,
  Phone, Clock, Laptop, Network, Check
} from 'lucide-react';

const visitorsData: Record<string, any> = {
  visitor_1: {
      id: "visitor_1", isLoggedIn: true, name: "Rasel Ahmed", email: "rasel.ahmed@gmail.com", phone: "+880 1712-345678", location: "Dhaka, Bangladesh", timeOnline: "05:24 Min", source: "Direct", visitTime: "May 21, 2026 (10:30 AM)", totalVisits: "5 Times", totalOrders: "2 Orders", device: "Chrome - Windows 10", ip: "103.48.16.89",
      journey: [
          { time: "May 21, 2026 | 10:30:15 AM", title: "Landed on Homepage", status: "visited" },
          { time: "May 21, 2026 | 10:31:00 AM", title: "Viewed Product #12", meta: "Category: Men's Fashion | Badge: Trending | SKU: PM-WATCH-09", status: "visited" },
          { time: "May 21, 2026 | 10:32:10 AM", title: "Added to Cart", status: "visited" },
          { time: "May 21, 2026 | 10:33:15 AM", title: "Reached Checkout Page", status: "visited" },
          { time: "May 21, 2026 | 10:34:05 AM", title: "Order Placed Successfully", meta: "Order ID: #ORD-9923", status: "visited" }
      ]
  },
  visitor_2: {
      id: "visitor_2", isLoggedIn: false, name: "Customer 1", email: "No Information", phone: "No Information", location: "Chittagong, BD", timeOnline: "02:15 Min", source: "Google Search", visitTime: "May 21, 2026 (11:15 AM)", totalVisits: "1 Time (Guest)", totalOrders: "0 Orders", device: "Safari Mobile - iPhone", ip: "182.54.22.104",
      journey: [
          { time: "May 21, 2026 | 11:15:00 AM", title: "Landed on Homepage", status: "visited" },
          { time: "May 21, 2026 | 11:16:05 AM", title: "Viewed Product #45", meta: "Category: Punjabi Collection | Badge: Best Selling | SKU: PJ-EID-2026", status: "visited" },
          { time: "May 21, 2026 | 11:17:15 AM", title: "Visited Login Interface / Page", status: "visited" }
      ]
  },
  visitor_3: {
      id: "visitor_3", isLoggedIn: false, name: "Customer 2", email: "No Information", phone: "No Information", location: "Sylhet, BD", timeOnline: "01:40 Min", source: "Facebook Ads", visitTime: "May 21, 2026 (11:18 AM)", totalVisits: "1 Time (Guest)", totalOrders: "0 Orders", device: "Chrome Mobile - Android", ip: "103.22.45.12",
      journey: [
          { time: "May 21, 2026 | 11:18:10 AM", title: "Viewed Product #03 (Direct Ad)", meta: "Category: Ladies Bags | Badge: Trending | SKU: BG-LTH-02", status: "visited" },
          { time: "May 21, 2026 | 11:18:40 AM", title: "Added to Cart", status: "visited" }
      ]
  },
  visitor_4: {
      id: "visitor_4", isLoggedIn: false, name: "Customer 3", email: "No Information", phone: "No Information", location: "Khulna, BD", timeOnline: "00:45 Min", source: "Instagram", visitTime: "May 21, 2026 (11:20 AM)", totalVisits: "1 Time (Guest)", totalOrders: "0 Orders", device: "Instagram App - Android", ip: "180.234.12.55",
      journey: [{ time: "May 21, 2026 | 11:20:00 AM", title: "Landed on /shop", meta: "Source: Instagram Link", status: "visited" }]
  },
  visitor_5: {
      id: "visitor_5", isLoggedIn: true, name: "MD. Sabbir", email: "sabbir.dev@gmail.com", phone: "+880 1911-223344", location: "Rajshahi, BD", timeOnline: "08:12 Min", source: "YouTube", visitTime: "May 21, 2026 (11:10 AM)", totalVisits: "12 Times", totalOrders: "4 Orders", device: "Firefox - Linux", ip: "103.111.22.33",
      journey: [
          { time: "May 21, 2026 | 11:10:00 AM", title: "Logged In", meta: "User Dashboard", status: "visited" },
          { time: "May 21, 2026 | 11:12:00 AM", title: "Checking Order History", meta: "/account/orders", status: "visited" }
      ]
  },
  visitor_6: {
      id: "visitor_6", isLoggedIn: false, name: "Customer 4", email: "No Information", phone: "No Information", location: "Barisal, BD", timeOnline: "03:10 Min", source: "Direct", visitTime: "May 21, 2026 (11:12 AM)", totalVisits: "2 Times (Guest)", totalOrders: "0 Orders", device: "Chrome - Windows 11", ip: "115.45.22.90",
      journey: [{ time: "May 21, 2026 | 11:12:00 AM", title: "Browsing Watches", meta: "/category/watches", status: "visited" }]
  }
};

export default function AdminLiveTracking() {
  const [selectedVisitorId, setSelectedVisitorId] = useState<string>('visitor_1');

  const selectedVisitor = visitorsData[selectedVisitorId];

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 gap-4 mb-6">
          <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Live Visitor / Customer Tracking Dashboard
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-ping"></span> Live
                  </span>
              </h1>
          </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[620px]">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Search className="text-orange-500 w-5 h-5" /> Live Visitors
              </h2>
              
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {Object.values(visitorsData).map(visitor => {
                  const isSelected = selectedVisitorId === visitor.id;
                  const bgClass = visitor.isLoggedIn 
                    ? 'bg-orange-50/60 border-orange-200' 
                    : 'bg-gray-50 border-gray-200';

                  return (
                    <div 
                      key={visitor.id}
                      onClick={() => setSelectedVisitorId(visitor.id)}
                      className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer hover:shadow-sm transition-all duration-200 ${bgClass} ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800">
                                  {visitor.name} 
                                  {!visitor.isLoggedIn && <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded ml-1 font-normal">Guest</span>}
                                </h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin className="text-gray-400 w-3 h-3" /> {visitor.location}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">{visitor.timeOnline}</span>
                            <p className="text-[10px] text-gray-400 mt-1">{visitor.source}</p>
                        </div>
                    </div>
                  );
                })}
              </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[620px] flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Navigation className="text-blue-500 w-5 h-5" /> User Journey (Live Activity)
              </h2>
              
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="relative border-l-2 border-green-200 ml-4 space-y-6 pb-2 pt-2">
                    {selectedVisitor.journey.map((step: any, index: number) => {
                      return (
                        <div key={index} className="relative pl-7">
                            <div className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px] shadow-sm ring-4 ring-green-100">
                                <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono font-medium">{step.time}</div>
                            <h4 className="text-sm font-bold text-gray-800 mt-0.5">{step.title}</h4>
                            {step.meta && (
                                <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50/50 p-1.5 rounded border border-blue-100 inline-block">{step.meta}</p>
                            )}
                        </div>
                      );
                    })}
                </div>
              </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[620px] flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                <Users className="text-purple-500 w-5 h-5" /> Visitor Details
              </h2>
              
              <div className="space-y-4 pt-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                    {selectedVisitor.isLoggedIn ? (
                       <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-bold">{selectedVisitor.name.split(' ').map((n: string) => n[0]).join('')}</div>
                    ) : (
                       <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg"><EyeOff className="w-5 h-5" /></div>
                    )}
                    
                    <div>
                        <h3 className="font-bold text-base text-gray-900">{selectedVisitor.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{selectedVisitor.email}</p>
                    </div>
                </div>
                <div className="text-xs space-y-2.5 bg-gray-50/50 p-3 rounded-lg border">
                    <div className="flex justify-between"><span className="text-gray-400 flex items-center"><Phone className="w-3 h-3 mr-1" /> Phone:</span> <span className="font-medium text-gray-800">{selectedVisitor.phone}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Location:</span> <span className="font-medium text-gray-800">{selectedVisitor.location}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> First Visit:</span> <span className="font-medium text-gray-800">{selectedVisitor.visitTime}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400 flex items-center"><Eye className="w-3 h-3 mr-1" /> Total Visits:</span> <span className="font-medium text-gray-800">{selectedVisitor.totalVisits}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400 flex items-center"><ShoppingBag className="w-3 h-3 mr-1" /> Total Orders:</span> <span className="font-medium text-gray-800">{selectedVisitor.totalOrders}</span></div>
                    <hr className="my-2" />
                    <div className="flex justify-between"><span className="text-gray-400 flex items-center"><Laptop className="w-3 h-3 mr-1" /> Device/Browser:</span> <span className="font-medium text-gray-800 text-right max-w-[170px] truncate" title={selectedVisitor.device}>{selectedVisitor.device}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400 flex items-center"><Network className="w-3 h-3 mr-1" /> IP Address:</span> <span className="font-mono font-medium text-gray-800">{selectedVisitor.ip}</span></div>
                </div>
              </div>
          </div>

      </div>

    </div>
  );
}

