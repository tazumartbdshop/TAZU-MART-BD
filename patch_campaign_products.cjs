const fs = require('fs');
let content = fs.readFileSync('src/pages/CampaignProductsPage.tsx', 'utf8');

// Replace everything inside the map loop with ProductCard
content = content.replace(
  /return \(\s*<div\s*key=\{product\.id\}[\s\S]*?<\/div>\s*\);\s*\}\)/s,
  `return (
    <div key={product.id}>
      <ProductCard product={product} />
    </div>
  );
})`
);

// Add ProductCard import at the top
content = content.replace(
  "import { toast } from 'react-hot-toast';",
  "import { toast } from 'react-hot-toast';\nimport { ProductCard } from '../components/ui/ProductCard';"
);

// Remove the unused handleAddToCart and handleBuyNow from CampaignProductsPage
content = content.replace(/const handleAddToCart = [\s\S]*?toast\.error\("Failed to process Buy Now request"\);\n    \}\n  \};/s, "");

fs.writeFileSync('src/pages/CampaignProductsPage.tsx', content);
