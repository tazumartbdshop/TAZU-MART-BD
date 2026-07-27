import { Clock, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustSection() {
  const features = [
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: 'Inside Dhaka in 24h'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payment',
      subtitle: '100% Safe Checkout'
    },
    {
      icon: RefreshCcw,
      title: 'Easy Return',
      subtitle: '7 Days Return Policy'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      subtitle: 'Dedicated Support Team'
    }
  ];

  return (
    <section className="py-12 bg-primary-800 border-t border-b border-primary-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index} 
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary-700 text-gold-500 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-serif font-medium leading-tight">{feature.title}</h4>
                  <p className="text-gray-400 text-xs mt-1">{feature.subtitle}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
