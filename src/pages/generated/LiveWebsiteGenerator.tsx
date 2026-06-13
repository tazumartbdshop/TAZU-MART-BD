import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Check, Menu, X, User, Heart, Percent, 
  Phone, MessageSquare, Mail, MapPin, ChevronRight, Compass, 
  Coins, Award, LogOut, ArrowRight, Trash2, CheckCircle, Ticket,
  Laptop, Smartphone, ShoppingCart, Zap, Star, Building, Plus, Lock, Unlock, Home, PlusCircle
} from 'lucide-react';
import { useWebsitesStore } from '../../store/useWebsitesStore';
import { useProductStore, Product } from '../../store/useProductStore';

const defaultProperties = [
  {
    id: 'prop-1',
    user_id: 'system',
    title: 'Luxury 3BR Apartment in Banani',
    description: 'A gorgeous, spacious 3-bedroom luxury apartment with stunning cityscape views, smart home integrations, dual parking spots, and premium marble flooring.',
    price: 45000000,
    address: 'Road 11, Banani, Dhaka',
    category: 'Apartment',
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'prop-2',
    user_id: 'system',
    title: 'Cozy Duplex Villa in Dhanmondi',
    description: 'Modern duplex villa with garden terrace, beautifully designed architectural high-ceilings, fully equipped wooden modular kitchen, and secure personal security room.',
    price: 65000000,
    address: 'Road 27, Dhanmondi, Dhaka',
    category: 'Duplex',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'prop-3',
    user_id: 'system',
    title: 'Commercial Space near Gulshan Circle-2',
    description: 'Highly visible executive commercial office space, centralized HVAC cooling, high-speed capsule lift, 24/7 power backup generator, and spacious high prestige reception lobby.',
    price: 85000000,
    address: 'Gulshan avenue, Circle-2, Gulshan, Dhaka',
    category: 'Commercial',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'prop-4',
    user_id: 'system',
    title: 'Scenic Waterfront Residential Land plot',
    description: 'Fully cleared, prestigious south-facing 5-Katha residential building plot. Connected to dual high-capacity access roads and direct municipal freshwater supply.',
    price: 32000000,
    address: 'Sector 15, Uttara Third Phase, Dhaka',
    category: 'Land',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

export default function LiveWebsiteGenerator() {
  const { storeDomain } = useParams();
  const navigate = useNavigate();
  const website = useWebsitesStore(state => state.getWebsiteByDomain(storeDomain || ''));
  const { products } = useProductStore();

  // Navigation & Tabs
  const [currentView, setCurrentView] = useState<'home' | 'categories' | 'offers' | 'support' | 'account' | 'properties'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Cart & Wishlist & Coins
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coins, setCoins] = useState<number>(350); // Default dynamic Tazu Coins
  const [orders, setOrders] = useState<any[]>([
    { id: 'ORD-8104', date: 'May 24, 2026', total: 1200, coinsEarned: 150, status: 'Shipped', itemsCount: 1 }
  ]);

  // Order Success Celebration Toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Inquiry Form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);

  // Property Listing & Liking & Auth State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>(defaultProperties);
  const [likedPropIds, setLikedPropIds] = useState<string[]>([]);
  const [isFetchingProps, setIsFetchingProps] = useState(false);
  const [selectedPropCategoryFilter, setSelectedPropCategoryFilter] = useState<string>('All');
  
  // Custom property form state
  const [showListForm, setShowListForm] = useState(false);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropDescription, setNewPropDescription] = useState('');
  const [newPropPrice, setNewPropPrice] = useState('');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropCategory, setNewPropCategory] = useState('Apartment');
  const [newPropImageUrl, setNewPropImageUrl] = useState('');
  const [isListingProperty, setIsListingProperty] = useState(false);

  // Customer Auth forms state
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Monitor Supabase Auth changes
  useEffect(() => {
    let authSub: any = null;
    const initAuthAndData = async () => {
      try {
        const { getSupabase } = await import('../../lib/supabase');
        const supabase = getSupabase();
        if (supabase) {
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setCurrentUser(session.user);
          }

          // Monitor Auth Changes
          const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setCurrentUser(session?.user || null);
          });
          authSub = data?.subscription;
        }
      } catch (err) {
        console.warn("Supabase auth error in LiveWebsiteGenerator:", err);
      }
    };
    initAuthAndData();
    return () => {
      if (authSub) authSub.unsubscribe();
    };
  }, []);

  // Sync Properties & Likes
  useEffect(() => {
    const fetchPropertiesAndLikes = async () => {
      setIsFetchingProps(true);
      try {
        const { getSupabase } = await import('../../lib/supabase');
        const supabase = getSupabase();
        if (supabase) {
          // Fetch custom properties from DB
          const { data: dbProps, error: propsError } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

          if (!propsError && dbProps) {
            // Merge custom properties with defaults, unique by ID
            const merged = [...dbProps];
            defaultProperties.forEach(def => {
              if (!merged.some(m => m.id === def.id)) {
                merged.push(def);
              }
            });
            setProperties(merged);
          } else {
            console.warn("properties table read failed (table may not exist yet, using fallback):", propsError);
            const stored = localStorage.getItem('tazu_local_properties');
            if (stored) {
              setProperties(JSON.parse(stored));
            } else {
              setProperties(defaultProperties);
            }
          }

          // Fetch liked property ids for the logged in user
          if (currentUser) {
            const { data: dbLikes, error: likesError } = await supabase
              .from('liked_properties')
              .select('property_id')
              .eq('user_id', currentUser.id);

            if (!likesError && dbLikes) {
              setLikedPropIds(dbLikes.map((l: any) => l.property_id));
            } else {
              const localLikes = localStorage.getItem(`tazu_liked_props_${currentUser.id}`);
              if (localLikes) {
                setLikedPropIds(JSON.parse(localLikes));
              } else {
                setLikedPropIds([]);
              }
            }
          } else {
            setLikedPropIds([]);
          }
        } else {
          // Fallback if supabase not configured matching localStorage info
          const stored = localStorage.getItem('tazu_local_properties');
          const localLikes = currentUser ? localStorage.getItem(`tazu_liked_props_${currentUser.id}`) : null;
          
          if (stored) {
            setProperties(JSON.parse(stored));
          } else {
            setProperties(defaultProperties);
          }

          if (localLikes) {
            setLikedPropIds(JSON.parse(localLikes));
          } else {
            setLikedPropIds([]);
          }
        }
      } catch (err) {
        console.warn("Could not fetch properties/likes from Supabase, operating in local fallback:", err);
        const stored = localStorage.getItem('tazu_local_properties');
        if (stored) {
          setProperties(JSON.parse(stored));
        } else {
          setProperties(defaultProperties);
        }
      } finally {
        setIsFetchingProps(false);
      }
    };

    fetchPropertiesAndLikes();
  }, [currentUser]);

  // Handle Sign In
  const handleCustomerSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) {
      setAuthError("Email and Password are required");
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const { getSupabase } = await import('../../lib/supabase');
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.toLowerCase().trim(),
          password: authPassword,
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          setCurrentUser(data.user);
          setAuthEmail('');
          setAuthPassword('');
          setAuthName('');
        }
      } else {
        // Dev Fallback mode
        const fakeUserId = 'usr_local_dev_' + Math.floor(Math.random() * 1000000);
        const devUser = { id: fakeUserId, email: authEmail.toLowerCase().trim(), user_metadata: { full_name: authName || 'Valued Member' } };
        setCurrentUser(devUser);
        alert("Configured in Developer local mode! Access approved.");
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err: any) {
      console.error("Auth signin error:", err);
      setAuthError(err.message || "Invalid login credentials.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Sign Up
  const handleCustomerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword || !authName.trim()) {
      setAuthError("All fields are required");
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const { getSupabase } = await import('../../lib/supabase');
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.toLowerCase().trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authName.trim(),
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          setCurrentUser(data.user);
          alert("Registered successfully! Welcome to your digital terminal.");
          setAuthEmail('');
          setAuthPassword('');
          setAuthName('');
        }
      } else {
        // Dev Fallback
        const fakeUserId = 'usr_local_dev_' + Math.floor(Math.random() * 1000000);
        const devUser = { id: fakeUserId, email: authEmail.toLowerCase().trim(), user_metadata: { full_name: authName.trim() } };
        setCurrentUser(devUser);
        alert("Registered successfully via Developer local mode!");
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      }
    } catch (err: any) {
      console.error("Auth signup error:", err);
      setAuthError(err.message || "Signup failed. Try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleCustomerSignOut = async () => {
    try {
      const { getSupabase } = await import('../../lib/supabase');
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Sign out err:", e);
    }
    setCurrentUser(null);
    setLikedPropIds([]);
  };

  // Like or Save property
  const toggleLikeProperty = async (propertyId: string) => {
    if (!currentUser) {
      alert("Please log in from the Customer Terminal / Account tab to save or like properties!");
      setCurrentView('account');
      return;
    }

    const isCurrentlyLiked = likedPropIds.includes(propertyId);
    let newLikedIds = [...likedPropIds];

    if (isCurrentlyLiked) {
      newLikedIds = newLikedIds.filter(id => id !== propertyId);
    } else {
      newLikedIds.push(propertyId);
    }

    setLikedPropIds(newLikedIds);
    localStorage.setItem(`tazu_liked_props_${currentUser.id}`, JSON.stringify(newLikedIds));

    try {
      const { getSupabase } = await import('../../lib/supabase');
      const supabase = getSupabase();
      if (supabase) {
        if (isCurrentlyLiked) {
          await supabase
            .from('liked_properties')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('property_id', propertyId);
        } else {
          await supabase
            .from('liked_properties')
            .insert([{
              user_id: currentUser.id,
              property_id: propertyId
            }]);
        }
      }
    } catch (err) {
      console.warn("Supabase background like update failed, fallback saved locally:", err);
    }
  };

  // Submitting property listing
  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in to list properties!");
      setCurrentView('account');
      return;
    }

    if (!newPropTitle.trim() || !newPropPrice || !newPropAddress.trim() || !newPropDescription.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    setIsListingProperty(true);

    const newProp = {
      id: 'prop-user-' + Math.floor(Math.random() * 100000),
      user_id: currentUser.id,
      title: newPropTitle.trim(),
      description: newPropDescription.trim(),
      price: Number(newPropPrice),
      address: newPropAddress.trim(),
      category: newPropCategory,
      image_url: newPropImageUrl.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
      status: 'active',
      created_at: new Date().toISOString()
    };

    try {
      const { getSupabase } = await import('../../lib/supabase');
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase
          .from('properties')
          .insert([newProp]);
        if (error) {
          throw error;
        }
      }
      
      // Update local state directly
      const updatedProps = [newProp, ...properties];
      setProperties(updatedProps);
      localStorage.setItem('tazu_local_properties', JSON.stringify(updatedProps));
      
      alert("🎉 Property listed successfully in corporate archives!");
      
      // Reset form
      setNewPropTitle('');
      setNewPropDescription('');
      setNewPropPrice('');
      setNewPropAddress('');
      setNewPropImageUrl('');
      setShowListForm(false);
    } catch (err: any) {
      console.warn("Supabase insert error, saving locally:", err);
      // Fallback
      const updatedProps = [newProp, ...properties];
      setProperties(updatedProps);
      localStorage.setItem('tazu_local_properties', JSON.stringify(updatedProps));
      alert("Listed successfully in local backup storage!");
      
      setNewPropTitle('');
      setNewPropDescription('');
      setNewPropPrice('');
      setNewPropAddress('');
      setNewPropImageUrl('');
      setShowListForm(false);
    } finally {
      setIsListingProperty(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    setIsSubmittingInquiry(true);
    setInquirySuccess(null);

    try {
      const { getSupabase } = await import('../../lib/supabase');
      const supabase = getSupabase();
      if (supabase) {
        // Insert payload into 'inquiries' table
        const { error } = await supabase.from('inquiries').insert([{
          website_domain: website?.domain || null,
          name: inquiryName.trim(),
          phone: inquiryPhone.trim(),
          message: inquiryMessage.trim(),
          status: 'new',
          created_at: new Date().toISOString()
        }]);

        if (error) {
          console.error("Supabase inquiries insert error:", error);
          throw error;
        }

        setInquirySuccess("Message successfully transmitted to corporate database!");
        setInquiryName('');
        setInquiryPhone('');
        setInquiryMessage('');
      } else {
        // Local Fallback if offline
        setInquirySuccess("Saved locally! (Database link is currently in fallback mode)");
        setInquiryName('');
        setInquiryPhone('');
        setInquiryMessage('');
      }
    } catch (err: any) {
      console.error("Failed to submit inquiry:", err);
      alert("Failed to submit message to the corporate desk. Technical error: " + (err.message || err));
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Favicon update
  useEffect(() => {
    if (website && website.logo) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = website.logo;
    }
    // Update Document Title
    if (website) {
      document.title = website.website_name + " - Shortcut Store";
    }
    return () => {
      document.title = "Tazu Mart BD";
    };
  }, [website]);

  if (!website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50">
        <h2 className="text-2xl font-black text-red-600 mb-2 font-mono uppercase">STORE NOT FOUND</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">The requested domain has not been deployed yet.</p>
        <Link to="/admin" className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors">
          Go To Website Builder
        </Link>
      </div>
    );
  }

  // Corner style setup
  const isSquare = website.theme_type?.includes('Sharp') || website.theme_type?.includes('Square') || !website.theme_type;
  const radiusClass = isSquare ? 'rounded-none' : 'rounded-lg';
  const inputClass = `w-full border border-zinc-200 p-3 text-sm font-bold outline-none bg-white transition-all focus:border-black ${radiusClass}`;
  const btnClass = `font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all text-center select-none cursor-pointer flex items-center justify-center gap-2 px-6 py-3.5 text-white ${radiusClass}`;

  // Color dynamic styles
  const colPrimary = website.primary_color || '#000000';
  const currSign = website.currency === 'USD' ? '$' : '৳';

  // Categories loading
  const categoriesList = website.categories || ['Smartphone', 'Fashion', 'Grocery'];

  // Match and fetch products dynamically
  const getProductsByCategory = (catName: string) => {
    // Filter active products matching category name (case-insensitive)
    const matching = products.filter(p => p.category?.toLowerCase().trim() === catName.toLowerCase().trim() && p.status === 'active');
    
    if (matching.length > 0) return matching;

    // Fallbacks if store has no products for this category explicitly
    const fallbackImages: Record<string, string[]> = {
      smartphone: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
        "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80"
      ],
      fashion: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80",
        "https://images.unsplash.com/photo-1434389678369-182cb2088f11?w=400&q=80"
      ],
      grocery: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
        "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&q=80",
        "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&q=80",
        "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80"
      ]
    };

    const cleanCat = catName.toLowerCase().trim();
    let imgPool = fallbackImages.fashion;
    if (cleanCat.includes('phone') || cleanCat.includes('gadg') || cleanCat.includes('smart') || cleanCat.includes('elect')) {
      imgPool = fallbackImages.smartphone;
    } else if (cleanCat.includes('groc') || cleanCat.includes('food') || cleanCat.includes('eat') || cleanCat.includes('needs')) {
      imgPool = fallbackImages.grocery;
    }

    return [1, 2, 3, 4].map(n => ({
      id: `${cleanCat}-fallback-${n}`,
      name: `${catName} Premium Edition ${n}`,
      price: n * 850 + 420,
      discountPrice: n * 850 + 120,
      stock: 40,
      image: imgPool[(n - 1) % imgPool.length],
      category: catName,
      isNew: n === 1,
      rating: 4.5 + (n % 4) * 0.1,
      reviews: n * 14 + 3,
      reward_coins: n * 60,
      coin_enabled: true
    }));
  };

  // Get active items with optional search
  const getAllSearchableProducts = () => {
    // Generate combined product index for this store
    const list: any[] = [];
    categoriesList.forEach(cat => {
      const catProd = getProductsByCategory(cat);
      catProd.forEach((p: any) => {
        if (!list.some(existing => existing.id === p.id)) {
          list.push(p);
        }
      });
    });

    if (!searchQuery.trim()) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  };

  // Get offers products
  const getOfferProducts = () => {
    const list = getAllSearchableProducts();
    return list.filter(p => p.discountPrice && p.discountPrice < p.price);
  };

  // Cart operations
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const removeFromCart = (pId: string) => {
    setCart(cart.filter(item => item.product.id !== pId));
  };

  const updateCartQty = (pId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === pId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const cartTotal = getCartTotal();
    const earned = Math.round(cartTotal * 0.05); // 5% coin reward
    
    // Create actual order
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: cartTotal,
      coinsEarned: earned,
      status: 'Processing',
      itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0)
    };

    setOrders([newOrder, ...orders]);
    setCoins(prev => prev + earned);
    setCart([]);
    setCartOpen(false);
    setSuccessToast(`🎉 congrats! Order Placed successfully. You earned ${earned} Tazu Coins!`);
    setCurrentView('account');

    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  // Wishlist toggle
  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans flex flex-col relative pb-20 justify-between">
      
      {/* Dynamic Announcement Bar */}
      <div 
        style={{ backgroundColor: colPrimary }} 
        className="text-white text-center py-2.5 px-4 text-xs font-bold uppercase tracking-widest select-none flex items-center justify-center gap-2"
      >
        <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>Welcome to {website.business_name} - Earn dynamic {currSign} Coin Rewards on Checkout!</span>
      </div>

      {/* Success Order Overlay Toast */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <div className="bg-black text-white p-4 font-mono text-xs border border-zinc-800 shadow-xl flex items-start gap-3 relative animate-bounce">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <div className="flex-1 text-left font-sans font-bold leading-tight">
              {successToast}
            </div>
            <button onClick={() => setSuccessToast(null)}>
              <X className="w-4 h-4 hover:opacity-50" />
            </button>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <header className="bg-white border-b border-gray-100 flex items-center justify-between p-4 sm:px-8 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Logo element: text fallback if no image url configured, otherwise nice branded image */}
          {website.logo ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentView('home'); setSelectedCategory(null); }}>
              <img src={website.logo} alt="Logo" className="h-8 max-w-[120px] object-contain shrink-0" referrerPolicy="no-referrer" />
              <span className="font-extrabold text-sm tracking-tight text-gray-400 font-mono hidden sm:inline">{website.website_name.toUpperCase()}</span>
            </div>
          ) : (
            <div 
              onClick={() => { setCurrentView('home'); setSelectedCategory(null); }}
              className="font-black text-xl tracking-tighter uppercase cursor-pointer select-none"
            >
              {website.website_name}
            </div>
          )}
        </div>

        {/* Regular Header Routes */}
        <nav className="hidden sm:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-600">
          <button 
            onClick={() => { setCurrentView('home'); setSelectedCategory(null); }} 
            className={`hover:text-black transition-colors ${currentView === 'home' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'home' ? colPrimary : 'transparent' }}
          >
            Home
          </button>
          <button 
            onClick={() => { setCurrentView('categories'); setSelectedCategory(null); }} 
            className={`hover:text-black transition-colors ${currentView === 'categories' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'categories' ? colPrimary : 'transparent' }}
          >
            Categories
          </button>
          <button 
            onClick={() => setCurrentView('offers')} 
            className={`text-red-600 font-extrabold hover:text-black transition-all flex items-center gap-1 ${currentView === 'offers' ? 'border-b-2 border-red-600' : ''}`}
          >
            <Percent className="w-3.5 h-3.5" /> Offers
          </button>
          <button 
            onClick={() => setCurrentView('support')} 
            className={`hover:text-black transition-colors ${currentView === 'support' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'support' ? colPrimary : 'transparent' }}
          >
            Support
          </button>
          <button 
            onClick={() => setCurrentView('properties')} 
            className={`hover:text-black text-emerald-600 font-bold transition-colors ${currentView === 'properties' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'properties' ? colPrimary : 'transparent' }}
          >
            🏠 Properties
          </button>
          <button 
            onClick={() => setCurrentView('account')} 
            className={`hover:text-black transition-colors ${currentView === 'account' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'account' ? colPrimary : 'transparent' }}
          >
            Account
          </button>
        </nav>

        {/* Cart & Profile controls */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowSearch(!showSearch)} 
              className="p-1.5 hover:bg-zinc-100 transition-colors rounded-full"
            >
              <Search className="w-5 h-5 text-gray-700 pointer" />
            </button>
          </div>

          <button 
            onClick={() => setCurrentView('account')} 
            className="p-1.5 hover:bg-zinc-150 transition-colors rounded-full relative"
          >
            <User className="w-5 h-5 text-gray-700" />
          </button>

          <button onClick={() => setCartOpen(true)} className="relative p-1.5 hover:bg-zinc-100 transition-colors rounded-full">
            <ShoppingBag className="w-5 h-5 cursor-pointer text-gray-700" />
            {cart.length > 0 && (
              <span 
                style={{ backgroundColor: colPrimary }}
                className="absolute top-0 right-0 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white"
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Embedded Search Drawer */}
      {showSearch && (
        <div className="bg-white border-b border-zinc-200 p-4 animate-in slide-in-from-top duration-300">
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={`Search catalog... e.g. Shirt, Gadget`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 border border-zinc-200 text-sm font-bold outline-none focus:border-black ${radiusClass}`} 
              />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-3 bg-zinc-100 text-black hover:bg-zinc-200 text-xs font-bold uppercase"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Core Dynamic Body Panel */}
      <main className="flex-1 bg-white">
        
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="space-y-0">
            {/* Dynamic Hero Banner System (Force SQUARE 0px borders in standard flat modern style) */}
            <div className="p-0 sm:p-0">
              <div 
                className="aspect-[21/9] w-full min-h-[220px] sm:min-h-[350px] relative overflow-hidden border-b border-zinc-100"
                style={{ backgroundColor: `${colPrimary}10`, borderRadius: '0px' }} // Soft tint background
              >
                {/* Custom Banner Image */}
                <img 
                  src={website.banner || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80"} 
                  className="absolute inset-0 w-full h-full object-cover select-none" 
                  alt="Store banner"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Failover if broken link pasted
                    e.currentTarget.src = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80";
                  }}
                />
                
                {/* Ambient dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-left">
                  <div className="text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 w-max mb-3 select-none rounded-none" style={{ backgroundColor: colPrimary }}>
                    {website.business_name} EXCLUSIVE
                  </div>
                  <h1 className="text-xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none max-w-xl transition-all">
                    {website.website_name}
                  </h1>
                  <p className="text-gray-300 text-xs font-bold sm:text-sm mt-3 max-w-md line-clamp-2">
                    Professional, seamless e-commerce systems tailored dynamically for digital shoppers in {website.address || 'Bangladesh'}.
                  </p>
                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={() => { setCurrentView('categories'); }}
                      style={{ backgroundColor: colPrimary }}
                      className="text-white text-[10px] font-black px-6 py-3 uppercase tracking-widest hover:opacity-90 transition-all rounded-none"
                    >
                      Browse Catalog
                    </button>
                    <button 
                      onClick={() => setCurrentView('offers')}
                      className="bg-white/10 backdrop-blur-md border border-white/30 text-white text-[10px] font-black px-6 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-none"
                    >
                      Hot Offers
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Search result banner if querying */}
            {searchQuery.trim() && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Search results for: "{searchQuery}"</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                  {getAllSearchableProducts().map((p: any) => (
                    <ProductSquareCard key={p.id} product={p} />
                  ))}
                  {getAllSearchableProducts().length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-400 font-bold text-sm">
                      No products matched your search.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General dynamic categories subsections (RULE 10: SMARTPHONE SECTION, FASHION SECTION, GROCERY SECTION) */}
            {!searchQuery.trim() && (
              <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6">
                {categoriesList.map((cat, idx) => {
                  const catProducts = getProductsByCategory(cat);
                  return (
                    <div key={idx} className="border-t border-zinc-100 pt-8 text-left">
                      <div className="flex justify-between items-end border-b border-zinc-100 pb-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6" style={{ backgroundColor: colPrimary }} />
                          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900">{cat}</h2>
                        </div>
                        <button 
                          onClick={() => { setSelectedCategory(cat); setCurrentView('categories'); }} 
                          className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-50 transition-all bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-zinc-800"
                        >
                          VIEW ALL →
                        </button>
                      </div>

                      {/* Products Grid (No horizontal product slider, premium grid, 2 products per row on mobile, 6 on desktop) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                        {catProducts.slice(0, 6).map((p: any) => (
                          <ProductSquareCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trust Badges */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <div className={`p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-zinc-50 border border-zinc-100 ${radiusClass}`}>
                {[
                  { icon: Zap, label: "Superfast Shipping", desc: `Available in ${website.address || 'Bangladesh'}` },
                  { icon: ShieldCheckMock, label: "Secure Payment Methods", desc: `Using local ${website.currency || 'BDT'} gateways` },
                  { icon: MessageSquare, label: "Client Support", desc: `${website.support_number || 'Direct Contact'}` },
                  { icon: Award, label: "Verified Shop Guarantee", desc: "100% genuine products" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 text-left">
                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 border border-zinc-200 bg-white`} style={{ color: colPrimary }}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">{item.label}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: CATEGORIES */}
        {currentView === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Catalog Categories</h1>
            
            {/* Category selection row buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button 
                onClick={() => setSelectedCategory(null)} 
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest border transition-all ${!selectedCategory ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-black'}`}
              >
                All Products ({getAllSearchableProducts().length})
              </button>
              {categoriesList.map((cat, idx) => {
                const isActive = selectedCategory?.toLowerCase().trim() === cat.toLowerCase().trim();
                return (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest border transition-all ${isActive ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-black'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Grid display */}
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {(selectedCategory ? getProductsByCategory(selectedCategory) : getAllSearchableProducts()).map((p: any) => (
                  <ProductSquareCard key={p.id} product={p} />
                ))}
              </div>
              {(selectedCategory ? getProductsByCategory(selectedCategory) : getAllSearchableProducts()).length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold">
                  No products added yet. Start adding products from your admin dashboard!
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: OFFERS */}
        {currentView === 'offers' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-red-600 flex items-center gap-2">
                  <Percent className="w-8 h-8 animate-pulse" /> Hot Offers Panel
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Exclusive discount prices with dynamic coin rewards</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {getOfferProducts().map((p: any) => (
                <ProductSquareCard key={p.id} product={p} />
              ))}
              {getOfferProducts().length === 0 && (
                <div className="col-span-full text-center py-24 text-gray-400 font-bold max-w-md mx-auto">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-4 rounded-none">
                    <Ticket className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="uppercase tracking-widest text-xs">No active discount campaign found. Check back later!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: SUPPORT */}
        {currentView === 'support' && (
          <div className="max-w-3xl mx-auto px-4 py-12 text-left">
            <div className="mb-10 text-center sm:text-left">
              <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">Support Center</h1>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">Get in touch directly with our business assistants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-zinc-50 border border-zinc-150 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase text-black tracking-tight mb-4">Direct Contact</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-zinc-200 bg-white flex items-center justify-center shrink-0" style={{ color: colPrimary }}>
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Call Support</p>
                        <a href={`tel:${website.support_number}`} className="text-sm font-bold text-black hover:underline">{website.support_number || '+8801700000000'}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-zinc-200 bg-white flex items-center justify-center shrink-0 text-emerald-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">WhatsApp Chat</p>
                        <a 
                          href={`https://wa.me/${website.support_number?.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="text-sm font-bold text-emerald-600 hover:underline"
                        >
                          Chat Live Now
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-zinc-200 bg-white flex items-center justify-center shrink-0 text-blue-600">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email Address</p>
                        <a href={`mailto:${website.admin_email}`} className="text-sm font-bold text-black hover:underline truncate block max-w-[200px]">{website.admin_email || 'support@client.com'}</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-200">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Corporate Address</p>
                  <p className="text-xs font-bold text-zinc-750 flex items-center gap-1.5 leading-snug">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                    {website.address || 'Dhaka, Bangladesh'}
                  </p>
                </div>
              </div>

              {/* Secure message sender form right on screen */}
              <form onSubmit={handleInquirySubmit} className="border border-zinc-200 p-6 space-y-4">
                <h3 className="text-base font-black uppercase tracking-wide text-black">Transmit Message</h3>
                {inquirySuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide rounded-md">
                    {inquirySuccess}
                  </div>
                )}
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className={inputClass} 
                    placeholder="Enter your name" 
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">WhatsApp or Phone</label>
                  <input 
                    type="text" 
                    required 
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    className={inputClass} 
                    placeholder="+880..." 
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Message or Issue</label>
                  <textarea 
                    required 
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className={`${inputClass} h-20 resize-none`} 
                    placeholder="Write details here..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmittingInquiry}
                  style={{ backgroundColor: colPrimary }} 
                  className={`${btnClass} disabled:opacity-50`}
                >
                  {isSubmittingInquiry ? "Transmitting..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: PROPERTIES PORTAL */}
        {currentView === 'properties' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-150 pb-6 mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5">Corporate Real Estate</span>
                <h1 className="text-3xl font-black uppercase tracking-tight text-black mt-2">Executive Properties</h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Verified residences, duplexes and commercial plots</p>
              </div>
              <button 
                onClick={() => {
                  if (!currentUser) {
                    alert("Please log in from the Account terminal to list a property!");
                    setCurrentView('account');
                  } else {
                    setShowListForm(!showListForm);
                  }
                }}
                className="px-6 py-3.5 bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                List Your Property
              </button>
            </div>

            {/* List Property Form Modal/Drawer */}
            {showListForm && currentUser && (
              <div className="bg-zinc-50 border border-zinc-150 p-6 mb-8 max-w-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-2">
                  <h3 className="font-black text-sm uppercase tracking-wider text-black">New Property Listing</h3>
                  <button onClick={() => setShowListForm(false)} className="text-neutral-500 hover:text-black">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handlePropertySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Property Title *</label>
                      <input 
                        type="text" 
                        required 
                        value={newPropTitle}
                        onChange={(e) => setNewPropTitle(e.target.value)}
                        placeholder="e.g. Modern duplex with terrace" 
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Price (numeric, BDT) *</label>
                      <input 
                        type="number" 
                        required 
                        value={newPropPrice}
                        onChange={(e) => setNewPropPrice(e.target.value)}
                        placeholder="e.g. 45000000" 
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Category *</label>
                      <select 
                        value={newPropCategory}
                        onChange={(e) => setNewPropCategory(e.target.value)}
                        className={inputClass}
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="Duplex">Duplex</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Land</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Address Location *</label>
                      <input 
                        type="text" 
                        required 
                        value={newPropAddress}
                        onChange={(e) => setNewPropAddress(e.target.value)}
                        placeholder="e.g. Road 12, Banani, Dhaka" 
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Image URL (Optional, defaults to luxury preview)</label>
                    <input 
                      type="url" 
                      value={newPropImageUrl}
                      onChange={(e) => setNewPropImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..." 
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase text-zinc-500 mb-1">Description *</label>
                    <textarea 
                      required 
                      value={newPropDescription}
                      onChange={(e) => setNewPropDescription(e.target.value)}
                      placeholder="Write exact dimensions, bedroom counts, utility information..." 
                      className={`${inputClass} h-24 resize-none`}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isListingProperty}
                    className="w-full text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {isListingProperty ? 'Transmitting to Supabase...' : 'Publish Property Archive'}
                  </button>
                </form>
              </div>
            )}

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['All', 'Apartment', 'Duplex', 'Commercial', 'Land'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedPropCategoryFilter(cat)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                    selectedPropCategoryFilter === cat 
                      ? 'bg-black border-black text-white' 
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Properties Grid */}
            {isFetchingProps ? (
              <div className="py-24 text-center text-zinc-400 font-bold uppercase tracking-widest">
                Analyzing registry database...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {properties
                  .filter(p => selectedPropCategoryFilter === 'All' || p.category === selectedPropCategoryFilter)
                  .map((prop) => {
                    const isLiked = likedPropIds.includes(prop.id);
                    return (
                      <div key={prop.id} className="border border-zinc-200 bg-white group flex flex-col justify-between overflow-hidden">
                        <div className="aspect-[16/10] w-full relative overflow-hidden bg-zinc-50">
                          <img 
                            src={prop.image_url || prop.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            alt={prop.title} 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 left-4 bg-black text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-widest">
                            {prop.category}
                          </div>
                          <button 
                            onClick={() => toggleLikeProperty(prop.id)}
                            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow hover:bg-white text-zinc-800 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-zinc-605'}`} />
                          </button>
                        </div>
                        <div className="p-6 text-left flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <h3 className="text-lg font-black uppercase tracking-tight text-black line-clamp-1">{prop.title}</h3>
                              <span className="text-base font-black text-emerald-700 shrink-0">
                                {currSign}{prop.price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> {prop.address}
                            </p>
                            <p className="text-xs font-semibold text-zinc-600 leading-relaxed line-clamp-3">
                              {prop.description}
                            </p>
                          </div>
                          <div className="pt-4 border-t border-zinc-100 flex gap-2">
                            <button 
                              onClick={() => {
                                setInquiryName(currentUser?.user_metadata?.full_name || '');
                                setInquiryPhone('');
                                setInquiryMessage(`Hi, I am interested in property "${prop.title}" (${prop.address}). Please contact me with details.`);
                                setCurrentView('support');
                              }}
                              style={{ backgroundColor: colPrimary }}
                              className="flex-1 text-center py-2.5 text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                              Message Representative
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {properties.filter(p => selectedPropCategoryFilter === 'All' || p.category === selectedPropCategoryFilter).length === 0 && (
                  <div className="col-span-full py-16 text-center text-zinc-400 font-bold uppercase tracking-widest">
                    No matching properties found in registry
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: ACCOUNT & PROFILE DESK */}
        {currentView === 'account' && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-left">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Customer Terminal</h1>
            
            {!currentUser ? (
              /* IF NOT LOGGED IN */
              <div className="max-w-md mx-auto border border-zinc-200 bg-white p-8">
                <div className="flex border-b border-zinc-200 mb-6">
                  <button 
                    onClick={() => { setAuthTab('login'); setAuthError(null); }}
                    className={`flex-1 text-center py-3 text-xs font-black uppercase tracking-widest ${
                      authTab === 'login' ? 'border-b-2 border-black text-black' : 'text-zinc-400 hover:text-black'
                    }`}
                  >
                    Account Login
                  </button>
                  <button 
                    onClick={() => { setAuthTab('register'); setAuthError(null); }}
                    className={`flex-1 text-center py-3 text-xs font-black uppercase tracking-widest ${
                      authTab === 'register' ? 'border-b-2 border-black text-black' : 'text-zinc-400 hover:text-black'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold uppercase tracking-wide mb-4">
                    ⚠️ {authError}
                  </div>
                )}

                <form onSubmit={authTab === 'login' ? handleCustomerSignIn : handleCustomerSignUp} className="space-y-4">
                  {authTab === 'register' && (
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Your Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="John Doe" 
                        className={inputClass}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="user@example.com" 
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Password</label>
                    <input 
                      type="password" 
                      required 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••" 
                      className={inputClass}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isAuthenticating}
                    style={{ backgroundColor: colPrimary }}
                    className="w-full text-center py-3.5 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 mt-4"
                  >
                    {isAuthenticating ? 'Processing authentication...' : authTab === 'login' ? 'Access Account' : 'Register Account'}
                  </button>
                </form>
              </div>
            ) : (
              /* IF LOGGED IN: PROFILE DASHBOARD VIEW with Properties Liked / Listed */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Profile Card left */}
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-zinc-900 text-white p-6 border border-zinc-850 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                    <div className="absolute top-2 right-2 opacity-5 select-none">
                      <User className="w-32 h-32 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                        <span className="text-[8px] font-black tracking-widest uppercase bg-zinc-800 text-emerald-400 px-2 py-0.5">Secure Session Active</span>
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight mt-3 truncate">
                        {currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Executive Member'}
                      </h3>
                      <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">{currentUser?.email}</p>
                      <p className="text-[9px] font-mono text-zinc-500 mt-2">UID: {currentUser?.id}</p>
                    </div>

                    <button 
                      onClick={handleCustomerSignOut}
                      className="mt-8 px-4 py-2 bg-zinc-800 hover:bg-red-950 hover:text-red-350 transition-colors text-white text-[9px] font-black uppercase tracking-widest border border-zinc-700 flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out Session
                    </button>
                  </div>

                  {/* Coin bonus stats */}
                  <div className="border border-zinc-200 p-5 bg-white space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Bonus Accumulator</h4>
                    <div className="flex items-center gap-2 bg-yellow-50 p-3 border border-yellow-250 rounded">
                      <Coins className="w-6 h-6 text-yellow-500 shrink-0" />
                      <div>
                        <p className="text-[8px] font-black text-yellow-800 uppercase tracking-widest">Active Balance</p>
                        <p className="text-base font-black text-yellow-600 mt-0.5">{coins} Tazu Coins</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Properties Liked/Listed Center Right */}
                <div className="md:col-span-2 space-y-8">
                  {/* Saved / Liked Properties Section */}
                  <div className="border border-zinc-200 bg-white p-6">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-100">
                      <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500 fill-current" /> Properties Saved ({likedPropIds.length})
                      </h3>
                      <button 
                        onClick={() => setCurrentView('properties')}
                        className="text-[9px] font-black uppercase text-zinc-400 hover:text-black tracking-widest"
                      >
                        Browse All →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {properties
                        .filter(p => likedPropIds.includes(p.id))
                        .map(p => (
                          <div key={p.id} className="border border-zinc-150 p-2.5 bg-zinc-50 flex gap-3">
                            <img 
                              src={p.image_url || p.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"} 
                              className="w-16 h-20 object-cover shrink-0 bg-white border border-zinc-200" 
                              alt="liked prop"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-tight text-neutral-800 truncate">{p.title}</h4>
                                <span className="text-[8px] font-black uppercase text-gray-500 block mt-0.5">{p.category} • {p.address}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2 font-mono">
                                <span className="text-xs font-black text-emerald-700">{currSign}{p.price.toLocaleString()}</span>
                                <button 
                                  onClick={() => toggleLikeProperty(p.id)} 
                                  className="text-red-500 hover:text-red-700 font-bold"
                                  title="Unlike"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                      ))}
                      {properties.filter(p => likedPropIds.includes(p.id)).length === 0 && (
                        <p className="text-xs font-bold text-zinc-400 text-center col-span-full py-8 uppercase tracking-widest">
                          Your saved list is empty
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Properties Listed Section */}
                  <div className="border border-zinc-200 bg-white p-6">
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-100">
                      <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-600" /> Your Listed Properties ({
                          properties.filter(p => p.user_id === currentUser.id).length
                        })
                      </h3>
                      <button 
                        onClick={() => { setCurrentView('properties'); setShowListForm(true); }}
                        className="text-[9px] font-black uppercase text-emerald-600 hover:opacity-75 tracking-widest"
                      >
                        List New +
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {properties
                        .filter(p => p.user_id === currentUser.id)
                        .map(p => (
                          <div key={p.id} className="border border-zinc-150 p-2.5 bg-zinc-50 flex gap-3">
                            <img 
                              src={p.image_url || p.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"} 
                              className="w-16 h-20 object-cover shrink-0 bg-white border border-zinc-200" 
                              alt="user prop"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-tight text-neutral-800 truncate">{p.title}</h4>
                                <span className="text-[8px] font-black uppercase text-gray-500 block mt-0.5">{p.category} • {p.address}</span>
                              </div>
                              <div className="flex justify-between items-center mt-2 font-mono">
                                <span className="text-xs font-black text-emerald-700">{currSign}{p.price.toLocaleString()}</span>
                                <span className="text-[8px] font-black uppercase text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">Active</span>
                              </div>
                            </div>
                          </div>
                      ))}
                      {properties.filter(p => p.user_id === currentUser.id).length === 0 && (
                        <p className="text-xs font-bold text-zinc-400 text-center col-span-full py-8 uppercase tracking-widest">
                          You have listed no properties yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer System */}
      <footer className="bg-black text-white py-16 px-4 sm:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
           <div>
             {website.logo ? (
               <img src={website.logo} alt="Footer Logo" className="h-8 max-w-[124px] object-contain mb-4 select-none invert" referrerPolicy="no-referrer" />
             ) : (
               <div className="font-black text-xl tracking-tighter uppercase mb-4">{website.website_name}</div>
             )}
             <p className="text-gray-405 text-xs font-bold leading-relaxed max-w-xs mx-auto sm:mx-0 text-zinc-400">
               Premium Shortcut Commerce Layout system customized dynamically for {website.business_name}. Serving {website.address || 'Bangladesh'} shoppers.
             </p>
           </div>
           <div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-4">Shop Menu</h4>
             <ul className="space-y-2 text-gray-400 text-xs font-bold">
               <li><button onClick={() => { setCurrentView('home'); }} className="hover:text-white transition-colors">Catalog Home</button></li>
               <li><button onClick={() => { setCurrentView('categories'); }} className="hover:text-white transition-colors">Categories</button></li>
               <li><button onClick={() => { setCurrentView('offers'); }} className="hover:text-white text-red-400 transition-colors">Active Offers</button></li>
             </ul>
           </div>
           <div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-4">Support & Help</h4>
             <ul className="space-y-2 text-gray-400 text-xs font-bold">
               <li><button onClick={() => { setCurrentView('support'); }} className="hover:text-white transition-colors">Contract Support</button></li>
               <li><span className="text-zinc-500 uppercase text-[9px] block">TEL: {website.support_number}</span></li>
               <li><span className="text-zinc-500 uppercase text-[9px] block">ADDR: {website.address}</span></li>
             </ul>
           </div>
           <div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-4">Newsletter Transmissions</h4>
             <div className={`flex border border-zinc-800 ${radiusClass}`}>
               <input type="email" placeholder="Email Address" className="bg-transparent px-4 py-3 w-full text-xs outline-none" />
               <button 
                 onClick={() => alert("Successfully joined the transmission list.")}
                 className="bg-white text-black px-4 font-black uppercase tracking-widest text-[9px]"
               >
                 Join
               </button>
             </div>
           </div>
        </div>
      </footer>

      {/* Dynamic Mobile Bottom Sticky Navigation Bar (RULE 13) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-2.5 z-40 px-6 sm:hidden flex justify-between items-center text-center">
        <button 
          onClick={() => { setCurrentView('home'); setSelectedCategory(null); }} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'home' ? 'text-black' : 'text-gray-400'}`}
        >
          <Compass className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          {currentView === 'home' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>

        <button 
          onClick={() => { setCurrentView('categories'); setSelectedCategory(null); }} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'categories' ? 'text-black' : 'text-gray-400'}`}
        >
          <Menu className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Categories</span>
          {currentView === 'categories' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>

        <button 
          onClick={() => setCurrentView('offers')} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'offers' ? 'text-red-600' : 'text-gray-400'}`}
        >
          <Percent className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Offers</span>
          {currentView === 'offers' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full bg-red-600" />}
        </button>

        <button 
          onClick={() => setCurrentView('support')} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'support' ? 'text-black' : 'text-gray-400'}`}
        >
          <Phone className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Support</span>
          {currentView === 'support' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>

        <button 
          onClick={() => setCurrentView('properties')} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'properties' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Properties</span>
          {currentView === 'properties' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>

        <button 
          onClick={() => setCurrentView('account')} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'account' ? 'text-black' : 'text-gray-400'}`}
        >
          <User className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
          {currentView === 'account' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full relative z-10 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight">Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-zinc-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-3 border border-zinc-100 p-2 relative">
                  <img src={item.product.image || null} className="w-16 h-20 object-cover bg-zinc-50 shrink-0" alt="cart item" referrerPolicy="no-referrer" />
                  <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                    <div>
                      <h3 className="font-extrabold text-xs uppercase tracking-tight truncate">{item.product.name}</h3>
                      <p className="text-[9px] font-black text-gray-500 uppercase mt-0.5">{item.product.category}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-zinc-205 text-xs font-black">
                        <button onClick={() => updateCartQty(item.product.id, -1)} className="px-2 py-0.5 bg-zinc-50 hover:bg-zinc-100">-</button>
                        <span className="px-3 py-0.5 border-x border-zinc-100 bg-white">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.product.id, 1)} className="px-2 py-0.5 bg-zinc-50 hover:bg-zinc-100">+</button>
                      </div>
                      <p className="font-extrabold text-sm">{currSign}{(item.product.discountPrice || item.product.price) * item.quantity}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="absolute top-2 right-2 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-zinc-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 opacity-40 mb-3" />
                  <p className="text-xs font-black uppercase tracking-wider">Your shopping card is empty</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-zinc-50 space-y-4">
              <div className="flex justify-between font-extrabold text-xs uppercase tracking-wider text-gray-500">
                <span>Cart Subtotal</span>
                <span className="text-black text-base font-black">{currSign}{getCartTotal().toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold leading-normal text-left">
                * checkout automatically rewards 5% of order value back in secure {website.website_name} coins.
              </p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => { setCart([]); setCartOpen(false); }}
                  className={`px-4 py-3 bg-white hover:bg-zinc-100 border border-zinc-200 text-black font-bold text-xs uppercase tracking-wider shrink-0 ${radiusClass}`}
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="flex-1 text-white py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50 select-none cursor-pointer flex justify-center items-center gap-2"
                  style={{ backgroundColor: colPrimary }}
                >
                  <Zap className="w-4 h-4 text-yellow-300 fill-current" /> Checkout & Earn Coins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // Private component helper for square product card
  function ProductSquareCard({ product, key }: { product: any; key?: any }) {
    const originalPrice = product.price;
    const activePrice = product.discountPrice || originalPrice;
    const hasDiscount = originalPrice > activePrice;
    const savingsPercentage = hasDiscount ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;
    
    const isSaved = wishlist.includes(product.id);

    return (
      <div className="group border border-zinc-100 bg-white hover:border-zinc-300 transition-all text-left flex flex-col justify-between rounded-none">
        <div className="aspect-square w-full relative overflow-hidden bg-zinc-50 rounded-none">
          <img 
            src={product.image || null} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt={product.name} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
            }}
          />

          {/* Tag labels */}
          {hasDiscount && (
            <div className="absolute top-2.5 left-2.5 bg-red-650 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest rounded-none">
              -{savingsPercentage}% Off
            </div>
          )}

          {/* Coins tag (RULE 11: Products show coin badge) */}
          <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-1 flex items-center gap-1 border border-white/10 rounded-none">
            <Coins className="w-3 h-3 text-yellow-400" />
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">+{product.reward_coins || 100} Coins</span>
          </div>

          {/* Quick Cart Actions hover buttons */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
              className="p-2.5 bg-white backdrop-blur shadow-md hover:bg-neutral-50 transition-colors shrink-0 rounded-none"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-current' : 'text-neutral-600'}`} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="flex-1 bg-black text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md hover:bg-neutral-900 transition-colors rounded-none"
            >
              <ShoppingBag className="w-3.5 h-3.5 animate-pulse" /> Add to Cart
            </button>
          </div>
        </div>

        {/* Content details */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">{product.category}</span>
            <h3 className="text-xs font-black uppercase tracking-tight text-zinc-800 line-clamp-1 group-hover:text-black">{product.name}</h3>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-black">{currSign}{activePrice.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through font-bold">{currSign}{originalPrice.toLocaleString()}</span>
              )}
            </div>
            
            <div className="flex items-center gap-0.5 text-yellow-400">
               <Star className="w-3 h-3 fill-current" />
               <span className="text-[9px] font-extrabold text-zinc-500 leading-none mt-0.5">{(product.rating || 4.7).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Shell Icons Mock
const ShieldCheckMock = ShieldCheck;
function ShieldCheck({ className }: { className?: string }) {
  return <CheckCircle className={className} />;
}
