const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

if (!code.includes('handleBuyAgain')) {
  code = code.replace(
    `  const confirmLogout = () => {
    logout();
    navigate('/login');
  };`,
    `  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBuyAgain = (order: any) => {
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

  code = code.replace(
    `<div className="flex gap-2">
                            <button 
                               onClick={() => setTrackingOrder(order)}`,
    `<div className="flex gap-2">
                            <button 
                               onClick={() => handleBuyAgain(order)}
                              className="text-[9px] font-black border border-gray-200 text-gray-800 px-3 py-1.5 uppercase tracking-wider hover:bg-gray-50 transition-colors"
                            >
                              Buy Again
                            </button>
                            <button 
                               onClick={() => setTrackingOrder(order)}`
  );
  
  fs.writeFileSync('src/pages/Account.tsx', code);
}
console.log('done');
