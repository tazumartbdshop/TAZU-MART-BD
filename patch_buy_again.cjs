const fs = require('fs');
let code = fs.readFileSync('src/pages/ToReview.tsx', 'utf8');

code = code.replace(
`  const handleBuyAgain = (order: any) => {
    order.items.forEach((item: any) => {
      addItem({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || '',
        quantity: item.quantity
      });
    });
    navigate('/cart');
  };`,
`  const handleBuyAgain = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    const firstItem = order.items[0];
    const productSlugOrId = firstItem.slug || firstItem.productId || firstItem.id;
    if (productSlugOrId) {
      navigate(\`/product/\${productSlugOrId}?buyAgain=true\`);
    } else {
      navigate('/products');
    }
  };`
);

fs.writeFileSync('src/pages/ToReview.tsx', code);
console.log('done');
