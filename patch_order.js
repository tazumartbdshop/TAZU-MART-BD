const fs = require('fs');
let code = fs.readFileSync('src/store/useOrderStore.ts', 'utf8');

// We want to make the order_items and product updates run without awaiting them.
code = code.replace(
`        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);`,
`        supabase.from('order_items').insert(orderItemsPayload).then(({ error: itemsError }) => {
          if (itemsError) {
            console.error("[Supabase Sync] Failed to insert items into order_items (Manual fallback):", itemsError);
          } else {
            console.log("[Supabase Sync] Order items inserted successfully into order_items table.");
          }
        });`
);

code = code.replace(
`        if (itemsError) {
          console.error("[Supabase Sync] Failed to insert items into order_items (Manual fallback):", itemsError);
        } else {
          console.log("[Supabase Sync] Order items inserted successfully into order_items table.");
        }`,
``
);

fs.writeFileSync('src/store/useOrderStore.ts', code);
console.log('done');
