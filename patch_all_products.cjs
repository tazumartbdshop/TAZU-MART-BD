const fs = require('fs');
let code = fs.readFileSync('src/pages/AllProducts.tsx', 'utf8');

code = code.replace(
`import CompactProductCard from '../components/product/CompactProductCard';`,
`import { CompactProductCard } from '../components/product/CompactProductCard';`
);

fs.writeFileSync('src/pages/AllProducts.tsx', code);
console.log('done');
