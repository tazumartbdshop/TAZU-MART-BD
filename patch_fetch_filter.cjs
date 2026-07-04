const fs = require('fs');
let code = fs.readFileSync('src/store/useOrderStore.ts', 'utf8');

code = code.replace(
`                 const orderItems = itemsData.filter(item => item.order_id === parsed.orderId);`,
`                 const orderItems = itemsData.filter(item => item.order_id === parsed.orderId || item.order_id === parsed.id);`
);

fs.writeFileSync('src/store/useOrderStore.ts', code);
console.log('done');
