const mysql = require('mysql2/promise');

async function check() {
  const config = {
    host: 'auth-db2141.hstgr.io',
    user: 'u103041740_tazumartbd',
    password: 'YOU@suf60679',
    database: 'u103041740_TAZU_MART_BD',
  };

  const conn = await mysql.createConnection(config);
  console.log('Connected to MySQL...');

  try {
    const [categories] = await conn.execute('SELECT * FROM `categories`');
    console.log('Categories:', categories.map(c => c.name));
  } catch (err) {
    console.error('Error selecting categories:', err.message);
  }

  await conn.end();
}

check().catch(console.error);
