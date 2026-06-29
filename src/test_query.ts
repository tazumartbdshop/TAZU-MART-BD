import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/customers');
    const data: any = await res.json();
    console.log("=== API CUSTOMERS ===");
    console.log("Status:", res.status);
    console.log("Customers count:", data.customers?.length);
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error("Failed to query API endpoint:", err.message);
  }
}

run();
