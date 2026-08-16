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
  console.log("=== BANNERS SCHEMA ===");
  console.log(JSON.stringify(schema.definitions.banners, null, 2));

  console.log("=== BANNERS_DRAFT SCHEMA ===");
  console.log(JSON.stringify(schema.definitions.banners_draft, null, 2));

  console.log("=== LOGIN_BANNERS SCHEMA ===");
  console.log(JSON.stringify(schema.definitions.login_banners, null, 2));
}

main().catch(console.error);
