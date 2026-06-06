import { Category } from '../store/useCategoryStore';
import { Product } from '../store/useProductStore';
import { Customer } from '../store/useCustomerStore';
import { Order } from '../store/useOrderStore';

// EXACT 14 NEW MEN'S ACCESSORIES CATEGORIES
export const CATEGORY_SPECS = [
  { id: 'smart-watch', name: 'Smart Watch', banner: 'PREMIUM INTELLIGENT WATCHES', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80' },
  { id: 'wallet-collection', name: 'Wallet Collection', banner: 'GENUINE LEATHER WALLETS', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80' },
  { id: 'electronics', name: 'Electronics', banner: 'NEXT-GEN ELECTRONICS', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80' },
  { id: 'lifestyle', name: 'Lifestyle', banner: 'PREMIUM LIFESTYLE PRODUCTS', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80' },
  { id: 'fashion', name: 'Fashion', banner: 'LUXURY FASHION WEAR', image: 'https://images.unsplash.com/photo-1445205170230-053b830c6042?w=600&auto=format&fit=crop&q=80' },
  { id: 'home-appliances', name: 'Home Appliances', banner: 'EFFICIENT HOME SOLUTIONS', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80' },
  { id: 'seasonal', name: 'Seasonal', banner: 'SEASONAL ESSENTIALS', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80' },
  { id: 'body-spray', name: 'Body Spray', banner: 'MEN EXCLUSIVE DEODORANTS', image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&auto=format&fit=crop&q=80' },
  { id: 'perfume', name: 'Perfume', banner: 'LUXURY COLOGNES & FRAGRANCES', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80' },
  { id: 'sunglasses', name: 'Sunglasses', banner: 'CLASSIC UV PROTECTION SUNGLASSES', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80' },
  { id: 'backpack', name: 'Backpack', banner: 'TRAVEL & OFFICE BACKPACKS', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
  { id: 'mens-belt', name: 'Men\'s Belt', banner: 'ELEGANT GENUINE LEATHER BELTS', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80' },
  { id: 'travel-bag', name: 'Travel Bag', banner: 'STYLISH DUFFEL & TRAVEL PACKS', image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=600&auto=format&fit=crop&q=80' },
  { id: 'bluetooth-earbuds', name: 'Bluetooth Earbuds', banner: 'WIRELESS PREMIUM AUDIO', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80' },
  { id: 'power-bank', name: 'Power Bank', banner: 'HIGH CAPACITY POWER SOLUTIONS', image: 'https://images.unsplash.com/photo-1609592424085-f688970be96a?w=600&auto=format&fit=crop&q=80' },
  { id: 'mens-t-shirt', name: 'Men\'s T-Shirt', banner: 'PREMIUM COTTON CASUAL TEES', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80' },
  { id: 'polo-shirt', name: 'Polo Shirt', banner: 'SMART FIT PIQUE POLOS', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80' },
  { id: 'cap-collection', name: 'Cap Collection', banner: 'STREET STYLE TRUCKERS & BASEBALL CAPS', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80' },
  { id: 'mens-accessories', name: 'Men\'s Accessories', banner: 'MEN LIFESTYLE & RINGS COUTURE', image: 'https://images.unsplash.com/photo-1620138546344-7b2c0b05159d?w=600&auto=format&fit=crop&q=80' }
];

export const generateDemoCategories = (): Category[] => {
  return CATEGORY_SPECS.map((spec, index) => ({
    id: spec.id,
    name: spec.name,
    bannerName: spec.banner,
    slug: spec.id,
    bannerImage: spec.image,
    iconImage: spec.image,
    description: `Browse premium high-quality selection of ${spec.name} items crafted with utmost attention to materials and style.`,
    displayOrder: index + 1,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString()
  }));
};

// 15 SPECIFIC COMPACT DEMO PRODUCTS WITH EXACT ATTRIBUTES
export const PRODUCT_SPECS = [
  // Smart Watch (2)
  {
    id: 'smart-watch-ultra-pro',
    name: 'Smart Watch Ultra Pro',
    category: 'Smart Watch',
    sku: 'SW-ULTRAPRO-001',
    brand: 'Fastrack',
    price: 6500,
    discountPrice: 4999,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 124,
    soldCount: 840,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'The Smart Watch Ultra Pro features a stunning 2.0-inch AMOLED sapphire display, up to 10 days of stellar battery life, integrated GPS, cardiac monitors, real-time stress testing, and standard water-resistance up to 50 meters. Perfect for style-conscious users.'
  },
  {
    id: 'smart-watch-series-x',
    name: 'Smart Watch Series X',
    category: 'Smart Watch',
    sku: 'SW-SERSX-002',
    brand: 'Casio',
    price: 4200,
    discountPrice: 3450,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 98,
    soldCount: 650,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Designed to adapt to tough conditions, the Series X introduces seamless Bluetooth calling, cellular text alerts, and active multi-sport trackers for runners and gym enthusiasts.'
  },
  // Wallet (2)
  {
    id: 'premium-leather-wallet',
    name: 'Premium Leather Wallet',
    category: 'Wallet Collection',
    sku: 'WL-PREMLTH-003',
    brand: 'Apex',
    price: 1800,
    discountPrice: 1450,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 112,
    soldCount: 920,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Handcrafted from 100% full-grain genuine leather. Equipped with RFID blocking lining, 8 card holders, 2 currency chambers, and a neat transparent profile window.'
  },
  {
    id: 'luxury-mens-wallet',
    name: 'Luxury Men\'s Wallet',
    category: 'Wallet Collection',
    sku: 'WL-LUXMLT-004',
    brand: 'Richman',
    price: 2500,
    discountPrice: 1999,
    image: 'https://images.unsplash.com/photo-1554403303-34e8579af954?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 43,
    soldCount: 310,
    is_flash_sale: false,
    is_trending: false,
    is_best_selling: true,
    isNew: true,
    description: 'An executive slim compact card sleeve style wallet constructed of elite matte-finish saffiano leather. Perfect profile for front pockets, matching formal attire.'
  },
  // Body Spray (2)
  {
    id: 'wild-stone-body-spray',
    name: 'Wild Stone Body Spray',
    category: 'Body Spray',
    sku: 'BS-WILDST-005',
    brand: 'Krafts',
    price: 550,
    discountPrice: 480,
    image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviews: 210,
    soldCount: 1540,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'A powerful, ultra-long-lasting masculine fragrance that combines fresh aquatic top notes with deep dry wood and amber base notes. Keeps you sweat-free and smelling amazing.'
  },
  {
    id: 'fogg-premium-body-spray',
    name: 'Fogg Premium Body Spray',
    category: 'Body Spray',
    sku: 'BS-FOGGPUM-006',
    brand: 'Krafts',
    price: 600,
    discountPrice: 530,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    reviews: 145,
    soldCount: 1120,
    is_flash_sale: false,
    is_trending: false,
    is_best_selling: false,
    isNew: false,
    description: 'No-gas premium body deodorant spray with refreshing citrus bursts, cooling spices, and rich cedar wood notes. Guarantees 800+ pure fine sprays per can.'
  },
  // Perfume (2)
  {
    id: 'arabic-oud-perfume',
    name: 'Arabic Oud Perfume',
    category: 'Perfume',
    sku: 'PF-AROUD-007',
    brand: 'Aarong',
    price: 3800,
    discountPrice: 2999,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 64,
    soldCount: 420,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'Infused with precious distillations of Cambodian Oud wood, warm saffron, and royal damask rose. Extremely robust sillage that persists beautifully for over 24 hours.'
  },
  {
    id: 'luxury-black-perfume',
    name: 'Luxury Black Perfume',
    category: 'Perfume',
    sku: 'PF-LUXBLK-008',
    brand: 'Catseye',
    price: 4900,
    discountPrice: 3950,
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 82,
    soldCount: 512,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: false,
    description: 'An enticing and magnetic nightlife EDP perfume centered around smooth vanilla, roasted coffee beans, dark patchouli, and clean vetiver.'
  },
  // Sunglasses (2)
  {
    id: 'premium-uv-sunglass',
    name: 'Premium UV Sunglass',
    category: 'Sunglasses',
    sku: 'SG-PRMUV-009',
    brand: 'Sailor',
    price: 2200,
    discountPrice: 1750,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 74,
    soldCount: 440,
    is_flash_sale: true,
    is_trending: false,
    is_best_selling: true,
    isNew: true,
    description: 'Features high-density UV400 polarized lenses that reduce horizontal glares, mounted on an ultra-light alloy frame. Beautifully shields eyes from harsh sunlight.'
  },
  {
    id: 'classic-mens-sunglass',
    name: 'Classic Men\'s Sunglass',
    category: 'Sunglasses',
    sku: 'SG-CLSMN-010',
    brand: 'Catseye',
    price: 1500,
    discountPrice: 1200,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 32,
    soldCount: 225,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: false,
    description: 'Timeless tear-drop aviator profile with lightweight carbon fiber stems. Styled with dark tinted mirrors and anti-scratch safety surfaces.'
  },
  // Bag (2)
  {
    id: 'travel-backpack-pro',
    name: 'Travel Backpack Pro',
    category: 'Backpack',
    sku: 'BG-TRVPK-011',
    brand: 'Sailor',
    price: 3500,
    discountPrice: 2800,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 135,
    soldCount: 880,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: '40L expandable travel rucksack made with high-density ballistic nylon. Features a dedicated 17-inch laptop compartment, shoe pocket, and raincover.'
  },
  {
    id: 'executive-office-backpack',
    name: 'Executive Office Backpack',
    category: 'Backpack',
    sku: 'BG-EXOFK-012',
    brand: 'Easy',
    price: 4200,
    discountPrice: 3350,
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 58,
    soldCount: 390,
    is_flash_sale: false,
    is_trending: false,
    is_best_selling: true,
    isNew: false,
    description: 'A sophisticated waterproof carbon-layered tech backpack designed for corporate commutes. USB dynamic charging port built-in.'
  },
  // Belt (1)
  {
    id: 'premium-leather-belt',
    name: 'Premium Leather Belt',
    category: 'Men\'s Belt',
    sku: 'BT-PRMLT-013',
    brand: 'Apex',
    price: 1950,
    discountPrice: 1550,
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 94,
    soldCount: 710,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Superior tanned genuine leather strap complete with a gunmetal heavy-duty steel automatic buckle. Matches jeans and slacks perfectly.'
  },
  // Earbuds (1)
  {
    id: 'wireless-earbuds-pro',
    name: 'Wireless Earbuds Pro',
    category: 'Bluetooth Earbuds',
    sku: 'EB-WLEBP-014',
    brand: 'Easy',
    price: 2900,
    discountPrice: 2200,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 147,
    soldCount: 1190,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'Equipped with active hybrid noise cancellation (ANC up to 35dB), dual microphones, Bluetooth 5.3 solid sync, and up to 36 hours of total playtime.'
  },
  // Power Bank (1)
  {
    id: 'fast-charging-powerbank',
    name: 'Fast Charging Power Bank 20000mAh',
    category: 'Power Bank',
    sku: 'PB-FSTCRG-015',
    brand: 'Easy',
    price: 2800,
    discountPrice: 2190,
    image: 'https://images.unsplash.com/photo-1609592424085-f688970be96a?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 79,
    soldCount: 560,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Incredibly high-speed 22.5W Power Delivery laptop-grade portable bank. Charges smartphones from 0 to 50% in standard 25 minutes. Dual USB-A & USB-C ports.'
  },
  {
    id: 'bluetooth-speaker-mini',
    name: 'Bluetooth Speaker Mini',
    category: 'Electronics',
    sku: 'EL-BTSPK-021',
    brand: 'Logitech',
    price: 2200,
    discountPrice: 1650,
    image: 'https://images.unsplash.com/photo-1608156639585-34a0a56ee6c9?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 56,
    soldCount: 340,
    is_flash_sale: true,
    is_trending: false,
    is_best_selling: false,
    isNew: true,
    description: 'Compact and powerful Bluetooth speaker with deep bass and clear sound. 10 hours of playtime.'
  },
  {
    id: 'gaming-mouse-rgb',
    name: 'Gaming Mouse RGB',
    category: 'Electronics',
    sku: 'EL-GMMSE-022',
    brand: 'Razer',
    price: 1800,
    discountPrice: 1290,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 89,
    soldCount: 520,
    is_flash_sale: true,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Ultra-responsive gaming mouse with 16000 DPI and customizable RGB lighting.'
  },
  {
    id: 'fast-charger-33w',
    name: 'Fast Charger 33W',
    category: 'Electronics',
    sku: 'EL-FSTCHG-023',
    brand: 'Xiaomi',
    price: 1200,
    discountPrice: 850,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 120,
    soldCount: 1100,
    is_flash_sale: true,
    is_trending: false,
    is_best_selling: true,
    isNew: false,
    description: '33W Super fast charging adapter with Type-C and USB ports. Safe and reliable.'
  },
  {
    id: 'mens-casual-shoe',
    name: 'Men\'s Casual Shoe',
    category: 'Fashion',
    sku: 'FS-MCSHOE-024',
    brand: 'Apex',
    price: 3500,
    discountPrice: 2800,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 65,
    soldCount: 430,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'Comfortable and stylish casual shoes for everyday wear.'
  },
  {
    id: 'womens-handbag',
    name: 'Women\'s Handbag',
    category: 'Fashion',
    sku: 'FS-WHBAG-025',
    brand: 'Sailor',
    price: 4500,
    discountPrice: 3600,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 42,
    soldCount: 210,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Premium quality leather handbag with elegant design.'
  },
  {
    id: 'smart-led-lamp',
    name: 'Smart LED Lamp',
    category: 'Lifestyle',
    sku: 'LS-SLEDL-026',
    brand: 'Philips',
    price: 2500,
    discountPrice: 1950,
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bbff8?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 34,
    soldCount: 280,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Controllable LED lamp with multiple color modes and brightness settings.'
  },
  {
    id: 'fitness-band',
    name: 'Fitness Band',
    category: 'Electronics',
    sku: 'EL-FITBD-027',
    brand: 'Huawei',
    price: 3200,
    discountPrice: 2450,
    image: 'https://images.unsplash.com/photo-1557166983-5939644443a0?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 78,
    soldCount: 620,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Track your health and activities with this advanced fitness band.'
  },
  {
    id: 'wireless-keyboard',
    name: 'Wireless Keyboard',
    category: 'Electronics',
    sku: 'EL-WLKBD-028',
    brand: 'Logitech',
    price: 2800,
    discountPrice: 2100,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83bac1?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 54,
    soldCount: 390,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: false,
    description: 'Sleek and quiet wireless keyboard for a clutter-free desk.'
  },
  {
    id: 'panjabi-collection',
    name: 'Panjabi Collection',
    category: 'Fashion',
    sku: 'FS-PJCOL-029',
    brand: 'Aarong',
    price: 4500,
    discountPrice: 3800,
    image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 82,
    soldCount: 1200,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'Exquisite cotton panjabi with unique design and embroidery.'
  },
  {
    id: 'premium-shirt',
    name: 'Premium Shirt',
    category: 'Fashion',
    sku: 'FS-PRMSH-030',
    brand: 'Richman',
    price: 2800,
    discountPrice: 2250,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 45,
    soldCount: 560,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Smart fit formal shirt made from premium cotton fabric.'
  },
  {
    id: 'ladies-3-piece',
    name: 'Ladies 3 Piece',
    category: 'Fashion',
    sku: 'FS-L3PC-031',
    brand: 'CatsEye',
    price: 5500,
    discountPrice: 4800,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 67,
    soldCount: 890,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'A beautiful 3-piece set for women, perfect for any occasion.'
  },
  {
    id: 'panjabi-combo-set',
    name: 'Panjabi Combo Set',
    category: 'Fashion',
    sku: 'FS-PJCBO-032',
    brand: 'Sailor',
    price: 7500,
    discountPrice: 6500,
    image: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 23,
    soldCount: 310,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'A matching combo set of Panjabi for father and son.'
  },
  {
    id: 'gift-box-package',
    name: 'Gift Box Package',
    category: 'Lifestyle',
    sku: 'LS-GFBOX-033',
    brand: 'Lifestyle',
    price: 3500,
    discountPrice: 2900,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 12,
    soldCount: 150,
    is_flash_sale: false,
    is_trending: false,
    is_best_selling: false,
    isNew: true,
    description: 'A curated gift box containing assorted premium items.'
  },
  {
    id: 'android-smart-tv',
    name: 'Android Smart TV',
    category: 'Electronics',
    sku: 'EL-ASTV-034',
    brand: 'Samsung',
    price: 45000,
    discountPrice: 38000,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 45,
    soldCount: 120,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: '4K Ultra HD Smart TV with Android OS and voice control.'
  },
  {
    id: 'air-fryer',
    name: 'Air Fryer',
    category: 'Home Appliances',
    sku: 'HA-AFRY-035',
    brand: 'Philips',
    price: 15000,
    discountPrice: 12500,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 89,
    soldCount: 450,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'Cook healthy meals with up to 90% less fat using this air fryer.'
  },
  {
    id: 'rice-cooker',
    name: 'Rice Cooker',
    category: 'Home Appliances',
    sku: 'HA-RCOOK-036',
    brand: 'Miyako',
    price: 4500,
    discountPrice: 3800,
    image: 'https://images.unsplash.com/photo-1544233726-9f1d2b276dbb?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 124,
    soldCount: 1800,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Premium quality rice cooker with warm and cook modes.'
  },
  {
    id: 'blender-machine',
    name: 'Blender Machine',
    category: 'Home Appliances',
    sku: 'HA-BLEND-037',
    brand: 'Panasonic',
    price: 6500,
    discountPrice: 5200,
    image: 'https://images.unsplash.com/photo-1570222069848-8164f48a995e?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 56,
    soldCount: 340,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: false,
    description: 'High-speed blender for smoothies, shakes, and more.'
  },
  {
    id: 'electric-kettle',
    name: 'Electric Kettle',
    category: 'Home Appliances',
    sku: 'HA-EKETL-038',
    brand: 'Prestige',
    price: 2500,
    discountPrice: 1950,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 210,
    soldCount: 2200,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Fast boiling electric kettle with auto-off feature.'
  },
  {
    id: 'vacuum-cleaner',
    name: 'Vacuum Cleaner',
    category: 'Home Appliances',
    sku: 'HA-VCLEAN-039',
    brand: 'Sharp',
    price: 12500,
    discountPrice: 9800,
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 32,
    soldCount: 156,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Powerful vacuum cleaner with multiple attachments.'
  },
  {
    id: 'raincoat',
    name: 'Raincoat',
    category: 'Seasonal',
    sku: 'SN-RNCT-040',
    brand: 'Seasonal',
    price: 1500,
    discountPrice: 1200,
    image: 'https://images.unsplash.com/photo-1548624149-f90ca118c71c?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviews: 67,
    soldCount: 890,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Keep dry during rainy days with this durable raincoat.'
  },
  {
    id: 'umbrella',
    name: 'Umbrella',
    category: 'Seasonal',
    sku: 'SN-UMBR-041',
    brand: 'Seasonal',
    price: 850,
    discountPrice: 650,
    image: 'https://images.unsplash.com/photo-1559599101-f09722fb49ef?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 120,
    soldCount: 1500,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Large and sturdy umbrella with UV protection.'
  },
  {
    id: 'winter-jacket',
    name: 'Winter Jacket',
    category: 'Seasonal',
    sku: 'SN-WJACK-042',
    brand: 'Sailor',
    price: 4500,
    discountPrice: 3800,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 45,
    soldCount: 560,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Stay warm and stylish with this premium winter jacket.'
  },
  {
    id: 'room-heater',
    name: 'Room Heater',
    category: 'Seasonal',
    sku: 'SN-RHEAT-043',
    brand: 'Vision',
    price: 3500,
    discountPrice: 2900,
    image: 'https://images.unsplash.com/photo-1591147137526-724bbba38139?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 32,
    soldCount: 420,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Portable room heater for cold winter days.'
  },
  {
    id: 'table-fan',
    name: 'Table Fan',
    category: 'Seasonal',
    sku: 'SN-TFAN-044',
    brand: 'Walton',
    price: 2800,
    discountPrice: 2250,
    image: 'https://images.unsplash.com/photo-1618941723680-a65a200f6844?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 89,
    soldCount: 1200,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'High-speed table fan for personal use.'
  },
  {
    id: 'air-cooler',
    name: 'Air Cooler',
    category: 'Seasonal',
    sku: 'SN-ACOOL-045',
    brand: 'Symphony',
    price: 18000,
    discountPrice: 15500,
    image: 'https://images.unsplash.com/photo-1631526403164-399066d48293?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 56,
    soldCount: 680,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: true,
    description: 'Efficient air cooler for large rooms.'
  },
  {
    id: 'travel-duffel-bag',
    name: 'Elite Duffel Travel Bag',
    category: 'Travel Bag',
    sku: 'BG-DFLTRV-016',
    brand: 'Sailor',
    price: 4900,
    discountPrice: 3800,
    image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 35,
    soldCount: 180,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Constructed from highly durable oil-waxed canvas and crazy-horse leather accents. Offers spacious storage for international trips or weekend gateways.'
  },
  {
    id: 'classic-cotton-t-shirt',
    name: 'Premium Cotton Casual T-Shirt',
    category: 'Men\'s T-Shirt',
    sku: 'TS-CLSCCOT-017',
    brand: 'Yellow',
    price: 950,
    discountPrice: 790,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 180,
    soldCount: 2200,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: true,
    isNew: false,
    description: 'Super-soft combed ringspun organic cotton fabric that provides lightweight breathability. Double-stitched seams guarantee premium lasting wear.'
  },
  {
    id: 'premium-fitted-polo',
    name: 'Premium Slim Fit Polo Shirt',
    category: 'Polo Shirt',
    sku: 'PS-PRMFIT-018',
    brand: 'Yellow',
    price: 1500,
    discountPrice: 1250,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviews: 130,
    soldCount: 940,
    is_flash_sale: false,
    is_trending: false,
    is_best_selling: true,
    isNew: false,
    description: 'High-grade honeycomb cotton pique knit. Designed with elegant athletic collars, deep buttons and vibrant, fade-resistant dyes.'
  },
  {
    id: 'snapback-baseball-cap',
    name: 'Urban Snapback Baseball Cap',
    category: 'Cap Collection',
    sku: 'CP-SBBASE-019',
    brand: 'Krafts',
    price: 750,
    discountPrice: 590,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviews: 42,
    soldCount: 380,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'A street aviator-approved structured flat bill baseball snapback offering a comfortable moisture-wicking sweatband and adjustable snap.'
  },
  {
    id: 'silver-wrist-chain',
    name: 'Silver Stainless Steel Wrist Chain',
    category: 'Men\'s Accessories',
    sku: 'AC-SVRCHN-020',
    brand: 'Krafts',
    price: 1200,
    discountPrice: 950,
    image: 'https://images.unsplash.com/photo-1620138546344-7b2c0b05159d?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 28,
    soldCount: 150,
    is_flash_sale: false,
    is_trending: true,
    is_best_selling: false,
    isNew: true,
    description: 'Engineered from authentic premium 316L medical-grade stainless steel. Hypoallergenic, rust-proof, sleek, and polished to a brilliant silver mirror shine.'
  }
];

export const generateDemoProducts = (): Product[] => {
  const products: Product[] = [];
  
  PRODUCT_SPECS.forEach((spec) => {
    const sizeList = ['S', 'M', 'L', 'XL'];
    const variants = sizeList.map((size) => ({
      title: 'Size & Color',
      option: `${size} - Charcoal Black`,
      price: (spec.discountPrice || spec.price).toString()
    }));

    products.push({
      id: spec.id,
      name: spec.name,
      sku: spec.sku,
      category: spec.category,
      price: spec.price,
      discountPrice: spec.discountPrice,
      stock: 45,
      image: spec.image,
      images: [spec.image, 'https://images.unsplash.com/photo-1620138546344-7b2c0b05159d?w=600&auto=format&fit=crop&q=80'],
      rating: spec.rating,
      reviews: spec.reviews,
      isNew: spec.isNew,
      brand: spec.brand,
      status: 'active',
      description: spec.description,
      createdAt: Date.now() - (3600000 * 24),
      buyingPrice: Math.floor(spec.price * 0.65),
      warranty: '1 Year Brand Warranty',
      unitName: 'Piece',
      soldCount: spec.soldCount,
      seoPoints: [
        `100% Genuine and authentic ${spec.brand || 'premium'} item`,
        'Includes official standard barcode tag',
        'Top-rated craftsmanship with pristine warranty terms',
        'Available for priority instant Cash on Delivery'
      ],
      variants,
      shippingZones: [
        { zone: 'Inside Dhaka', charge: '60' },
        { zone: 'Outside Dhaka', charge: '120' }
      ],
      is_flash_sale: spec.is_flash_sale,
      is_trending: spec.is_trending,
      is_best_selling: spec.is_best_selling,
      is_regular: true,
      reward_coins: 150,
      coin_enabled: true
    });
  });

  return products;
};

// 100 Demo Customers Directory
export const CUSTOMER_NAMES = [
  'Imtiaz Khan', 'Fahim Morshed', 'Taskeen Ahmed', 'Sajid Islam', 'Rimi Tabassum',
  'Mehedi Hasan', 'Jannat ul Ferdous', 'Abrar Zawad', 'Samia Rahman', 'Naimur Rahman',
  'Farhana Islam', 'Zahidul Islam', 'Tahsan Khan', 'Anika Bushra', 'Rakibul Hasan',
  'Shakila Akter', 'Nabil Chowdhury', 'Maliha Tabassum', 'Rezwan Ahmed', 'Sanzida Akhter',
  'Hasan Mahmud', 'Tamim Alom', 'Rahim Ahmed', 'Karim Hasan', 'Nusrat Jahan',
  'Arifur Rahman', 'Sabrina Sultana', 'Tanvir Ahmed', 'Mafia Akter', 'Kamrul Islam',
  'Nasrin Sultana', 'Saidur Rahman', 'Mohammad Ali', 'Fatema Khatun', 'Abdullah Al Mamun',
  'Zareen Tasnim', 'Tanvir Hossain', 'Sumaiya Akter', 'Rakibul Islam', 'Ishrat Jahan',
  'Farhan Ahmed', 'Sadia Afrin', 'Mahbubur Rahman', 'Lutfun Nahar', 'Asif Iqbal',
  'Tania Sultana', 'Mustafizur Rahman', 'Nazia Hasan', 'Rubel Hossain', 'Keya Akter',
  'Shafiqul Islam', 'Anika Tabassum', 'Zahid Hasan', 'Rumana Ahmed', 'Sabbir Hossain',
  'Dilara Begum', 'Kamal Uddin', 'Saleha Khatun', 'Mishu Ahmed', 'Sharmin Akter',
  'Riyad Hossain', 'Munira Sultana', 'Elias Kanchon', 'Shampa Akter', 'Tipu Sultan',
  'Babul Mia', 'Asma Ul Husna', 'Jamal Hossain', 'Kulsum Akter', 'Sirazul Islam',
  'Rehana Begum', 'Belal Ahmed', 'Sabina Yasmin', 'Manoj Kumar', 'Priya Rani',
  'Subrata Das', 'Mousumi Akter', 'Biplob Ahmed', 'Shahanaz Parvin', 'Iqbal Hossain',
  'Rabeya Khatun', 'Shahed Ahmed', 'Shamima Nasrin', 'Mustafa Kamal', 'Farida Begum',
  'Anwar Hossain', 'Jahanara Alam', 'Mizanur Rahman', 'Beauty Akter', 'Sohel Rana',
  'Nasima Sultana', 'Aminur Islam', 'Rokeya Begum', 'Shahadat Hossain', 'Rina Akter'
];

export const generateDemoCustomers = (): Customer[] => {
  // Ensure we reach ~100 customers by cycling or extending
  const totalToGenerate = 100;
  const customers: Customer[] = [];

  for (let index = 0; index < totalToGenerate; index++) {
    const name = CUSTOMER_NAMES[index % CUSTOMER_NAMES.length] + (index >= CUSTOMER_NAMES.length ? ` (${Math.floor(index/CUSTOMER_NAMES.length)})` : '');
    const randomPhone = `01${index % 2 === 0 ? '7' : '8'}${Math.floor(1 + Math.random() * 9)}${Math.floor(1000000 + Math.random() * 9000000)}`;
    const cities = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
    const selectedCity = cities[index % cities.length];
    
    // Distribution: 60 Active, 20 VIP, 10 Suspended/Blocked, 10 New
    let status: Customer['status'] = 'Active';
    let customerType: Customer['customerType'] = 'Regular';
    let totalOrders = 0;

    if (index < 20) {
      status = 'VIP';
      customerType = 'VIP';
      totalOrders = Math.floor(Math.random() * 25) + 15; // 15 to 40 orders
    } else if (index >= 20 && index < 30) {
      status = 'Suspended';
      customerType = 'Regular';
      totalOrders = Math.floor(Math.random() * 5);
    } else if (index >= 90) {
      status = 'Active';
      customerType = 'New';
      totalOrders = Math.floor(Math.random() * 2);
    } else {
      status = 'Active';
      customerType = index % 10 === 0 ? 'Wholesale' : 'Regular';
      totalOrders = Math.floor(Math.random() * 12) + 2;
    }

    const totalSpend = totalOrders * (Math.floor(Math.random() * 3000) + 1200);

    customers.push({
      id: `CUST-${1000 + index + 1}`,
      name,
      phones: [randomPhone],
      emails: [`${name.toLowerCase().replace(/[^a-z]/g, '')}${index}@example.com`],
      address: {
        country: 'Bangladesh',
        city: selectedCity,
        area: 'Commercial Hub Area',
        street: `House ${Math.floor(Math.random() * 200) + 1}, Road ${index + 1}`,
        zipCode: `120${index % 10}`,
        division: selectedCity,
        district: selectedCity,
      },
      whatsApp: randomPhone,
      socialLinks: [{ platform: 'Facebook', username: name.replace(/ /g, '.') }],
      status,
      customerType,
      totalOrders,
      totalSpend,
      lastLogin: Date.now() - (Math.random() * 15 * 24 * 3600000), 
      totalLogins: Math.floor(Math.random() * 50) + 1,
      lastIP: '192.168.1.' + Math.floor(Math.random() * 254),
      deviceType: Math.random() > 0.5 ? 'Desktop' : 'Mobile',
      profileImage: `https://i.pravatar.cc/150?u=${index}`,
      createdAt: Date.now() - (index * 3600000 * 24 * 2.5), 
      isRead: true,
      isDemo: true
    });
  }

  return customers;
};

// 50 Demo Orders distributed across the new products
export const generateDemoOrders = (products: Product[], customers: Customer[]): Order[] => {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['Placed', 'Confirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled', 'Pending', 'Packaging', 'Returned'];
  const paymentMethods = ['COD', 'bKash', 'Nagad', 'Rocket', 'Card'];
  const paymentStatuses: Order['paymentStatus'][] = ['Paid', 'Partial', 'Unpaid', 'Cash on Delivery'];
  
  if (products.length === 0 || customers.length === 0) return [];

  for (let i = 1; i <= 50; i++) {
    const customer = customers[(i - 1) % customers.length];
    const product = products[(i * 3) % products.length] || products[0];
    const qty = (i % 2) + 1;
    const subtotal = product.discountPrice ? product.discountPrice * qty : product.price * qty;
    const deliveryCharge = 120;
    const discount = { type: 'fixed' as const, value: 0, amount: 0 };
    const tax = { percent: 0, amount: 0 };
    const total = subtotal + deliveryCharge;
    
    const status = statuses[i % statuses.length];
    const payStatus = status === 'Delivered' ? 'Paid' : paymentStatuses[i % paymentStatuses.length];
    const payMethod = paymentMethods[i % paymentMethods.length];
    
    const formattedIdNum = 100000 + i;
    const orderId = `ORD-${formattedIdNum}`;
    
    const minutesOld = i * 45;
    const orderDate = Date.now() - (minutesOld * 60000);
    
    orders.push({
      id: `ord-demo-${i}`,
      orderId,
      billId: `BILL-${formattedIdNum}`,
      productLink: `https://luxemart.bd/order/${orderId}`,
      customerName: customer.name,
      mobileNumber: customer.phones[0],
      email: customer.emails[0],
      fullAddress: `${customer.address.street}, ${customer.address.area}, ${customer.address.city}`,
      cityArea: customer.address.city,
      postalCode: customer.address.zipCode,
      deliveryMode: i % 2 === 0 ? 'Express Delivery' : 'Standard Delivery',
      paymentMethod: payMethod,
      status,
      statusHistory: [
        { status: 'Placed', timestamp: orderDate - 3600000 },
        { status, timestamp: orderDate }
      ],
      status_updated_at: orderDate,
      paymentStatus: payStatus,
      type: 'Online',
      items: [
        {
          productId: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          quantity: qty,
          variant: 'XL - Charcoal Black',
          image: product.image
        }
      ],
      subtotal,
      discount,
      tax,
      deliveryCharge,
      paidAmount: payStatus === 'Paid' ? total : 0,
      dueAmount: payStatus === 'Paid' ? 0 : total,
      total,
      date: orderDate,
      isRead: true,
      isDemo: true,
      courier: {
        name: i % 2 === 0 ? 'Pathao' : 'Steadfast Courier',
        trackingId: `TRK-${900000 + i}`,
        status: status === 'Delivered' ? 'Delivered' : 'Assigned'
      },
      utmParams: i % 5 === 0 ? {
        utm_source: 'facebook',
        utm_medium: 'cpc',
        utm_campaign: 'summer_sale_2026',
        utm_content: 'banner_carousel_blue',
        utm_term: 'luxury fashion bangladesh',
        referrer: 'https://l.facebook.com/',
        landingPage: 'https://luxemart.bd/products/' + product.id,
        firstTouch: new Date(orderDate - 7200000).toISOString(),
        lastTouch: new Date(orderDate).toISOString()
      } : i % 5 === 2 ? {
        utm_source: 'google',
        utm_medium: 'organic',
        utm_campaign: 'seo_brand_awareness',
        utm_content: 'search_intent',
        utm_term: 'buy authentic products dhaka',
        referrer: 'https://www.google.com/',
        landingPage: 'https://luxemart.bd/collections/hot-deals',
        firstTouch: new Date(orderDate - 1800000).toISOString(),
        lastTouch: new Date(orderDate).toISOString()
      } : i % 5 === 3 ? {
        utm_source: 'tiktok',
        utm_medium: 'video_ads',
        utm_campaign: 'viral_product_review',
        utm_content: 'micro_influencer_unboxing',
        utm_term: 'tiktok_shop_trending_items',
        referrer: 'https://www.tiktok.com/',
        landingPage: 'https://luxemart.bd/products/' + product.id,
        firstTouch: new Date(orderDate - 3600000).toISOString(),
        lastTouch: new Date(orderDate).toISOString()
      } : i % 5 === 4 ? {
        utm_source: 'instagram',
        utm_medium: 'social_story',
        utm_campaign: 'flash_sale_ramadan',
        utm_content: 'instagram_story_swipe_up',
        utm_term: 'tazumart_trendy',
        referrer: 'https://l.instagram.com/',
        landingPage: 'https://luxemart.bd/offers',
        firstTouch: new Date(orderDate - 5000000).toISOString(),
        lastTouch: new Date(orderDate).toISOString()
      } : {
        utm_source: 'direct',
        utm_medium: 'none',
        referrer: 'direct_traffic',
        landingPage: 'https://luxemart.bd/',
        firstTouch: new Date(orderDate - 60000).toISOString(),
        lastTouch: new Date(orderDate).toISOString()
      }
    });
  }

  return orders;
};
