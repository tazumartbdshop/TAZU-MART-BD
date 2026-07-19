import * as mysql from 'mysql2/promise';

const config = {
  host: 'auth-db2141.hstgr.io',
  user: 'u103041740_tazumartbd',
  password: 'YOU@suf60679',
  database: 'u103041740_TAZU_MART_BD',
  port: 3306,
};

async function main() {
  const connection = await mysql.createConnection(config);
  try {
    console.log("Connected to MySQL!");
    
    // Attempt inserting a temporary product
    const testId = 'test_prod_' + Math.random().toString(36).substring(2, 9);
    const insertSql = "INSERT INTO `products` (`id`, `name`, `sku`, `category`, `price`, `stock`, `status`, `created_at`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [testId, 'Test Product', 'test-sku', 'Uncategorized', 99.99, 10, 'active', Date.now()];
    
    console.log("Executing insert...");
    const [result]: any = await connection.execute(insertSql, values);
    console.log("Insert successful! Affected rows:", result.affectedRows);
    
    // Now delete the test product
    console.log("Cleaning up test product...");
    await connection.execute("DELETE FROM `products` WHERE `id` = ?", [testId]);
    console.log("Cleanup successful!");
    
  } catch (err: any) {
    console.error("Error during MySQL operation:", err);
  } finally {
    await connection.end();
  }
}

main();
