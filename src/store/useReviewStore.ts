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
  recalculateProductStats: (productId: string) => Promise<void>;
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
  subscribe: () => () => void;
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

  // Helper to recalculate product stats
  recalculateProductStats: async (productId: string) => {
    try {
      // 1. Fetch all approved reviews for this product
      const { data: approvedReviews, error: fetchError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('status', 'approved');

      if (fetchError) throw fetchError;

      const count = approvedReviews?.length || 0;
      const average = count > 0 
        ? Number((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
        : 4.5; // Default back to 4.5 if no reviews

      // 2. Update product table
      const { error: updateError } = await supabase
        .from('products')
        .update({
          rating: average,
          reviews: count
        })
        .eq('id', productId);

      if (updateError) {
        console.error("Error updating product stats:", updateError);
      }
    } catch (err) {
      console.error("Failed to recalculate product stats:", err);
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

      // 2. Direct Supabase Insertion
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([{
          product_id: newRev.productId,
          user_id: String(newRev.customerId || 'anonymous'),
          customer_name: String(newRev.customerName || 'Anonymous'),
          rating: Number(newRev.rating),
          review_text: String(newRev.reviewText),
          status: newRev.status || 'approved',
          media_urls: Array.isArray(newRev.mediaUrls) ? newRev.mediaUrls : [],
          verified: newRev.verified ?? true,
          phone: newRev.phone ? String(newRev.phone) : null,
          email: newRev.email ? String(newRev.email) : null,
          order_id: newRev.orderId ? String(newRev.orderId) : null,
          device_ip: newRev.deviceIP,
          anonymous: !!newRev.anonymous,
          is_pinned: false,
          created_at: newRev.createdAt || new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(`Database Error: ${insertError.message}`);
      }

      const insertedData = data;

      // 3. Update local state
      const addedReview: ProductReview = {
        reviewId: insertedData.id,
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
        reviews: [addedReview, ...state.reviews]
      }));

      // 4. Recalculate product stats if status is approved
      if (newRev.status === 'approved') {
        await get().recalculateProductStats(newRev.productId);
      }

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
      if ((updates as any).productId) dbUpdates.product_id = (updates as any).productId;

      const { error } = await supabase
        .from('reviews')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
      
      // Get the review to know which product to update
      const review = get().reviews.find(r => r.reviewId === id);
      if (review) {
        await get().recalculateProductStats(review.productId);
        // If product was changed, recalculate for the new product too
        if ((updates as any).productId && (updates as any).productId !== review.productId) {
          await get().recalculateProductStats((updates as any).productId);
        }
      }

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
      const review = get().reviews.find(r => r.reviewId === id);
      const productId = review?.productId;

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        reviews: state.reviews.filter((r) => r.reviewId !== id)
      }));

      if (productId) {
        await get().recalculateProductStats(productId);
      }

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
  },

  subscribe: () => {
    const channel = supabase
      .channel('public:reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, (payload) => {
        get().fetchReviews(true);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));

