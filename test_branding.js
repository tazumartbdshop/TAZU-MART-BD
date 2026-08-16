import { createClient } from "@supabase/supabase-js";
import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  const client = createClient(config.supabaseUrl, config.supabaseServiceKey);
  const { data, error } = await client.from("branding_settings").select("*");
  console.log("Branding settings:", data, "error:", error);
}

main().catch(console.error);
