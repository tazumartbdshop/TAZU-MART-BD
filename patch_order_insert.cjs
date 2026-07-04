const fs = require('fs');
let code = fs.readFileSync('src/store/useOrderStore.ts', 'utf8');

code = code.replace(
`      const { data, error } = await supabase.from('orders').insert([cleanPayload]).select();`,
`      // Insert without select to speed up response time
      const { error } = await supabase.from('orders').insert([cleanPayload]);`
);

code = code.replace(
`console.log("[Supabase Sync] Order inserted successfully into orders table:", data);`,
`console.log("[Supabase Sync] Order inserted successfully into orders table.");`
);

fs.writeFileSync('src/store/useOrderStore.ts', code);
console.log('done');
