const fs = require('fs');
let code = fs.readFileSync('src/components/product/CompactProductCard.tsx', 'utf8');

code = code.replace(
`        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/90 backdrop-blur p-1 rounded-full shadow-sm text-gray-400 hover:text-red-500"><Heart className="w-3.5 h-3.5" /></button>
        </div>`,
`        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(\`/product/\${product.slug || product.id}\`); }}
            className="bg-white/90 backdrop-blur p-1.5 rounded-full shadow-sm text-gray-500 hover:text-black transition-colors"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
            className={\`bg-white/90 backdrop-blur p-1.5 rounded-full shadow-sm transition-colors \${isSavedInWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}\`}
            title="Wishlist"
          >
            <Heart className="w-3.5 h-3.5" fill={isSavedInWishlist ? "currentColor" : "none"} />
          </button>
        </div>`
);

fs.writeFileSync('src/components/product/CompactProductCard.tsx', code);
console.log('done');
