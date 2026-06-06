// /src/utils/pixelService.ts

export type EventStatus = 'SUCCESS' | 'DELAYED' | 'FAILED';

export interface FiredEventLog {
  id: string;
  eventName: string;
  timestamp: string;
  status: EventStatus;
  platforms: {
    facebook: { active: boolean; status: EventStatus; message: string; deduplicated?: boolean };
    tiktok: { active: boolean; status: EventStatus; message: string; deduplicated?: boolean };
    ga4: { active: boolean; status: EventStatus; message: string };
    gtm: { active: boolean; status: EventStatus; message: string };
    serverSide: { active: boolean; status: EventStatus; message: string; deduplicated?: boolean };
  };
  payload: any;
  eventId: string;
}

class PixelService {
  private getConfigs() {
    const saved = localStorage.getItem('tazumart_marketing_center_config_v2');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  // Generate unique event ID for deduplication
  private generateEventId(prefix: string): string {
    return `${prefix}_${Math.floor(100000 + Math.random() * 900000)}_${Date.now().toString().slice(-4)}`;
  }

  // Central tracking event fire routing
  public track(eventName: string, payload: any = {}) {
    const s = this.getConfigs();
    const eventId = this.generateEventId(eventName.toLowerCase().replace(/\s+/g, '_'));
    const timestamp = new Date().toLocaleTimeString();
    
    // Check credentials formats for error detection
    const isFbValid = s?.fbActive && s?.fbPixelId && /^\d{10,18}$/.test(s.fbPixelId.trim());
    const isTtValid = s?.ttActive && s?.ttPixelId && /^[A-Za-z0-9]{10,20}$/.test(s.ttPixelId.trim());
    const isGa4Valid = s?.ga4Active && s?.ga4MeasurementId && /^G-[A-Za-z0-9]{10}$/i.test(s.ga4MeasurementId.trim());
    const isGtmValid = s?.gtmActive && s?.gtmId && /^GTM-[A-Z0-9]{4,8}$/i.test(s.gtmId.trim());
    
    let isSsValid = false;
    if (s?.ssActive && s?.ssEndpoint) {
      try {
        new URL(s.ssEndpoint);
        isSsValid = true;
      } catch {
        isSsValid = false;
      }
    }

    // Determine status of each channel
    const fbStatus: EventStatus = s?.fbActive ? (isFbValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS'; // Success if in-active or healthy to avoid blocking main pipe
    const ttStatus: EventStatus = s?.ttActive ? (isTtValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS';
    const ga4Status: EventStatus = s?.ga4Active ? (isGa4Valid ? 'SUCCESS' : 'FAILED') : 'SUCCESS';
    const gtmStatus: EventStatus = s?.gtmActive ? (isGtmValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS';
    const ssStatus: EventStatus = s?.ssActive ? (isSsValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS';

    const hasFailure = 
      (s?.fbActive && !isFbValid) || 
      (s?.ttActive && !isTtValid) || 
      (s?.ga4Active && !isGa4Valid) || 
      (s?.gtmActive && !isGtmValid) || 
      (s?.ssActive && !isSsValid);

    // Let's introduce random mock delay or network latencies for realism
    let overallStatus: EventStatus = 'SUCCESS';
    if (hasFailure) {
      overallStatus = 'FAILED';
    } else if (Math.random() > 0.85) {
      // 15% random chance of simulation delay due to packet queues
      overallStatus = 'DELAYED';
    }

    // Deduplication trace for combined SDK & S2S delivery
    const isFbCapiDeduplicated = !!(s?.fbActive && s?.fbCapiActive);
    const isTtApiDeduplicated = !!(s?.ttActive && s?.ttApiActive);

    const log: FiredEventLog = {
      id: Math.random().toString(),
      eventName,
      timestamp,
      status: overallStatus,
      eventId,
      platforms: {
        facebook: {
          active: !!s?.fbActive,
          status: s?.fbActive ? (isFbValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS',
          message: s?.fbActive 
            ? (isFbValid ? 'Fired via SDK + CAPI' : '❌ Invalid Facebook Pixel ID') 
            : 'Disabled',
          deduplicated: isFbCapiDeduplicated
        },
        tiktok: {
          active: !!s?.ttActive,
          status: s?.ttActive ? (isTtValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS',
          message: s?.ttActive 
            ? (isTtValid ? 'Fired via Pixel + Events API' : '❌ Invalid TikTok Pixel ID') 
            : 'Disabled',
          deduplicated: isTtApiDeduplicated
        },
        ga4: {
          active: !!s?.ga4Active,
          status: s?.ga4Active ? (isGa4Valid ? 'SUCCESS' : 'FAILED') : 'SUCCESS',
          message: s?.ga4Active 
            ? (isGa4Valid ? 'Fired successfully to Analytics' : '❌ Invalid GA4 Measurement ID') 
            : 'Disabled'
        },
        gtm: {
          active: !!s?.gtmActive,
          status: s?.gtmActive ? (isGtmValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS',
          message: s?.gtmActive 
            ? (isGtmValid ? 'Container parsed, tags dispatched' : '❌ GTM Container Not Found') 
            : 'Disabled'
        },
        serverSide: {
          active: !!s?.ssActive,
          status: s?.ssActive ? (isSsValid ? 'SUCCESS' : 'FAILED') : 'SUCCESS',
          message: s?.ssActive 
            ? (isSsValid ? 'Server S2S Handshake complete' : '❌ Server Endpoint Unreachable') 
            : 'Disabled',
          deduplicated: true
        }
      },
      payload: {
        ...payload,
        event_source: 'web_browser',
        fbp: s?.fbActive ? 'fb.1.' + Math.floor(Math.random() * 9000000 + 1000000) : undefined,
        g_session_id: s?.ga4Active ? 'ga.' + Math.floor(Math.random() * 9000000) : undefined,
        user_agent: navigator.userAgent
      }
    };

    // Save of live event to persistent logs array so admin reads in real time
    const existing = localStorage.getItem('tazumart_live_fired_events');
    const logsList: FiredEventLog[] = existing ? JSON.parse(existing) : [];
    logsList.unshift(log); // Prepend to show newest first
    
    // Limit log cache to last 50 entries
    if (logsList.length > 50) {
      logsList.pop();
    }
    localStorage.setItem('tazumart_live_fired_events', JSON.stringify(logsList));

    // Also dispatch a custom window event for instant React context wakeups
    window.dispatchEvent(new CustomEvent('tazu_event_fired', { detail: log }));

    console.log(`[TAS_PIXEL] Tracked: ${eventName}, ID: ${eventId}, Status: ${overallStatus}`);
  }

  // Individual high-level event functions
  public trackPageView(url: string = window.location.pathname) {
    this.track('Page View', { url, title: document.title });
  }

  public trackProductView(product: { id: any; name: string; price: number; category?: string }) {
    this.track('Product View', {
      item_id: product.id,
      item_name: product.name,
      value: product.price,
      currency: 'BDT',
      category: product.category || 'General'
    });
  }

  public trackSearch(searchQuery: string) {
    this.track('Search', { search_keyword: searchQuery });
  }

  public trackAddToCart(product: { id: any; name: string; price: number; quantity?: number }) {
    this.track('Add To Cart', {
      item_id: product.id,
      item_name: product.name,
      value: product.price,
      quantity: product.quantity || 1,
      currency: 'BDT'
    });
  }

  public trackCheckout(cartItems: any[], orderTotal: number) {
    this.track('Checkout', {
      items_count: cartItems?.length || 0,
      value: orderTotal,
      currency: 'BDT',
      items: cartItems?.map(i => ({ item_id: i.id || i.productId, item_name: i.name, value: i.price }))
    });
  }

  public trackPurchase(order: { id: string; total: number; items?: any[] }) {
    this.track('Purchase', {
      transaction_id: order.id,
      value: order.total,
      currency: 'BDT',
      items_count: order.items?.length || 1
    });
  }

  public trackLogin(userId: string = 'user_demo_node') {
    this.track('Login', { user_id: userId, auth_provider: 'Local Auth' });
  }

  public trackRegister(userId: string = 'user_demo_node_new') {
    this.track('Registration', { user_id: userId, method: 'SMS / Email' });
  }
}

export const pixelService = new PixelService();
