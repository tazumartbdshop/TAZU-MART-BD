import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

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
  isLoading: boolean;
  
  // Actions
  fetchReviews: (silent?: boolean) => Promise<void>;
  addReview: (review: Omit<ProductReview, 'reviewId' | 'createdAt' | 'status'> & { status?: 'pending' | 'approved' | 'hidden' | 'rejected', createdAt?: string }) => Promise<void>;
  updateReview: (reviewId: string, updates: Partial<Omit<ProductReview, 'reviewId' | 'productId' | 'customerId' | 'createdAt'>>) => Promise<void>;
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
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews: ProductReview[] = (data || []).map(r => ({
        reviewId: r.id,
        productId: r.product_id,
        customerId: r.user_id,
        customerName: r.customer_name,
        rating: r.rating,
        reviewText: r.review_text,
        mediaUrls: r.media_urls || [],
        adminReply: r.admin_reply,
        status: r.status,
        verified: r.verified,
        createdAt: r.created_at,
        phone: r.phone,
        email: r.email,
        orderId: r.order_id,
        deviceIP: r.device_ip,
        anonymous: r.anonymous,
        isPinned: r.is_pinned,
        rejectionReason: r.rejection_reason
      }));

      set({ reviews: formattedReviews, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      if (!silent) toast.error('Failed to load reviews');
      set({ isLoading: false });
    }
  },

  addReview: async (newRev) => {
    try {
      // 1. Basic Validation
      if (!newRev.rating) {
        throw new Error('Rating is required.');
      }

      if (!newRev.reviewText || newRev.reviewText.trim().length === 0) {
        throw new Error('Review text is required.');
      }

      // 2. Direct Supabase Insertion (Without artificial schema check)
      let insertedData: any = null;
      try {
        const { data, error: insertError } = await supabase
          .from('reviews')
          .insert([{
            product_id: newRev.productId,
            user_id: newRev.customerId || 'anonymous',
            customer_name: newRev.customerName || 'Anonymous',
            rating: newRev.rating,
            review_text: newRev.reviewText,
            status: newRev.status || 'approved',
            media_urls: newRev.mediaUrls || [],
            verified: newRev.verified ?? true,
            phone: newRev.phone,
            email: newRev.email,
            order_id: newRev.orderId,
            device_ip: newRev.deviceIP,
            anonymous: newRev.anonymous,
            is_pinned: false,
            created_at: newRev.createdAt || new Date().toISOString()
          }])
          .select()
          .single();

        if (insertError) {
          console.warn("Supabase insert error (falling back to local state):", insertError);
        } else {
          insertedData = data;
        }
      } catch (dbErr) {
        console.warn("Supabase database error (falling back to local state):", dbErr);
      }

      // 3. Update local state instantly so it appears in the review list
      const addedReview: ProductReview = {
        reviewId: insertedData?.id || `rev-local-${Date.now()}`,
        productId: newRev.productId,
        customerId: newRev.customerId || 'anonymous',
        customerName: newRev.customerName || 'Anonymous',
        rating: newRev.rating,
        reviewText: newRev.reviewText,
        mediaUrls: newRev.mediaUrls || [],
        status: newRev.status || 'approved',
        verified: newRev.verified ?? true,
        createdAt: newRev.createdAt || new Date().toISOString(),
        phone: newRev.phone,
        email: newRev.email,
        orderId: newRev.orderId,
        deviceIP: newRev.deviceIP,
        anonymous: newRev.anonymous,
        isPinned: false
      };

      set((state) => ({
        reviews: [addedReview, ...state.reviews.filter(r => r.reviewId !== addedReview.reviewId)]
      }));

    } catch (error: any) {
      console.error('addReview error:', error);
      throw error;
    }
  },

  updateReview: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.adminReply !== undefined) dbUpdates.admin_reply = updates.adminReply;
      if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
      if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
      if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
      if (updates.customerName) dbUpdates.customer_name = updates.customerName;
      if (updates.reviewText) dbUpdates.review_text = updates.reviewText;
      if (updates.rating) dbUpdates.rating = updates.rating;

      const { error } = await supabase
        .from('reviews')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      await get().fetchReviews();
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  },

  approveReview: async (id) => {
    await get().updateReview(id, { status: 'approved' });
    toast.success('Review approved and published');
  },

  hideReview: async (id) => {
    await get().updateReview(id, { status: 'hidden' });
    toast.success('Review hidden from public');
  },

  rejectReview: async (id, reason) => {
    await get().updateReview(id, { status: 'rejected', rejectionReason: reason });
    toast.success('Review rejected');
  },

  deleteReview: async (id) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        reviews: state.reviews.filter((r) => r.reviewId !== id)
      }));
      toast.success('Review deleted permanently');
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  },

  pinReview: async (id) => {
    const review = get().reviews.find(r => r.reviewId === id);
    if (review) {
      await get().updateReview(id, { isPinned: !review.isPinned });
      toast.success(review.isPinned ? 'Review unpinned' : 'Review pinned');
    }
  },

  markVerifiedPurchase: async (id, verified) => {
    await get().updateReview(id, { verified });
  },

  replyToReview: async (id, reply) => {
    await get().updateReview(id, { adminReply: reply });
    toast.success('Reply saved');
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

