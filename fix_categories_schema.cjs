const mysql = require('mysql2/promise');

async function fix() {
  const config = {
    host: 'auth-db2141.hstgr.io',
    user: 'u103041740_tazumartbd',
    password: 'YOU@suf60679',
    database: 'u103041740_TAZU_MART_BD',
  };

  const conn = await mysql.createConnection(config);
  console.log('Connected to MySQL...');

  const renames = [
    ['bannerName', 'banner_name', 'VARCHAR(255)'],
    ['bannerImage', 'banner_image', 'LONGTEXT'],
    ['bannerImages', 'banner_images', 'LONGTEXT'],
    ['iconImage', 'icon_image', 'LONGTEXT'],
    ['wideBannerImage', 'wide_banner_image', 'LONGTEXT'],
    ['buttonText', 'button_text', 'VARCHAR(255)'],
    ['buttonLink', 'button_link', 'VARCHAR(500)'],
    ['featuredProducts', 'featured_products', 'LONGTEXT'],
    ['displayOrder', 'display_order', 'INT'],
    ['showOnHomepage', 'show_on_homepage', 'TINYINT'],
    ['createdAt', 'created_at', 'BIGINT'],
    ['metaTitle', 'meta_title', 'VARCHAR(255)'],
    ['metaDescription', 'meta_description', 'LONGTEXT'],
    ['isDemo', 'is_demo', 'TINYINT'],
    ['sliderSettings', 'slider_settings', 'LONGTEXT']
  ];

  for (const [oldName, newName, type] of renames) {
    try {
      await conn.execute(`ALTER TABLE \`categories\` CHANGE \`${oldName}\` \`${newName}\` ${type}`);
      console.log(`Renamed ${oldName} to ${newName}`);
    } catch (err) {
      console.error(`Error renaming ${oldName}:`, err.message);
    }
  }

  await conn.end();
  console.log('Schema fix complete.');
}

fix().catch(console.error);
