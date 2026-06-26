import { create } from 'zustand';

export interface ProductReview {
  reviewId: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1 to 5
  reviewText: string;
  mediaUrls: string[]; // JPG, PNG, WEBP, MP4
  adminReply?: string;
  status: 'pending' | 'approved' | 'hidden' | 'rejected';
  verified: boolean;
  createdAt: string; // ISO String
  
  // Extra detailed metadata requested
  phone?: string;
  email?: string;
  orderId?: string;
  deviceIP?: string;
  anonymous?: boolean;
  isPinned?: boolean;
  rejectionReason?: string;
}

export interface ReviewNotification {
  id: string;
  message: string;
  type: 'info' | 'alert';
  createdAt: string;
  read: boolean;
}

interface ReviewState {
  reviews: ProductReview[];
  notifications: ReviewNotification[];
  
  // Actions
  addReview: (review: Omit<ProductReview, 'reviewId' | 'createdAt' | 'status'> & { status?: 'pending' | 'approved' | 'hidden' | 'rejected' }) => void;
  updateReview: (reviewId: string, updates: Partial<Omit<ProductReview, 'reviewId' | 'productId' | 'customerId' | 'createdAt'>>) => void;
  approveReview: (reviewId: string) => void;
  hideReview: (reviewId: string) => void;
  rejectReview: (reviewId: string, reason?: string) => void;
  deleteReview: (reviewId: string) => void;
  pinReview: (reviewId: string) => void;
  markVerifiedPurchase: (reviewId: string, verified: boolean) => void;
  replyToReview: (reviewId: string, reply: string) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [
    {
      reviewId: 'rev-101',
      productId: 'f1',
      customerId: 'cust-201',
      customerName: 'Sabbir Ahmed',
      rating: 5,
      reviewText: 'Absolutely loved the Premium Cotton T-Shirt! The stitching is robust, fabric is soft, and it did not shrink after washing. Fits perfectly and looks highly premium. Best shopping experience!',
      mediaUrls: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60'
      ],
      adminReply: 'Thank you so much Sabbir! We take pride in sourcing the highest grade Egyptian cotton for our premium lineup.',
      status: 'approved',
      verified: true,
      createdAt: '2026-05-18T10:14:22.000Z',
      phone: '+880 1712-345678',
      email: 'sabbir.ahmed@gmail.com',
      orderId: 'ORD-982431',
      deviceIP: '192.168.12.45',
      anonymous: false,
      isPinned: true
    },
    {
      reviewId: 'rev-102',
      productId: 'e1',
      customerId: 'cust-202',
      customerName: 'Anika Tabassum',
      rating: 4,
      reviewText: 'Smart Watch is sleek with high-quality AMOLED screen. Battery easily lasts 4-5 days on regular usage. The step counter is relatively accurate. Fast delivery by Tazu Mart!',
      mediaUrls: [
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60'
      ],
      status: 'approved',
      verified: true,
      createdAt: '2026-05-20T14:32:00.000Z',
      phone: '+880 1922-987654',
      email: 'anika.tabassum@gmail.com',
      orderId: 'ORD-774211',
      deviceIP: '103.120.45.67',
      anonymous: false,
      isPinned: false
    },
    {
      reviewId: 'rev-103',
      productId: 'f3',
      customerId: 'cust-203',
      customerName: 'Fahim Rahman',
      rating: 5,
      reviewText: 'Casual Linen Shirt is highly breathable and perfect for hot summer days. The fit is superb. Fast logistics, received in Gazipur in 24 hours!',
      mediaUrls: [],
      status: 'approved',
      verified: true,
      createdAt: '2026-05-21T09:20:10.000Z',
      phone: '+880 1511-223344',
      email: 'fahim.rahman@gmail.com',
      orderId: 'ORD-554320',
      deviceIP: '180.234.12.89',
      anonymous: false,
      isPinned: false
    },
    {
      reviewId: 'rev-104',
      productId: 'p1',
      customerId: 'cust-204',
      customerName: 'Mehedi Hasan',
      rating: 3,
      reviewText: 'Fragrance profile is outstanding, premium Oud scent that lingers, but the bottle spray cap was slightly leaky. Hopefully, customer support will look into my feedback.',
      mediaUrls: [
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60'
      ],
      status: 'approved',
      verified: false,
      createdAt: '2026-05-22T04:12:30.000Z',
      phone: '+880 1819-445566',
      email: 'mehedi.hasan@yahoo.com',
      orderId: 'ORD-122489',
      deviceIP: '203.84.156.41',
      anonymous: false,
      isPinned: false
    },
    {
      reviewId: 'rev-205',
      productId: 'wallet-1',
      customerId: 'CUST-205',
      customerName: 'Tasnim Alam',
      rating: 5,
      reviewText: 'Genuine leather, nicely packaged with a premium box. Slim design, holds cards and cash comfortably. Excellent quality and highly recommended.',
      mediaUrls: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=300&h=300&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550520920-27af501da97d?q=80&w=300&h=300&auto=format&fit=crop',
        'https://www.w3schools.com/html/mov_bbb.mp4'
      ],
      status: 'pending',
      verified: true,
      createdAt: '2026-05-22T07:45:15.000Z',
      phone: '+8801314556677',
      email: 'tasnim@example.com',
      orderId: 'TMB-88225544',
      deviceIP: '103.23.45.11',
      anonymous: false,
      isPinned: false
    }
  ],
  notifications: [],

  addReview: (newRev) => {
    const reviewId = `rev-${Math.floor(100000 + Math.random() * 900000)}`;
    const review: ProductReview = {
      ...newRev,
      reviewId,
      createdAt: new Date().toISOString(),
      status: 'approved' // Automatically auto-approved, published, and visible
    };

    set((state) => {
      const updatedReviews = [review, ...state.reviews];
      return {
        reviews: updatedReviews,
        notifications: state.notifications
      };
    });
  },

  updateReview: (id, updates) => {
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.reviewId === id ? { ...r, ...updates } : r
      )
    }));
  },

  approveReview: (id) => {
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.reviewId === id ? { ...r, status: 'approved' } : r
      )
    }));
  },

  hideReview: (id) => {
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.reviewId === id ? { ...r, status: 'hidden' } : r
      )
    }));
  },

  rejectReview: (id, reason) => {
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.reviewId === id ? { ...r, status: 'rejected', rejectionReason: reason } : r
      )
    }));
  },

  deleteReview: (id) => {
    set((state) => ({
      reviews: state.reviews.filter((r) => r.reviewId !== id)
    }));
  },

  pinReview: (id) => {
    set((state) => ({
      reviews: state.reviews.map((r) => {
        if (r.reviewId === id) {
          return { ...r, isPinned: !r.isPinned };
        }
        return r;
      })
    }));
  },

  markVerifiedPurchase: (id, verified) => {
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.reviewId === id ? { ...r, verified } : r
      )
    }));
  },

  replyToReview: (id, reply) => {
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.reviewId === id ? { ...r, adminReply: reply } : r
      )
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  markNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }));
  }
}));
