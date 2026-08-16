import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  const res = await fetch(`${config.supabaseUrl}/rest/v1/`, {
    headers: {
      "apikey": config.supabaseServiceKey,
      "Authorization": `Bearer ${config.supabaseServiceKey}`
    }
  });
  const schema = await res.json();
  const rpcs = Object.keys(schema.paths || {}).filter(p => p.startsWith('/rpc/'));
  console.log("All RPCs in Supabase:", rpcs);
}

main().catch(console.error);
