import fs from "fs";

async function main() {
  const config = JSON.parse(fs.readFileSync("./supabase_config.json", "utf8"));
  
  // Test GraphQL
  try {
    const res = await fetch(`${config.supabaseUrl}/graphql/v1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": config.supabaseServiceKey,
        "Authorization": `Bearer ${config.supabaseServiceKey}`
      },
      body: JSON.stringify({
        query: `query { __schema { queryType { fields { name } } mutationType { fields { name } } } }`
      })
    });
    console.log("/graphql/v1 status:", res.status);
    const json = await res.json();
    console.log("GraphQL schema fields:", JSON.stringify(json, null, 2));
  } catch (e) {
    console.log("GraphQL error:", e.message);
  }
}

main().catch(console.error);
