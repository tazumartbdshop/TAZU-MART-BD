import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  
  const testPaths = [
    '/pg',
    '/meta/query',
    '/api/database/query',
    '/v1/query',
    '/query',
    '/pgmeta/default/query',
    '/pgmeta/query',
    '/api/query'
  ];

  for (const p of testPaths) {
    try {
      const res = await fetch(`${config.supabaseUrl}${p}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": config.supabaseServiceKey,
          "Authorization": `Bearer ${config.supabaseServiceKey}`
        },
        body: JSON.stringify({ query: "SELECT 1" })
      });
      console.log(`Path ${p} => Status: ${res.status}`);
      if (res.status !== 404) {
        console.log(`Response for ${p}:`, await res.text());
      }
    } catch (e) {
      console.log(`Path ${p} error:`, e.message);
    }
  }
}

main().catch(console.error);
