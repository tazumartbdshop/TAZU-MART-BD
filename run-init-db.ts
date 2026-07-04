import "dotenv/config";
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

async function initDB() {
  const host = (process.env.DB_HOST || 'auth-db2141.hstgr.io').replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
  const port = Number(process.env.DB_PORT) || 3306;
  const database = process.env.DB_NAME || 'u103041740_tazumartbd';
  const user = process.env.DB_USER || 'u103041740_tazumart';
  const password = process.env.DB_PASSWORD || 'YOU@suf60679';

  console.log(`Connecting to ${host}:${port}...`);
  
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  console.log("Connected to MySQL. Reading SQL file...");
  
  const sql = await fs.readFile(path.join(process.cwd(), 'init-db.sql'), 'utf-8');
  
  console.log("Executing SQL...");
  await connection.query(sql);
  
  console.log("Database initialized successfully!");
  await connection.end();
}

initDB().catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
