const fs = require('fs');
const file = 'src/pages/Checkout.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /body: JSON\.stringify\(\{([\s\S]*?subtotal: subtotal\n\s*)\}\)/s;
code = code.replace(regex, "body: JSON.stringify({$1, items: items})");

fs.writeFileSync(file, code);
