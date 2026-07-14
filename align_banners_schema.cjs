const mysql = require('mysql2/promise');

async function run() {
  const config = {
    host: 'auth-db2141.hstgr.io',
    user: 'u103041740_tazumartbd',
    password: 'YOU@suf60679',
    database: 'u103041740_TAZU_MART_BD',
  };

  const conn = await mysql.createConnection(config);
  console.log('Connected to MySQL...');

  // Re-create/Alter banners and banners_draft tables to ensure perfect compatibility
  const createTableSql = (tableName) => `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      \`id\` VARCHAR(255) PRIMARY KEY,
      \`image\` LONGTEXT,
      \`original_image\` LONGTEXT,
      \`name\` VARCHAR(255),
      \`description\` LONGTEXT,
      \`button_enabled\` TINYINT DEFAULT 0,
      \`button_text\` VARCHAR(255),
      \`button_link\` VARCHAR(500),
      \`is_custom_button_text\` TINYINT DEFAULT 0,
      \`connected_product_id\` VARCHAR(255),
      \`locations\` LONGTEXT,
      \`banner_size\` VARCHAR(100),
      \`cta_destination\` VARCHAR(255),
      \`destination_type\` VARCHAR(255),
      \`cta_text\` VARCHAR(255),
      \`cta_link\` VARCHAR(500),
      \`status\` VARCHAR(50) DEFAULT 'draft',
      \`order\` INT DEFAULT 0,
      \`banner_type\` VARCHAR(100),
      \`offer_text\` VARCHAR(255),
      \`discount_text\` VARCHAR(255),
      \`background_color\` VARCHAR(50),
      \`background_gradient\` VARCHAR(255),
      \`is_gradient\` TINYINT DEFAULT 0,
      \`text_color\` VARCHAR(50),
      \`button_color\` VARCHAR(50),
      \`button_text_color\` VARCHAR(50),
      \`border_color\` VARCHAR(50),
      \`font_family\` VARCHAR(100),
      \`font_size\` VARCHAR(50),
      \`font_weight\` VARCHAR(50),
      \`italic\` TINYINT DEFAULT 0,
      \`alignment\` VARCHAR(50),
      \`logo_image\` LONGTEXT,
      \`product_image\` LONGTEXT,
      \`sticker_type\` VARCHAR(50),
      \`sticker_text\` VARCHAR(100),
      \`countdown_enabled\` TINYINT DEFAULT 0,
      \`countdown_date\` VARCHAR(100),
      \`connected_category_id\` VARCHAR(255),
      \`connected_offer_id\` VARCHAR(255),
      \`created_date\` VARCHAR(100),
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  try {
    // Let's backup any existing records just in case
    let existingBanners = [];
    try {
      const [rows] = await conn.execute('SELECT * FROM `banners`');
      existingBanners = rows;
      console.log(`Backed up ${existingBanners.length} rows from \`banners\``);
    } catch (e) {
      console.log('No existing banners or banners table is different:', e.message);
    }

    let existingDrafts = [];
    try {
      const [rows] = await conn.execute('SELECT * FROM `banners_draft`');
      existingDrafts = rows;
      console.log(`Backed up ${existingDrafts.length} rows from \`banners_draft\``);
    } catch (e) {
      console.log('No existing drafts or banners_draft table is different:', e.message);
    }

    // Drop tables to recreate with clean compatible schema
    console.log('Dropping existing tables to clean schema...');
    await conn.execute('DROP TABLE IF EXISTS `banners`');
    await conn.execute('DROP TABLE IF EXISTS `banners_draft`');

    console.log('Creating aligned \`banners\` table...');
    await conn.execute(createTableSql('banners'));

    console.log('Creating aligned \`banners_draft\` table...');
    await conn.execute(createTableSql('banners_draft'));

    // Re-insert existing banners if we have them and they match the format
    if (existingBanners.length > 0) {
      console.log(`Attempting to restore ${existingBanners.length} banners...`);
      for (const row of existingBanners) {
        try {
          const fields = Object.keys(row).filter(k => k !== 'created_at' && k !== 'updated_at' && k !== 'displayOrder' && k !== 'title' && k !== 'subtitle' && k !== 'image_mobile' && k !== 'link');
          if (fields.length > 0) {
            const placeholders = fields.map(() => '?').join(', ');
            const values = fields.map(f => row[f]);
            await conn.execute(`INSERT INTO \`banners\` (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${placeholders})`, values);
          }
        } catch (insertErr) {
          console.warn('Failed to restore some rows:', insertErr.message);
        }
      }
    }

    if (existingDrafts.length > 0) {
      console.log(`Attempting to restore ${existingDrafts.length} drafts...`);
      for (const row of existingDrafts) {
        try {
          const fields = Object.keys(row).filter(k => k !== 'created_at' && k !== 'updated_at');
          if (fields.length > 0) {
            const placeholders = fields.map(() => '?').join(', ');
            const values = fields.map(f => row[f]);
            await conn.execute(`INSERT INTO \`banners_draft\` (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${placeholders})`, values);
          }
        } catch (insertErr) {
          console.warn('Failed to restore some draft rows:', insertErr.message);
        }
      }
    }

    console.log('Successfully aligned database tables!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await conn.end();
  }
}

run().catch(console.error);
