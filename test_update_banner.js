import { createClient } from "@supabase/supabase-js";
import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  const client = createClient(config.supabaseUrl, config.supabaseServiceKey);

  console.log("Testing update on banners table...");
  const { data, error } = await client.from("banners").update({ status: "archived_deleted" }).eq("id", "test_ban_1");
  console.log("Update result:", error ? error : "Success!");
}

main().catch(console.error);
