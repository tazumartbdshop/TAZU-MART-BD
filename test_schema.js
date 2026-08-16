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
  console.log("Paths available in Supabase:", Object.keys(schema.paths || {}));
  console.log("Definitions in Supabase:", Object.keys(schema.definitions || {}));
}

main().catch(console.error);
