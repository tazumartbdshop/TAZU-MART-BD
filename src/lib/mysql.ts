import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: (process.env.DB_HOST || 'auth-db2141.hstgr.io').replace(/^https?:\/\//, '').replace(/\/$/, '').trim(),
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'u103041740_tazumartbd',
  user: process.env.DB_USER || 'u103041740_tazumart',
  password: process.env.DB_PASSWORD || 'YOU@suf60679',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
