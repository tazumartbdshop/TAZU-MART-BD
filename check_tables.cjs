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
    const [banners] = await conn.execute('DESCRIBE `banners`');
    console.log('Banners columns:', banners.map(b => b.Field));
  } catch (err) {
    console.error('Error describing banners:', err.message);
  }

  try {
    const [bannersDraft] = await conn.execute('DESCRIBE `banners_draft`');
    console.log('BannersDraft columns:', bannersDraft.map(b => b.Field));
  } catch (err) {
    console.error('Error describing banners_draft:', err.message);
  }

  await conn.end();
}

check().catch(console.error);
