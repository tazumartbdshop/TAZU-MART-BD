const fs = require('fs');
let code = fs.readFileSync('src/store/useOrderStore.ts', 'utf8');

code = code.replace(
`          variant: item.variant || 'Default',
          image: item.image || '',
          created_at: now`,
`          variant: item.variant || 'Default',
          image: item.image || '',
          slug: item.slug || '',
          created_at: now`
);

fs.writeFileSync('src/store/useOrderStore.ts', code);
console.log('done');
