const fs = require('fs');
let code = fs.readFileSync('src/pages/OrderDetails.tsx', 'utf8');

code = code.replace(
`                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />`,
`                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />`
);

fs.writeFileSync('src/pages/OrderDetails.tsx', code);
console.log('done');
