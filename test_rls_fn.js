import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  const res = await fetch(`${config.supabaseUrl}/rest/v1/rpc/rls_auto_enable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": config.supabaseServiceKey,
      "Authorization": `Bearer ${config.supabaseServiceKey}`
    },
    body: JSON.stringify({})
  });
  console.log("/rpc/rls_auto_enable status:", res.status, await res.text());
}

main().catch(console.error);
