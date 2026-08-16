import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

  console.log("=== 1. FETCHING BANNERS BEFORE DELETE ===");
  const { data: bData } = await supabase.from("banners").select("id, name, status");
  console.log("Found in banners:", bData?.length);

  console.log("=== 2. DELETING FROM BANNERS TABLE ===");
  const { data: d1, error: e1 } = await supabase.from("banners").delete().neq("id", "keep_nothing_delete_all");
  console.log("Delete banners result:", { error: e1 });

  console.log("=== 3. DELETING FROM BANNERS_DRAFT TABLE ===");
  const { data: d2, error: e2 } = await supabase.from("banners_draft").delete().neq("id", "keep_nothing_delete_all");
  console.log("Delete banners_draft result:", { error: e2 });

  console.log("=== 4. CLEARING SETTINGS main_hero_banners ===");
  const { error: e3 } = await supabase.from("settings").upsert({
    id: "main_hero_banners",
    value: "[]"
  });
  console.log("Clear settings result:", { error: e3 });

  // Update public/main_banners_data.json to empty
  fs.writeFileSync("./public/main_banners_data.json", JSON.stringify({
    banners: [],
    updated_at: new Date().toISOString()
  }, null, 2));

  console.log("=== 5. VERIFYING EMPTY STATE ===");
  const { data: bAfter } = await supabase.from("banners").select("*");
  console.log("Remaining rows in banners table:", bAfter?.length);
  const { data: dAfter } = await supabase.from("banners_draft").select("*");
  console.log("Remaining rows in banners_draft table:", dAfter?.length);
}

main().catch(console.error);
