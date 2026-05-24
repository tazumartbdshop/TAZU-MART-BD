import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Clock, HeadphonesIcon } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden bg-gray-50 pt-8 pb-16 md:pt-16 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <div className="order-2 lg:order-1 flex flex-col justify-center max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 bg-white border border-gray-200 text-xs font-bold tracking-widest text-primary-900 rounded-full mb-6">
                NEW LUXURY COLLECTION
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-primary-900 leading-tight mb-6">
                Elevate Your Everyday Style.
              </h1>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Discover our curated selection of premium perfumes, elegant leather wallets, and exclusive lifestyle accessories crafted for the modern individual.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link 
                  to="/shop"
                  className="bg-primary-900 text-white px-8 py-3.5 font-medium hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 rounded-md transition-all uppercase tracking-wide text-sm flex items-center justify-center"
                >
                  Shop Now
                </Link>
                <Link 
                  to="/category/perfume"
                  className="bg-white text-primary-900 border border-gray-200 px-8 py-3.5 font-medium hover:border-primary-900 rounded-md transition-all uppercase tracking-wide text-sm flex items-center justify-center"
                >
                  Explore Collection
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200">
                <div className="flex flex-col items-start gap-2">
                  <div className="p-2 bg-white rounded-md shadow-sm border border-gray-100">
                    <Truck className="w-5 h-5 text-primary-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="p-2 bg-white rounded-md shadow-sm border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-primary-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">100% Genuine</span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="p-2 bg-white rounded-md shadow-sm border border-gray-100">
                    <Clock className="w-5 h-5 text-primary-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Cash on Delivery</span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="p-2 bg-white rounded-md shadow-sm border border-gray-100">
                    <HeadphonesIcon className="w-5 h-5 text-primary-900" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">24/7 Support</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-square bg-gray-100 shadow-[0_20px_50px_rgb(0,0,0,0.1)]"
            >
              <img
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200"
                alt="Premium Perfume Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur shadow-xl rounded-xl p-6 border border-gray-100/50"
              >
                <div className="flex items-center gap-4">
                  <img src="https://images.unsplash.com/photo-1615397323862-5e6616eb6e8b?auto=format&fit=crop&q=80&w=100" alt="Attar" className="w-16 h-16 rounded-md object-cover shadow-sm" />
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Featured Item</span>
                    <h3 className="font-serif font-semibold text-lg text-primary-900">Tom Ford Oud Wood</h3>
                    <p className="text-sm text-gray-600 font-medium mt-1">Starting from BDT 4,500</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Background decorative blob */}
            <div className="absolute -z-10 -right-20 -top-20 w-[400px] h-[400px] bg-gray-200/50 rounded-full blur-3xl opacity-50" />
            <div className="absolute -z-10 -left-20 -bottom-20 w-[300px] h-[300px] bg-gray-200/70 rounded-full blur-3xl opacity-50" />
          </div>

        </div>
      </div>
    </div>
  );
}
