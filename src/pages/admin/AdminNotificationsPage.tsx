import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  ArrowLeft, 
  Search, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  Ticket, 
  HelpCircle, 
  Trash2, 
  X, 
  ChevronRight, 
  Clock, 
  Sparkles,
  Filter,
  RefreshCw,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupportStore, ChatSession, SupportTicket } from '../../store/useSupportStore';

export function DefaultHumanAvatar({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <div className={`rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden text-slate-400 shrink-0 ${className}`}>
      <svg className="w-[70%] h-[70%] translate-y-1 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    </div>
  );
}

export function getRelativeTime(timestamp: string): string {
  if (!timestamp) return 'Just now';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export interface NotificationItem {
  id: string;
  type: 'Message' | 'Ticket' | 'Support Request';
  title: string;
  preview: string;
  customerName: string;
  customerAvatar?: string;
  timestamp: string;
  isRead: boolean;
  targetId: string;
  targetType: 'chat' | 'ticket';
  online?: boolean;
}

export default function AdminNotificationsPage() {
  const navigate = useNavigate();
  const { sessions, tickets, setActiveSession, subscribeLiveSupport, subscribeTickets } = useSupportStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'messages' | 'tickets'>('all');
  const [pageSize, setPageSize] = useState(15);

  // Read notifications stored locally
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tazu_admin_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Deleted/Archived notification IDs stored locally
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tazu_admin_deleted_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time store subscriptions
  useEffect(() => {
    const unsub1 = subscribeLiveSupport();
    const unsub2 = subscribeTickets();
    return () => {
      unsub1();
      unsub2();
    };
  }, [subscribeLiveSupport, subscribeTickets]);

  // Persist readIds
  useEffect(() => {
    try {
      localStorage.setItem('tazu_admin_read_notifs', JSON.stringify(readIds));
    } catch (e) {
      console.warn(e);
    }
  }, [readIds]);

  // Persist deletedIds
  useEffect(() => {
    try {
      localStorage.setItem('tazu_admin_deleted_notifs', JSON.stringify(deletedIds));
    } catch (e) {
      console.warn(e);
    }
  }, [deletedIds]);

  // Construct combined real-time notification list
  const allNotifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    // 1. Chat Messages
    sessions.forEach((s) => {
      if (s.id === 'TAZU-MART-BD-OFFICIAL') return;
      const notifId = `chat-${s.id}`;
      if (deletedIds.includes(notifId)) return;

      const lastMsg = s.messages && s.messages.length > 0 ? s.messages[s.messages.length - 1] : null;
      const preview = s.lastMessageText || lastMsg?.text || (lastMsg?.imageUrl ? '📷 Photo Attachment' : 'Support inquiry');
      const timestamp = s.lastMessageAt || lastMsg?.timestamp || new Date().toISOString();
      const isUnread = (s.unreadCount || 0) > 0 || (lastMsg && lastMsg.sender === 'customer' && !lastMsg.seen);

      list.push({
        id: notifId,
        type: 'Message',
        title: `New message from ${s.customerName || 'Customer'}`,
        preview,
        customerName: s.customerName || 'Customer',
        customerAvatar: s.customerAvatar,
        timestamp,
        isRead: readIds.includes(notifId) || !isUnread,
        targetId: s.id,
        targetType: 'chat',
        online: s.customerOnline
      });
    });

    // 2. Support Tickets
    tickets.forEach((t) => {
      const notifId = `ticket-${t.id}`;
      if (deletedIds.includes(notifId)) return;

      const isUnread = t.status === 'Open';
      const isRequest = t.category?.toLowerCase().includes('request');

      list.push({
        id: notifId,
        type: isRequest ? 'Support Request' : 'Ticket',
        title: `${t.ticketNumber} - ${t.category || 'Support Inquiry'}`,
        preview: t.details || 'New customer support ticket submitted.',
        customerName: t.fullName || 'Customer',
        timestamp: t.createdAt || new Date().toISOString(),
        isRead: readIds.includes(notifId) || !isUnread,
        targetId: t.id,
        targetType: 'ticket',
        online: true
      });
    });

    // Sort newest first
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }, [sessions, tickets, readIds, deletedIds]);

  // Counts
  const unreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.isRead).length;
  }, [allNotifications]);

  const messageCount = useMemo(() => {
    return allNotifications.filter(n => n.type === 'Message').length;
  }, [allNotifications]);

  const ticketCount = useMemo(() => {
    return allNotifications.filter(n => n.type === 'Ticket' || n.type === 'Support Request').length;
  }, [allNotifications]);

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((n) => {
      // Tab filter
      if (activeTab === 'unread' && n.isRead) return false;
      if (activeTab === 'messages' && n.type !== 'Message') return false;
      if (activeTab === 'tickets' && n.type !== 'Ticket' && n.type !== 'Support Request') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = n.customerName.toLowerCase().includes(q);
        const matchesPreview = n.preview.toLowerCase().includes(q);
        const matchesTitle = n.title.toLowerCase().includes(q);
        return matchesName || matchesPreview || matchesTitle;
      }

      return true;
    });
  }, [allNotifications, activeTab, searchQuery]);

  // Paginated list
  const visibleNotifications = useMemo(() => {
    return filteredNotifications.slice(0, pageSize);
  }, [filteredNotifications, pageSize]);

  // Actions
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!readIds.includes(id)) {
      setReadIds((prev) => [...prev, id]);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = allNotifications.map((n) => n.id);
    setReadIds(allIds);
  };

  const handleDeleteNotification = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!deletedIds.includes(id)) {
      setDeletedIds((prev) => [...prev, id]);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    handleMarkAsRead(item.id);

    if (item.targetType === 'chat') {
      setActiveSession(item.targetId);
      navigate('/admin/support');
    } else {
      navigate('/admin/support');
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full font-sans text-left space-y-4 pb-12 animate-fade-in">
      
      {/* Top App Bar Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2.5 bg-gray-100 hover:bg-black hover:text-white rounded-xl text-gray-700 transition-all flex items-center justify-center shrink-0"
            title="Go Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Real-time Messenger Support Alerts & Customer Ticket Notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="flex-1 sm:flex-initial px-4 py-2 bg-primary-50 text-primary-700 hover:bg-black hover:text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" /> Mark All as Read
            </button>
          )}
          <button 
            onClick={() => navigate('/admin/support')}
            className="flex-1 sm:flex-initial px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" /> Open Support Inbox
          </button>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        
        {/* Search Bar & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by customer name, ticket #, or message text..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 self-end sm:self-center">
            <span>Total: <strong className="text-gray-900">{allNotifications.length}</strong></span>
            <span>•</span>
            <span className="text-blue-600">Unread: <strong>{unreadCount}</strong></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 pb-0 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-hide no-scrollbar hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'all' 
                ? 'border-black text-black bg-gray-50' 
                : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50/50'
            }`}
          >
            All Notifications
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
              {allNotifications.length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'unread' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50/50'
            }`}
          >
            Unread Only
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'messages' 
                ? 'border-purple-600 text-purple-600 bg-purple-50/30' 
                : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Messages
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700">
              {messageCount}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'tickets' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-50/50'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            Tickets
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">
              {ticketCount}
            </span>
          </button>
        </div>

        {/* Notification List Items */}
        <div className="divide-y divide-gray-100 min-h-[360px]">
          {visibleNotifications.length === 0 ? (
            <div className="py-20 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300 mb-3">
                <Bell className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No notifications found</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                {searchQuery 
                  ? `No results matching "${searchQuery}". Try searching with a different keyword.` 
                  : activeTab === 'unread' 
                  ? 'Great job! You have no unread notifications.' 
                  : 'New customer support messages and tickets will appear here in real time.'}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            visibleNotifications.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-all cursor-pointer group relative ${
                  !item.isRead ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Left: Avatar with Status Indicator */}
                <div className="relative shrink-0">
                  {item.customerAvatar ? (
                    <img 
                      src={item.customerAvatar} 
                      alt={item.customerName} 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <DefaultHumanAvatar className="w-12 h-12" />
                  )}
                  {item.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" title="Online now"></span>
                  )}
                </div>

                {/* Middle: Content Info */}
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className={`text-sm tracking-tight truncate ${!item.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-800'}`}>
                        {item.customerName}
                      </h4>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                        item.type === 'Message' 
                          ? 'bg-purple-100 text-purple-700' 
                          : item.type === 'Ticket' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.type === 'Message' && <MessageSquare className="w-3 h-3" />}
                        {item.type === 'Ticket' && <Ticket className="w-3 h-3" />}
                        {item.type === 'Support Request' && <HelpCircle className="w-3 h-3" />}
                        {item.type}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {getRelativeTime(item.timestamp)}
                    </span>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed break-words [word-break:break-word] [overflow-wrap:anywhere] line-clamp-2 ${
                    !item.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}>
                    {item.preview}
                  </p>
                </div>

                {/* Right: Actions & Unread Indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {!item.isRead && (
                    <button 
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      title="Mark as Read"
                      className="p-1.5 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <button 
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    title="Delete Notification"
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Pagination Footer */}
        {filteredNotifications.length > pageSize && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-center">
            <button 
              onClick={() => setPageSize((prev) => prev + 15)}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-800 hover:bg-black hover:text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Load More Notifications ({filteredNotifications.length - pageSize} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
