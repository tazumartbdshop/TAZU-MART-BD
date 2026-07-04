const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

code = code.replace(
`                      <Link to="/shop" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Eye className="w-4 h-4" /></div>
                           <span className="text-sm font-bold text-gray-700">All Categories</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-all" />
                      </Link>`,
`                      <Link to="/categories" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Eye className="w-4 h-4" /></div>
                           <span className="text-sm font-bold text-gray-700">All Categories</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-all" />
                      </Link>
                      <Link to="/products" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><ShoppingBag className="w-4 h-4" /></div>
                           <span className="text-sm font-bold text-gray-700">All Products</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-all" />
                      </Link>`
);

fs.writeFileSync('src/components/layout/Header.tsx', code);
console.log('done');
