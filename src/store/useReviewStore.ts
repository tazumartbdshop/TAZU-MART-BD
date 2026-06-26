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
  fetchReviews: () => Promise<void>;
  addReview: (review: Omit<ProductReview, 'reviewId' | 'createdAt' | 'status'> & { status?: 'pending' | 'approved' | 'hidden' | 'rejected' }) => Promise<void>;
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

  fetchReviews: async () => {
    set({ isLoading: true });
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
      toast.error('Failed to load reviews');
      set({ isLoading: false });
    }
  },

  addReview: async (newRev) => {
    try {
      // 1. Basic Auth Check
      if (!newRev.customerId) {
        throw { 
          title: 'Authentication Required',
          reason: 'Customer is not logged in.',
          solution: 'Please log in to your account and try again.'
        };
      }

      // 2. Data Validation
      if (!newRev.rating) {
        throw { 
          title: 'Rating Required',
          reason: 'No star rating selected.',
          solution: 'Please select a rating between 1 and 5 stars.'
        };
      }

      if (!newRev.reviewText || newRev.reviewText.trim().length === 0) {
        throw { 
          title: 'Review Text Empty',
          reason: 'The review text field is empty.',
          solution: 'Please write your feedback about the product.'
        };
      }

      // 3. Database Schema Integrity Checks
      // Check if table exists and columns are correct
      const { error: schemaError } = await supabase
        .from('reviews')
        .select('id, product_id, user_id, rating, review_text, status, created_at, updated_at')
        .limit(1);

      if (schemaError) {
        if (schemaError.code === 'PGRST116' || schemaError.message?.includes('does not exist')) {
          throw {
            title: 'Database Table Missing',
            reason: 'The "reviews" table was not found in the database.',
            table: 'reviews',
            solution: 'Create the "reviews" table in your Supabase SQL editor using the provided schema.'
          };
        }
        
        if (schemaError.message?.includes('column')) {
          const missingCol = schemaError.message.match(/column "(.*?)"/)?.[1] || 'unknown';
          throw {
            title: 'Missing Database Column',
            reason: `A required column is missing from the database.`,
            table: 'reviews',
            missingColumn: missingCol,
            solution: `Add the "${missingCol}" column to the "reviews" table.`
          };
        }

        throw {
          title: 'Database Error',
          reason: schemaError.message,
          solution: 'Please check your database permissions and RLS policies.'
        };
      }

      // 4. Duplicate Review Check
      const { data: existingReview, error: duplicateError } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', newRev.productId)
        .eq('user_id', newRev.customerId)
        .limit(1)
        .single();

      if (existingReview) {
        throw {
          title: 'Duplicate Review',
          reason: 'You have already submitted a review for this product.',
          solution: 'You can only review each product once. To change your feedback, please contact support.'
        };
      }

      // 5. Final Insertion
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([{
          product_id: newRev.productId,
          user_id: newRev.customerId,
          customer_name: newRev.customerName,
          rating: newRev.rating,
          review_text: newRev.reviewText,
          status: 'pending',
          media_urls: newRev.mediaUrls,
          verified: newRev.verified,
          phone: newRev.phone,
          email: newRev.email,
          order_id: newRev.orderId,
          device_ip: newRev.deviceIP,
          anonymous: newRev.anonymous,
          is_pinned: false
        }])
        .select()
        .single();

      if (insertError) {
        throw {
          title: 'Submission Failed',
          reason: insertError.message,
          solution: 'The database rejected the entry. Check foreign key constraints and permissions.'
        };
      }
      
      await get().fetchReviews();
      toast.success('Review submitted successfully. Waiting for admin approval.');
    } catch (error: any) {
      console.error('Detailed Review Error:', error);
      // Re-throw structured error for UI handling
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

