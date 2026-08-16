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
  
  console.log("=== BANNERS COLUMNS ===");
  console.log(Object.keys(schema.definitions.banners.properties));

  console.log("=== BANNERS_DRAFT COLUMNS ===");
  console.log(Object.keys(schema.definitions.banners_draft.properties));

  console.log("=== LOGIN_BANNERS COLUMNS ===");
  console.log(Object.keys(schema.definitions.login_banners.properties));
}

main().catch(console.error);
