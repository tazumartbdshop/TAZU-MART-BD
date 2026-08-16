import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  console.log("=== CHECKING BANNERS TABLE ===");
  const { data: bData, error: bErr } = await supabase.from("banners").select("*");
  console.log("banners count:", bData?.length, "error:", bErr);
  console.log("banners rows:", bData);

  console.log("=== CHECKING BANNERS_DRAFT TABLE ===");
  const { data: dData, error: dErr } = await supabase.from("banners_draft").select("*");
  console.log("banners_draft count:", dData?.length, "error:", dErr);

  console.log("=== CHECKING SETTINGS main_hero_banners ===");
  const { data: sData } = await supabase.from("settings").select("*").eq("id", "main_hero_banners");
  console.log("settings:", sData);
}

main().catch(console.error);
