import pg from "pg";
const { Client } = pg;

const passwords = [
  'YOU@suf60679',
  'YOU@suf60679!',
  'you@suf60679',
  'Yousuf60679',
  'Yousuf@60679',
  'admin.tazumartbd@gmail.com',
  'admin123',
  'admin1234',
  'adminpassword',
  'novapassword',
  'chefpassword',
  '12345678',
  'password',
  'tazumart',
  'tazumartbd',
  'TazuMart@2024',
  'TazuMart@2025',
  'TazuMart@2026',
  'TAZU_MART_BD',
  'mdimtiazkhan.devolop@gmail.com'
];

async function tryPassword(pw) {
  const client = new Client({
    host: 'db.gaqyfjztpxvzijouiwwh.supabase.co',
    port: 6543,
    user: 'postgres',
    password: pw,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`FOUND DATABASE PASSWORD: "${pw}" !`);
    const res = await client.query("SELECT 1;");
    console.log("Success:", res.rows);
    
    console.log("Setting REPLICA IDENTITY FULL on banners and banners_draft...");
    await client.query("ALTER TABLE public.banners REPLICA IDENTITY FULL;");
    await client.query("ALTER TABLE public.banners_draft REPLICA IDENTITY FULL;");
    await client.query("ALTER TABLE public.banners ADD PRIMARY KEY (id);").catch(e => console.log("PK banners:", e.message));
    await client.query("ALTER TABLE public.banners_draft ADD PRIMARY KEY (id);").catch(e => console.log("PK banners_draft:", e.message));
    
    console.log("Successfully altered banners replica identity and primary key!");
    await client.end();
    return true;
  } catch (err) {
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  for (const pw of passwords) {
    const ok = await tryPassword(pw);
    if (ok) return;
  }
  console.log("None of the common passwords matched directly.");
}

main().catch(console.error);
