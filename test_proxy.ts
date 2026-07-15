import { executeProxyQuery } from "./src/lib/mysql_db.ts";

async function test() {
  console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
  const result = await executeProxyQuery({
    table: 'categories',
    method: 'select'
  });
  console.log('Result:', JSON.stringify(result, null, 2));
}

test().catch(console.error);
