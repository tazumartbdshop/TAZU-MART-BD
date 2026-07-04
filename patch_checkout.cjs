const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');

// We need to map item.slug correctly.
code = code.replace(
`        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: 'Default',
          image: item.image
        })),`,
`        items: items.map(item => ({
          productId: item.id.split('-')[0], // Extract base product ID
          slug: item.slug,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.id.includes('-') ? item.id.substring(item.id.indexOf('-') + 1) : 'Default',
          image: item.image || ''
        })),`
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log('done');
