import { createClient } from "@supabase/supabase-js";
import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  console.log("Config loaded:", {
    url: config.supabaseUrl,
    keyLength: config.supabaseKey?.length,
    serviceKeyLength: config.supabaseServiceKey?.length
  });

  const client = createClient(config.supabaseUrl, config.supabaseKey);
  const adminClient = config.supabaseServiceKey ? createClient(config.supabaseUrl, config.supabaseServiceKey) : null;

  const tables = ["categories", "products", "banners", "settings", "reviews", "orders", "users"];

  console.log("\n--- Testing with Anon Key ---");
  for (const table of tables) {
    try {
      const { data, error, status } = await client.from(table).select("*").limit(3);
      if (error) {
        console.error(`Table '${table}' fetch error (Anon):`, error.message, `(Status: ${status})`);
      } else {
        console.log(`Table '${table}' fetch success (Anon):`, data?.length, "rows returned");
      }
    } catch (err) {
      console.error(`Table '${table}' exception (Anon):`, err.message);
    }
  }

  if (adminClient) {
    console.log("\n--- Testing with Service Role Key ---");
    for (const table of tables) {
      try {
        const { data, error, status } = await adminClient.from(table).select("*").limit(3);
        if (error) {
          console.error(`Table '${table}' fetch error (Admin):`, error.message, `(Status: ${status})`);
        } else {
          console.log(`Table '${table}' fetch success (Admin):`, data?.length, "rows returned");
        }
      } catch (err) {
        console.error(`Table '${table}' exception (Admin):`, err.message);
      }
    }
  }
}

main().catch(console.error);
