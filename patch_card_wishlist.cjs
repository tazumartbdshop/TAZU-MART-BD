const fs = require('fs');
let code = fs.readFileSync('src/components/product/CompactProductCard.tsx', 'utf8');

if (!code.includes("useWishlistStore")) {
  code = code.replace(
    `import { useCartStore } from '../../store/useCartStore';`,
    `import { useCartStore } from '../../store/useCartStore';\nimport { useWishlistStore } from '../../store/useWishlistStore';`
  );
  
  code = code.replace(
    `const addItem = useCartStore(state => state.addItem);`,
    `const addItem = useCartStore(state => state.addItem);\n  const { toggleWishlist, isInWishlist } = useWishlistStore();\n  const isSavedInWishlist = product ? isInWishlist(product.id) : false;`
  );
  
  fs.writeFileSync('src/components/product/CompactProductCard.tsx', code);
}
console.log('done');
