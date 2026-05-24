import { Link } from 'react-router-dom';
import { categories } from '../../data/mockData';
import { Sparkles, Droplet, CreditCard, Activity, Watch, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  Sparkles,
  Droplet,
  CreditCard,
  Activity,
  Watch,
  Briefcase
};

export function CategorySection() {
  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-primary-900 mb-4">Shop by Category</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Explore our premium collection of carefully curated luxury items.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat, index) => {
            const Icon = iconMap[cat.icon];
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={cat.id}
              >
                <Link
                  to={`/category/${cat.id}`}
                  className="group block"
                >
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 flex flex-col items-center justify-center gap-4 hover:border-gray-200 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center transition-colors group-hover:scale-110 duration-300">
                      <Icon className="w-7 h-7 text-primary-900" />
                    </div>
                    <span className="text-sm font-medium text-primary-900 transition-colors text-center">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
