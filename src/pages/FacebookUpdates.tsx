import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSiteManagementStore } from '../store/useSiteManagementStore';
import { Facebook, RefreshCw, AlertCircle, Globe, ThumbsUp, MessageCircle, Share2, ExternalLink } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ScrapedProfile {
  title: string | null;
  image: string | null;
  desc: string | null;
}

interface FeedPost {
  id: string;
  message: string;
  created_time: string;
  full_picture: string | null;
  permalink_url: string;
  likes: number;
  comments: number;
  shares: number;
}

export default function FacebookUpdates() {
  const { data: siteData, isLoading: loading, fetchSettings } = useSiteManagementStore();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<ScrapedProfile | null>(null);
  
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (siteData?.facebook_link) {
      initFeed(siteData.facebook_link);
    }
  }, [siteData?.facebook_link]);

  const initFeed = async (url: string) => {
    setLoadingPosts(true);
    setPosts([]);
    setPage(0);
    setHasMore(true);
    
    try {
      // 1. Fetch OG Profile Data
      const res = await fetch(`/api/feed-proxy?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!data.error) {
        let displayTitle = data.title || siteData?.facebook_feed_title || 'Official Page';
        if (displayTitle && displayTitle.includes('| Facebook')) {
           displayTitle = displayTitle.replace('| Facebook', '').trim();
        }
        data.title = displayTitle;
        setProfile(data);
        
        // 2. Fetch Initial Posts Page 0
        await loadMorePosts(url, 0, displayTitle, data.image);
      }
    } catch (e: any) {
      console.error("Feed init error:", e);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadMorePosts = async (url: string, pageIndex: number, authorName?: string, authorImg?: string) => {
      setLoadingPosts(true);
      try {
          const authName = authorName || profile?.title || 'Official Page';
          const authImg = authorImg || profile?.image || '';
          
          const res = await fetch(`/api/feed-posts?url=${encodeURIComponent(url)}&page=${pageIndex}&limit=10&author=${encodeURIComponent(authName)}&authorImg=${encodeURIComponent(authImg)}`);
          const data = await res.json();
          
          if (!data.error) {
              setPosts(prev => [...prev, ...data.posts]);
              setPage(pageIndex);
              setHasMore(data.hasMore);
          }
      } catch (e) {
          console.error("Error loading posts:", e);
      } finally {
          setLoadingPosts(false);
      }
  };

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingPosts || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && siteData?.facebook_link) {
        loadMorePosts(siteData.facebook_link, page + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingPosts, hasMore, page, siteData?.facebook_link, profile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (siteData?.facebook_link) {
        await initFeed(siteData.facebook_link);
    }
    setRefreshing(false);
  };

  const formatCount = (count?: number) => {
      if (count === undefined || count === 0) return '0';
      if (count > 1000000) return (count / 1000000).toFixed(1) + 'M';
      if (count > 1000) return (count / 1000).toFixed(1) + 'K';
      return count.toString();
  };

  if (loading || !siteData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F2F4F7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
      </div>
    );
  }

  if (!siteData.facebook_link) {
      return (
        <div className="bg-[#F2F4F7] min-h-screen pt-12 px-4 pb-24 flex justify-center">
            <div className="max-w-2xl w-full bg-white rounded-3xl p-10 border border-gray-100 shadow-sm text-center h-fit mt-12">
                <div className="w-20 h-20 bg-blue-50 text-[#1877F2] rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">No Page Configured</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                    A Facebook Page URL must be set in the Admin Panel to display the official real-time feed.
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="bg-[#F2F4F7] min-h-screen pb-24 font-sans pt-6 px-4">
      <div className="max-w-[540px] mx-auto space-y-4">
        
        {/* Custom Header Section */}
        {siteData.facebook_show_header !== false && (
          <div className="bg-white rounded-[16px] shadow-sm border border-gray-200 overflow-hidden relative z-10">
            {siteData.facebook_show_cover !== false && (
              <div className="w-full h-32 md:h-40 bg-gray-100 relative overflow-hidden group">
                {profile?.image ? (
                    <div className="absolute inset-0 bg-cover bg-center blur-md scale-110 opacity-70" style={{ backgroundImage: `url(${profile.image})` }}></div>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1877F2]/10 to-[#1877F2]/30"></div>
                )}
              </div>
            )}
            
            <div className={`px-5 md:px-6 pb-6 ${siteData.facebook_show_cover !== false ? 'pt-0' : 'pt-6'}`}>
              <div className="flex flex-col gap-4 relative">
                <div className="flex justify-between items-end">
                    <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full border-[5px] border-white bg-white shadow-sm shrink-0 flex items-center justify-center overflow-hidden z-10 ${siteData.facebook_show_cover !== false ? '-mt-14 md:-mt-16' : ''}`}>
                      {profile?.image ? (
                          <img src={profile.image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                          <Facebook className="w-16 h-16 text-[#1877F2]" />
                      )}
                    </div>
                </div>
                
                {/* Page Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {profile?.title || 'Official Page'}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[14px] font-semibold text-gray-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Official Verified Feed</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <a href={siteData.facebook_link} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1877F2] hover:bg-[#1864cc] text-white text-[15px] font-bold rounded-xl transition-colors shadow-sm">
                    Visit Official Page
                  </a>
                </div>
              </div>

              {profile?.desc && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <p className="text-[14px] text-gray-600 leading-[1.6] whitespace-pre-wrap font-medium">
                      {profile.desc}
                    </p>
                  </div>
              )}
            </div>
            
            <button 
              onClick={handleRefresh}
              className={`absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-sm transition-all hover:bg-black/60 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''} z-20`}
              disabled={refreshing}
              aria-label="Refresh Feed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        {/* Native Infinite Scroll Feed Engine */}
        <div className="w-full space-y-4">
            {posts.map((post, index) => {
               const isLast = index === posts.length - 1;
               
               return (
                  <div 
                     key={post.id}
                     ref={isLast ? lastPostElementRef : null}
                     className="bg-white rounded-[12px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 flex flex-col"
                  >
                     {/* Post Header */}
                     <div className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white shrink-0 border border-gray-200 overflow-hidden">
                               {profile?.image ? (
                                  <img src={profile.image} alt="Author" className="w-full h-full object-cover" />
                               ) : (
                                  <Facebook className="w-full h-full text-[#1877F2] p-1.5" />
                               )}
                            </div>
                            <div>
                               <h3 className="font-bold text-gray-900 text-[15px] leading-tight cursor-pointer hover:underline">
                                  {profile?.title || 'Official Page'}
                               </h3>
                               <p className="text-[13px] text-gray-500 mt-0.5 flex items-center gap-1">
                                  {formatDistanceToNow(new Date(post.created_time), { addSuffix: true })}
                                  <span>•</span>
                                  <Globe className="w-3 h-3" />
                               </p>
                            </div>
                         </div>
                         <a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:bg-gray-50 p-2 rounded-full transition-colors">
                             <ExternalLink className="w-5 h-5" />
                         </a>
                     </div>

                     {/* Post Message */}
                     <div className="px-4 pb-3">
                         <p className="text-[#050505] text-[15px] leading-[1.5] whitespace-pre-wrap font-sans">
                            {post.message}
                         </p>
                     </div>

                     {/* Post Image */}
                     {post.full_picture && (
                        <div className="w-full min-h-[200px] border-y border-gray-100 flex items-center justify-center bg-[#F2F4F7]">
                           <img src={post.full_picture} alt="Post attachment" className="w-full h-auto object-cover max-h-[600px] block" loading="lazy" />
                        </div>
                     )}

                     {/* Stats Bar */}
                     <div className="px-4 py-2.5 flex items-center justify-between text-[13px] text-gray-500 border-b border-gray-200/60">
                         <div className="flex items-center gap-1.5">
                            <div className="w-[18px] h-[18px] bg-[#1877F2] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                              <ThumbsUp className="w-2.5 h-2.5 fill-current" />
                            </div>
                            <span className="font-medium text-[#65676B]">{formatCount(post.likes)}</span>
                         </div>
                         <div className="flex items-center gap-3 text-[#65676B]">
                            <span className="hover:underline cursor-pointer">{formatCount(post.comments)} comments</span>
                            <span className="hover:underline cursor-pointer">{formatCount(post.shares)} shares</span>
                         </div>
                     </div>

                     {/* Action Bar (No Gap) */}
                     <div className="px-3 py-1 flex items-center justify-between bg-white h-[44px]">
                          <button className="flex-1 flex items-center justify-center gap-2 h-full text-[#65676B] hover:bg-[#F2F2F2] rounded-[4px] text-[15px] font-semibold transition-colors">
                              <ThumbsUp className="w-5 h-5" />
                              <span className="mt-0.5">Like</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 h-full text-[#65676B] hover:bg-[#F2F2F2] rounded-[4px] text-[15px] font-semibold transition-colors">
                              <MessageCircle className="w-5 h-5" />
                              <span className="mt-0.5">Comment</span>
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 h-full text-[#65676B] hover:bg-[#F2F2F2] rounded-[4px] text-[15px] font-semibold transition-colors">
                              <Share2 className="w-5 h-5" />
                              <span className="mt-0.5">Share</span>
                          </button>
                     </div>
                  </div>
               );
            })}

            {loadingPosts && (
              <div className="py-8 flex flex-col items-center justify-center text-gray-500 bg-transparent">
                 <Loader2 className="w-7 h-7 animate-spin text-[#1877F2] mb-3" />
                 <span className="text-[14px] font-semibold">Loading more posts...</span>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="py-10 flex flex-col items-center justify-center text-gray-500 w-full text-center">
                 <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mb-3 shadow-[12px_0_0_#d1d5db,-12px_0_0_#d1d5db]"></div>
                 <span className="text-[14px] font-medium text-gray-400">No More Posts Available</span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
