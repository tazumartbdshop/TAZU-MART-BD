const fs = require('fs');
let code = fs.readFileSync('src/pages/OrderDetails.tsx', 'utf8');

code = code.replace(
`              <button
                onClick={() => {
                  /* handle review or buy again */
                  navigate(\`/product/\${order.items[0].productId}\`);
                }}
                className="flex-1 bg-black text-white py-3 rounded-md text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                Write Review
              </button>`,
`              <button
                onClick={() => {
                  const firstItem = order.items[0];
                  const productSlugOrId = firstItem.slug || firstItem.productId || firstItem.id;
                  navigate(\`/product/\${productSlugOrId}?buyAgain=true\`);
                }}
                className="flex-1 bg-black text-white py-3 rounded-md text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                Buy Again
              </button>`
);

fs.writeFileSync('src/pages/OrderDetails.tsx', code);
console.log('done');
