const fs = require('fs');
let code = fs.readFileSync('src/pages/Product.tsx', 'utf8');

code = code.replace(
`import { useParams, useNavigate } from 'react-router-dom';`,
`import { useParams, useNavigate, useSearchParams } from 'react-router-dom';`
);

const hookInsertionPoint = `  const { urlParam } = useParams();`;
const newCode = `  const { urlParam } = useParams();
  const [searchParams] = useSearchParams();`;

code = code.replace(hookInsertionPoint, newCode);

const effectInsertionPoint = `  // Effect to add item to recently viewed list`;
const effectCode = `  // Effect to automatically prompt Add to Cart for Buy Again
  useEffect(() => {
    if (searchParams.get('buyAgain') === 'true' && product) {
      setTimeout(() => {
        if (window.confirm(\`Would you like to add \${product.name} to your cart?\`)) {
          const variantString = Object.entries(selectedVariants).map(([k,v]) => \`\${k}: \${v}\`).join(', ');
          const cartItemId = \`\${product.id}-\${Object.values(selectedVariants).join('-')}\`;
          const cartItemName = \`\${product.name}\${variantString ? \` - \${variantString}\` : ''}\`;
          
          addItem({
            id: cartItemId,
            name: cartItemName,
            price: product.discountPrice || product.price,
            originalPrice: product.price,
            image: product.imageUrl || product.image,
            slug: product.slug,
            sku: product.sku,
            quantity: 1,
          });
          toast.success("Product added to cart");
          navigate('/cart');
        } else {
          // Remove query param to prevent reappearing on reload
          navigate(\`/product/\${urlParam}\`, { replace: true });
        }
      }, 500);
    }
  }, [product, searchParams, navigate, urlParam, selectedVariants, addItem]);

  // Effect to add item to recently viewed list`;

code = code.replace(effectInsertionPoint, effectCode);

fs.writeFileSync('src/pages/Product.tsx', code);
console.log('done');
