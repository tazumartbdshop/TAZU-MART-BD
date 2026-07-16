const mysql = require('mysql2/promise');

const config = {
  host: 'auth-db2141.hstgr.io',
  user: 'u103041740_tazumartbd',
  password: 'YOU@suf60679',
  database: 'u103041740_TAZU_MART_BD',
  port: 3306,
};

async function test() {
  try {
    const connection = await mysql.createConnection(config);
    console.log("Connected successfully!");
    
    console.log("\n--- categories table schema ---");
    const [catCols] = await connection.execute("DESCRIBE categories");
    console.log(catCols);

    console.log("\n--- products table schema ---");
    const [prodCols] = await connection.execute("DESCRIBE products");
    console.log(prodCols);
    
    await connection.end();
  } catch (err) {
    console.error("Failed:", err);
  }
}

test();
