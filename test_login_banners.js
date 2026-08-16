import { createClient } from "@supabase/supabase-js";
import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  const client = createClient(config.supabaseUrl, config.supabaseServiceKey);

  console.log("Testing insert on login_banners...");
  const testId = "00000000-0000-0000-0000-000000000001";
  const { data: ins, error: insErr } = await client.from("login_banners").insert([{
    id: testId,
    title: "Test Login Banner",
    image_url: "https://example.com/login.jpg",
    is_active: true,
    sort_order: 1
  }]);
  console.log("Insert result:", insErr ? insErr.message : "Success!");

  console.log("Testing delete on login_banners...");
  const { error: delErr } = await client.from("login_banners").delete().eq("id", testId);
  console.log("Delete result:", delErr ? delErr.message : "Success!");
}

main().catch(console.error);
