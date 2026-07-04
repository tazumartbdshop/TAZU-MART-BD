const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

code = code.replace(
`                      <Link to="/shop" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-black">Shop</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
                      </Link>`,
`                      <Link to="/products" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-black">All Products</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
                      </Link>`
);

// We also need to see if there is desktop menu "/shop" link
code = code.replace(
`<Link to="/shop" className="text-sm font-semibold hover:text-black transition-colors text-navbar-text/80">Shop</Link>`,
`<Link to="/products" className="text-sm font-semibold hover:text-black transition-colors text-navbar-text/80">All Products</Link>`
);

fs.writeFileSync('src/components/layout/Header.tsx', code);
console.log('done');
