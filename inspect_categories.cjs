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
    const [rows] = await conn.execute('DESCRIBE `categories`');
    console.log('Table Structure:', rows);
  } catch (err) {
    console.error('Error describing categories:', err.message);
  }

  await conn.end();
  console.log('Inspection complete.');
}

inspect().catch(console.error);
