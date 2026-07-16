const mysql = require('mysql2/promise');

async function inspect() {
  const config = {
    host: 'auth-db2141.hstgr.io',
    user: 'u103041740_tazumartbd',
    password: 'YOU@suf60679',
    database: 'u103041740_TAZU_MART_BD',
  };

  const conn = await mysql.createConnection(config);
  console.log('Connected to MySQL...');

  try {
    const [tables] = await conn.execute('SHOW TABLES');
    console.log('--- ALL TABLES IN DATABASE ---');
    console.log(tables.map(t => Object.values(t)[0]));
  } catch (err) {
    console.error('Error listing tables:', err.message);
  }

  const tablesToDescribe = ['categories', 'products', 'likes', 'comments', 'reviews'];
  for (const table of tablesToDescribe) {
    console.log(`\n--- Structure of table: ${table} ---`);
    try {
      const [rows] = await conn.execute(`DESCRIBE \`${table}\``);
      console.log(rows.map(r => ({ Field: r.Field, Type: r.Type, Null: r.Null, Key: r.Key, Default: r.Default })));
    } catch (err) {
      console.log(`Table \`${table}\` does not exist or error:`, err.message);
    }
  }

  await conn.end();
  console.log('\nInspection complete.');
}

inspect().catch(console.error);
