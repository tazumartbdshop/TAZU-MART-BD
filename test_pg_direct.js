import fs from "fs";

async function testSupabaseEndpoints() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  
  // Test Postgres REST endpoints
  const endpoints = [
    '/pg/query',
    '/database/query',
    '/sql',
    '/api/sql',
    '/rest/v1/rpc/exec',
    '/rest/v1/rpc/execute',
    '/rest/v1/rpc/query'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${config.supabaseUrl}${ep}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.supabaseServiceKey,
          'Authorization': `Bearer ${config.supabaseServiceKey}`
        },
        body: JSON.stringify({ query: 'ALTER TABLE banners REPLICA IDENTITY FULL;' })
      });
      console.log(`Endpoint ${ep} => status: ${res.status}, body: ${await res.text()}`);
    } catch (e) {
      console.log(`Endpoint ${ep} => error: ${e.message}`);
    }
  }
}

testSupabaseEndpoints().catch(console.error);
