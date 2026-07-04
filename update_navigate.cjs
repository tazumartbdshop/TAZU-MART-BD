const fs = require('fs');

const files = [
  'src/pages/OrderDetails.tsx',
  'src/pages/Account.tsx',
  'src/pages/ReviewDetails.tsx',
  'src/pages/OfferPage.tsx',
  'src/pages/Search.tsx',
  'src/components/ui/StorefrontPopup.tsx',
  'src/components/home/BestSellingSection.tsx',
  'src/components/home/FlashSaleSection.tsx',
  'src/components/product/ProductReviews.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/navigate\(\`\/product\/\$\{([^}]+)\}\`\)/g, "navigate(`/product/${$1}`)"); 
  fs.writeFileSync(file, content);
});
