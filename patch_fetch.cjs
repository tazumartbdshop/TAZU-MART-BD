const fs = require('fs');
let code = fs.readFileSync('src/store/useOrderStore.ts', 'utf8');

code = code.replace(
`                     productId: item.product_id,
                     name: item.product_name,
                     price: item.product_price,
                     quantity: item.quantity,
                     image: item.product_image,
                     variant: 'Default'`,
`                     productId: item.product_id || item.productId,
                     name: item.name || item.product_name || 'Unknown',
                     price: item.price || item.product_price || 0,
                     quantity: item.quantity || 1,
                     image: item.image || item.product_image || '',
                     variant: item.variant || 'Default',
                     slug: item.slug || item.productId`
);

fs.writeFileSync('src/store/useOrderStore.ts', code);
console.log('done');
