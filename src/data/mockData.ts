export const categories = [
  { id: 'perfume', name: 'Perfume', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200', icon: 'Sparkles', banner: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200' },
  { id: 'attar', name: 'Premium Attar', image: 'https://images.unsplash.com/photo-1615397323862-5e6616eb6e8b?auto=format&fit=crop&q=80&w=200', icon: 'Droplet', banner: 'https://images.unsplash.com/photo-1615397323862-5e6616eb6e8b?auto=format&fit=crop&q=80&w=1200' },
  { id: 'belt', name: 'Belt', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=200', icon: 'Activity', banner: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=1200' },
  { id: 'wallet', name: 'Wallet', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=200', icon: 'CreditCard', banner: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=1200' },
  { id: 'water-bottle', name: 'Water Bottle', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=200', icon: 'Droplet', banner: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=1200' },
];

export const products = [
  {
    id: 'p1',
    name: 'Tom Ford Oud Wood Premium',
    category: 'perfume',
    price: 4500,
    discountPrice: 3800,
    rating: 4.8,
    reviews: 124,
    stock: 'In Stock',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
    isNew: true,
  },
  {
    id: 'p2',
    name: 'Classic Black Genuine Leather Wallet',
    category: 'wallet',
    price: 1200,
    discountPrice: null,
    rating: 4.9,
    reviews: 89,
    stock: 'In Stock',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600',
    isNew: false,
  },
  {
    id: 'p3',
    name: 'Royale Rose Attar - 12ml',
    category: 'attar',
    price: 850,
    discountPrice: 650,
    rating: 4.7,
    reviews: 45,
    stock: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1615397323862-5e6616eb6e8b?auto=format&fit=crop&q=80&w=600',
    isNew: false,
  },
  {
    id: 'p4',
    name: 'Automatic Minimalist Leather Belt',
    category: 'belt',
    price: 1800,
    discountPrice: 1500,
    rating: 4.7,
    reviews: 67,
    stock: 'In Stock',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=600',
    isNew: true,
  },
  {
    id: 'p5',
    name: 'Smart Temperature Water Bottle',
    category: 'water-bottle',
    price: 650,
    discountPrice: 500,
    rating: 4.5,
    reviews: 112,
    stock: 'In Stock',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
    isNew: false,
  },
  {
    id: 'p6',
    name: 'Amber Glow Signature Scent',
    category: 'perfume',
    price: 2500,
    discountPrice: 2100,
    rating: 4.9,
    reviews: 210,
    stock: 'In Stock',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
    isNew: true,
  },
  {
    id: 'p7',
    name: 'Brown Vintage Leather Wallet',
    category: 'wallet',
    price: 1500,
    discountPrice: 1350,
    rating: 4.8,
    reviews: 56,
    stock: 'In Stock',
    image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=600',
    isNew: false,
  },
  {
    id: 'p8',
    name: 'Luxury Suede Belt - Navy Blue',
    category: 'belt',
    price: 2200,
    discountPrice: null,
    rating: 4.6,
    reviews: 32,
    stock: 'In Stock',
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=600',
    isNew: false,
  }
];

export const orders = [
  {
    id: 'TM123456',
    date: 'May 10, 2026',
    customer: {
      name: 'Imtiaz Khan',
      phone: '01712345678',
      address: 'House #12, Road #4, Dhanmondi, Dhaka',
      area: 'Dhaka',
    },
    payment: {
      method: 'Cash On Delivery',
      total: 3500,
    },
    courier: {
      name: 'Pathao',
      trackingNo: 'PX123456789',
    },
    status: 'Shipped',
    steps: [
      { name: 'Order Placed', time: 'May 10, 2026 10:30 AM', completed: true },
      { name: 'Processing', time: 'May 10, 2026 02:00 PM', completed: true },
      { name: 'Packed', time: 'May 11, 2026 11:00 AM', completed: true },
      { name: 'Shipped', time: 'May 11, 2026 04:00 PM', completed: true },
      { name: 'Out For Delivery', time: null, completed: false },
      { name: 'Delivered', time: null, completed: false },
    ],
    items: [
      { productId: 'p1', name: 'Tom Ford Oud Wood Premium', quantity: 1, price: 3800, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'TM654321',
    date: 'May 15, 2026',
    customer: {
      name: 'Sarah Rahman',
      phone: '01887654321',
      address: 'Flat #4B, Zenith Tower, Banani, Dhaka',
      area: 'Dhaka',
    },
    payment: {
      method: 'Nagad',
      total: 1500,
    },
    courier: {
      name: 'RedX',
      trackingNo: 'RX987654321',
    },
    status: 'Processing',
    steps: [
      { name: 'Order Placed', time: 'May 15, 2026 09:00 AM', completed: true },
      { name: 'Processing', time: 'May 15, 2026 11:30 AM', completed: true },
      { name: 'Packed', time: null, completed: false },
      { name: 'Shipped', time: null, completed: false },
      { name: 'Out For Delivery', time: null, completed: false },
      { name: 'Delivered', time: null, completed: false },
    ],
    items: [
      { productId: 'p4', name: 'Automatic Minimalist Leather Belt', quantity: 1, price: 1500, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=600' }
    ]
  }
];

export const banners = [
  {
    id: 'b1',
    title: 'Luxury Perfume Collection',
    subtitle: 'Up to 40% OFF',
    image: 'https://images.unsplash.com/photo-1595425970377-c9703c5ae120?auto=format&fit=crop&q=80&w=1200',
    link: '/category/perfume',
  },
  {
    id: 'b2',
    title: 'Eid Mega Offer',
    subtitle: 'Free Delivery on Orders Over BDT 2000',
    image: 'https://images.unsplash.com/photo-1608228068998-4828114c0a52?auto=format&fit=crop&q=80&w=1200',
    link: '/offers',
  }
]
