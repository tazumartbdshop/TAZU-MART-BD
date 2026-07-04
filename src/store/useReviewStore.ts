import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export interface ProductReview {
  reviewId: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  mediaUrls: string[];
  adminReply?: string;
  status: 'pending' | 'approved' | 'hidden' | 'rejected';
  verified: boolean;
  createdAt: string;
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
  isLoading: boolean;
  fetchReviews: (silent?: boolean) => Promise<void>;
  addReview: (review: any) => Promise<void>;
  updateReview: (reviewId: string, updates: any) => Promise<void>;
  approveReview: (reviewId: string) => Promise<void>;
  hideReview: (reviewId: string) => Promise<void>;
  rejectReview: (reviewId: string, reason?: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  pinReview: (reviewId: string) => Promise<void>;
  markVerifiedPurchase: (reviewId: string, verified: boolean) => Promise<void>;
  replyToReview: (reviewId: string, reply: string) => Promise<void>;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  notifications: [],
  isLoading: false,

  fetchReviews: async (silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      const mapped = data.map((r: any) => ({
        reviewId: String(r.id),
        productId: String(r.product_id),
        customerId: String(r.user_id),
        customerName: r.customer_name,
        rating: r.rating,
        reviewText: r.review_text,
        mediaUrls: typeof r.media_urls === 'string' ? JSON.parse(r.media_urls) : (r.media_urls || []),
        adminReply: r.admin_reply,
        status: r.status,
        verified: r.verified,
        createdAt: r.created_at,
        phone: r.phone,
        email: r.email,
        orderId: r.order_id,
        deviceIP: r.device_ip,
        anonymous: !!r.anonymous,
        isPinned: !!r.is_pinned,
        rejectionReason: r.rejection_reason
      }));
      set({ reviews: mapped, isLoading: false });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      set({ isLoading: false });
    }
  },

  addReview: async (newRev) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newRev.productId,
          userId: newRev.customerId,
          customerName: newRev.customerName,
          rating: newRev.rating,
          reviewText: newRev.reviewText,
          mediaUrls: newRev.mediaUrls,
          status: newRev.status || 'pending',
          verified: newRev.verified
        })
      });
      if (res.ok) {
        get().fetchReviews(true);
        toast.success('Review submitted successfully');
      }
    } catch (error) {
      console.error('addReview error:', error);
      toast.error('Failed to submit review');
    }
  },

  updateReview: async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        get().fetchReviews(true);
      }
    } catch (error) {
      console.error('Error updating review:', error);
    }
  },

  approveReview: async (id) => {
    await get().updateReview(id, { status: 'approved' });
    toast.success('Review approved');
  },

  hideReview: async (id) => {
    await get().updateReview(id, { status: 'hidden' });
    toast.success('Review hidden');
  },

  rejectReview: async (id, reason) => {
    await get().updateReview(id, { status: 'rejected', rejection_reason: reason });
    toast.success('Review rejected');
  },

  deleteReview: async (id) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((state) => ({
          reviews: state.reviews.filter((r) => r.reviewId !== id)
        }));
        toast.success('Review deleted');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  },

  pinReview: async (id) => {
    const review = get().reviews.find(r => r.reviewId === id);
    if (review) {
      await get().updateReview(id, { is_pinned: !review.isPinned });
    }
  },

  markVerifiedPurchase: async (id, verified) => {
    await get().updateReview(id, { verified });
  },

  replyToReview: async (id, reply) => {
    await get().updateReview(id, { admin_reply: reply });
  },

  clearNotifications: () => set({ notifications: [] }),
  markNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }));
  }
}));
