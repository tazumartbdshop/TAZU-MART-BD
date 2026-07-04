import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { db } from "./src/lib/mysql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "tazumart_secret_key";
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

async function getSetting(key: string, defaultValue: any = null) {
  try {
    const [rows]: any = await db.execute("SELECT `value` FROM settings WHERE `key` = ?", [key]);
    if (rows.length > 0) {
      return rows[0].value;
    }
  } catch (e) {}
  return defaultValue;
}

async function setSetting(key: string, value: any) {
  const jsonValue = JSON.stringify(value);
  await db.execute(
    "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
    [key, jsonValue, jsonValue]
  );
}

async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` JSON
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uuid VARCHAR(36) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(20),
        role ENUM('admin', 'customer', 'moderator') DEFAULT 'customer',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        discount_price DECIMAL(10, 2),
        category_id VARCHAR(50),
        stock INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT,
        image_path VARCHAR(255),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        items JSON,
        total DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'Abandoned',
        is_read BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS popup_campaigns (
        id VARCHAR(50) PRIMARY KEY,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        start_date VARCHAR(50),
        start_time VARCHAR(20),
        end_date VARCHAR(50),
        end_time VARCHAR(20),
        campaign_type VARCHAR(20),
        campaign_value VARCHAR(255),
        template_id VARCHAR(20),
        banner_url TEXT,
        title TEXT,
        title_font_size INT,
        discount_label TEXT,
        discount_percentage VARCHAR(20),
        subtitle TEXT,
        subtitle_font_size INT,
        button_text TEXT,
        button_url TEXT,
        button_style VARCHAR(50),
        secondary_button_text TEXT,
        secondary_button_url TEXT,
        selected_products JSON,
        selected_categories JSON,
        display_duration INT,
        display_order INT,
        show_once_per_user BOOLEAN,
        show_every_visit BOOLEAN,
        show_after_3_seconds BOOLEAN,
        show_after_scroll BOOLEAN,
        show_only_homepage BOOLEAN,
        close_button_visible BOOLEAN,
        background_dark_overlay BOOLEAN,
        click_outside_to_close BOOLEAN,
        auto_close_after_x_seconds BOOLEAN,
        entrance_animation VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const cols = [
      { name: 'description', type: 'TEXT' },
      { name: 'icon_image', type: 'TEXT' },
      { name: 'banner_image', type: 'TEXT' },
      { name: 'banner_name', type: 'VARCHAR(255)' },
      { name: 'wide_banner_image', type: 'TEXT' },
      { name: 'button_text', type: 'VARCHAR(255)' },
      { name: 'button_link', type: 'VARCHAR(255)' },
      { name: 'featured_products', type: 'JSON' },
      { name: 'meta_title', type: 'VARCHAR(255)' },
      { name: 'meta_description', type: 'TEXT' },
      { name: 'keywords', type: 'TEXT' },
      { name: 'banner_images', type: 'JSON' },
      { name: 'slider_settings', type: 'JSON' },
      { name: 'display_order', type: 'INT DEFAULT 1' },
      { name: 'status', type: "VARCHAR(50) DEFAULT 'ACTIVE'" },
      { name: 'show_on_homepage', type: 'BOOLEAN DEFAULT TRUE' }
    ];

    for (const col of cols) {
      try {
        await db.execute(`ALTER TABLE categories ADD COLUMN \`${col.name}\` ${col.type}`);
      } catch (err) {
        // Column already exists, ignore error
      }
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255),
        subtitle TEXT,
        image_url TEXT,
        link VARCHAR(255),
        \`order\` INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(50) PRIMARY KEY,
        product_id INT,
        user_id INT,
        rating INT,
        comment TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

async function startServer() {
  await initDB();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- Leads Routes ---
  app.get("/api/admin/leads", async (req, res) => {
    try {
      const [rows]: any = await db.execute("SELECT * FROM leads ORDER BY last_updated DESC");
      const formattedLeads = rows.map((l: any) => ({
        ...l,
        items: typeof l.items === 'string' ? JSON.parse(l.items) : (l.items || [])
      }));
      res.json(formattedLeads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/leads/upsert", async (req, res) => {
    try {
      const { id, name, phone, email, address, items, total, status, is_read } = req.body;
      const itemsJson = JSON.stringify(items || []);
      
      await db.execute(
        `INSERT INTO leads (id, name, phone, email, address, items, total, status, is_read) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         name = VALUES(name), phone = VALUES(phone), email = VALUES(email), 
         address = VALUES(address), items = VALUES(items), total = VALUES(total), 
         status = VALUES(status), is_read = VALUES(is_read)`,
        [id, name, phone, email, address, itemsJson, total, status || 'Abandoned', is_read || false]
      );
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/leads/:id", async (req, res) => {
    try {
      await db.execute("DELETE FROM leads WHERE id = ?", [req.params.id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/leads", async (req, res) => {
    try {
      await db.execute("DELETE FROM leads");
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/leads/:id/read", async (req, res) => {
    try {
      await db.execute("UPDATE leads SET is_read = TRUE WHERE id = ?", [req.params.id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/leads/read-all", async (req, res) => {
    try {
      await db.execute("UPDATE leads SET is_read = TRUE");
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Popup Routes ---
  app.get("/api/admin/popups", async (req, res) => {
    try {
      const [rows]: any = await db.execute("SELECT * FROM popup_campaigns ORDER BY display_order ASC");
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/popups/upsert", async (req, res) => {
    try {
      const p = req.body;
      const selectedProducts = JSON.stringify(p.selectedProducts || []);
      const selectedCategories = JSON.stringify(p.selectedCategories || []);
      
      await db.execute(
        `INSERT INTO popup_campaigns (
          id, status, start_date, start_time, end_date, end_time, 
          campaign_type, campaign_value, template_id, banner_url, 
          title, title_font_size, discount_label, discount_percentage, 
          subtitle, subtitle_font_size, button_text, button_url, button_style, 
          secondary_button_text, secondary_button_url, selected_products, selected_categories, 
          display_duration, display_order, show_once_per_user, show_every_visit, 
          show_after_3_seconds, show_after_scroll, show_only_homepage, 
          close_button_visible, background_dark_overlay, click_outside_to_close, 
          auto_close_after_x_seconds, entrance_animation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        status=VALUES(status), start_date=VALUES(start_date), start_time=VALUES(start_time), 
        end_date=VALUES(end_date), end_time=VALUES(end_time), campaign_type=VALUES(campaign_type), 
        campaign_value=VALUES(campaign_value), template_id=VALUES(template_id), 
        banner_url=VALUES(banner_url), title=VALUES(title), title_font_size=VALUES(title_font_size), 
        discount_label=VALUES(discount_label), discount_percentage=VALUES(discount_percentage), 
        subtitle=VALUES(subtitle), subtitle_font_size=VALUES(subtitle_font_size), 
        button_text=VALUES(button_text), button_url=VALUES(button_url), 
        button_style=VALUES(button_style), secondary_button_text=VALUES(secondary_button_text), 
        secondary_button_url=VALUES(secondary_button_url), selected_products=VALUES(selected_products), 
        selected_categories=VALUES(selected_categories), display_duration=VALUES(display_duration), 
        display_order=VALUES(display_order), show_once_per_user=VALUES(show_once_per_user), 
        show_every_visit=VALUES(show_every_visit), show_after_3_seconds=VALUES(show_after_3_seconds), 
        show_after_scroll=VALUES(show_after_scroll), show_only_homepage=VALUES(show_only_homepage), 
        close_button_visible=VALUES(close_button_visible), background_dark_overlay=VALUES(background_dark_overlay), 
        click_outside_to_close=VALUES(click_outside_to_close), 
        auto_close_after_x_seconds=VALUES(auto_close_after_x_seconds), 
        entrance_animation=VALUES(entrance_animation)`,
        [
          p.id, p.status, p.startDate, p.startTime, p.endDate, p.endTime,
          p.campaignType, p.campaignValue, p.templateId, p.bannerUrl,
          p.title, p.titleFontSize, p.discountLabel, p.discountPercentage,
          p.subtitle, p.subtitleFontSize, p.buttonText, p.buttonUrl, p.buttonStyle,
          p.secondaryButtonText, p.secondaryButtonUrl, selectedProducts, selectedCategories,
          p.displayDuration, p.displayOrder, p.showOncePerUser, p.showEveryVisit,
          p.showAfter3Seconds, p.showAfterScroll, p.showOnlyHomepage,
          p.closeButtonVisible, p.backgroundDarkOverlay, p.clickOutsideToClose,
          p.autoCloseAfterXSeconds, p.entranceAnimation
        ]
      );
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/popups/:id", async (req, res) => {
    try {
      await db.execute("DELETE FROM popup_campaigns WHERE id = ?", [req.params.id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/popups/reset", async (req, res) => {
    try {
      await db.execute("DELETE FROM popup_campaigns");
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const uuid = crypto.randomUUID();

      await db.execute(
        "INSERT INTO users (uuid, email, password, name, phone) VALUES (?, ?, ?, ?, ?)",
        [uuid, email, hashedPassword, name, phone]
      );

      res.json({ status: "success", message: "User registered successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const [rows]: any = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
      const user = rows[0];

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, uuid: user.uuid, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ status: "success", token, user: userWithoutPassword });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Product Routes ---
  app.get("/api/products", async (req, res) => {
    try {
      const [products]: any = await db.execute(`
        SELECT p.*, GROUP_CONCAT(pi.image_path) as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.is_active = TRUE
        GROUP BY p.id
      `);
      
      const formattedProducts = products.map((p: any) => ({
        ...p,
        images: p.images ? p.images.split(',') : [],
        metadata: typeof p.metadata === 'string' ? JSON.parse(p.metadata) : p.metadata
      }));

      res.json(formattedProducts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const [rows]: any = await db.execute("SELECT * FROM categories ORDER BY display_order ASC, created_at DESC");
      const formatted = rows.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || '',
        image_url: c.image_url || '',
        image: c.image_url || '', // compatibility
        iconImage: c.icon_image || '',
        bannerImage: c.banner_image || '',
        bannerName: c.banner_name || '',
        wideBannerImage: c.wide_banner_image || '',
        buttonText: c.button_text || '',
        buttonLink: c.button_link || '',
        featuredProducts: typeof c.featured_products === 'string' ? JSON.parse(c.featured_products) : (c.featured_products || []),
        metaTitle: c.meta_title || '',
        metaDescription: c.meta_description || '',
        keywords: c.keywords || '',
        bannerImages: typeof c.banner_images === 'string' ? JSON.parse(c.banner_images) : (c.banner_images || []),
        sliderSettings: typeof c.slider_settings === 'string' ? JSON.parse(c.slider_settings) : (c.slider_settings || null),
        displayOrder: Number(c.display_order) || 1,
        status: c.status || 'ACTIVE',
        showOnHomepage: !!c.show_on_homepage,
        is_active: !!c.is_active,
        created_at: c.created_at
      }));
      res.json(formatted);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/banners", async (req, res) => {
    try {
      const [banners]: any = await db.execute("SELECT * FROM banners WHERE is_active = TRUE");
      res.json(banners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Order Routes ---
  app.post("/api/orders", async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { items, ...orderData } = req.body;
      const orderId = `ORD-${Date.now()}`;

      const [orderResult]: any = await connection.execute(
        `INSERT INTO orders (order_id, user_id, customer_name, email, phone, address, subtotal, delivery_charge, discount, total, payment_method, payment_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, orderData.userId, orderData.name, orderData.email, orderData.phone, orderData.address, orderData.subtotal, orderData.deliveryCharge, orderData.discount, orderData.total, orderData.paymentMethod, orderData.paymentStatus, orderData.notes]
      );

      const dbOrderId = orderResult.insertId;

      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, name, variant, price, quantity, total)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [dbOrderId, item.productId, item.name, item.variant, item.price, item.quantity, item.price * item.quantity]
        );
      }

      await connection.commit();
      res.json({ status: "success", orderId });
    } catch (error: any) {
      await connection.rollback();
      res.status(500).json({ error: error.message });
    } finally {
      connection.release();
    }
  });

  // --- User Order Routes ---
  app.get("/api/user/orders", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "User ID is required" });

      const [orders]: any = await db.execute(`
        SELECT o.*, 
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'productId', oi.product_id,
                   'name', oi.name,
                   'variant', oi.variant,
                   'price', oi.price,
                   'quantity', oi.quantity,
                   'total', oi.total
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [userId]);

      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Cart Routes ---
  app.get("/api/cart", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.json([]);
      const [rows]: any = await db.execute("SELECT * FROM cart WHERE user_id = ?", [userId]);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { userId, productId, quantity, variant } = req.body;
      await db.execute(
        "INSERT INTO cart (user_id, product_id, quantity, variant) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)",
        [userId, productId, quantity, variant]
      );
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await db.execute("DELETE FROM cart WHERE id = ?", [req.params.id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Wishlist Routes ---
  app.get("/api/wishlist", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.json([]);
      const [rows]: any = await db.execute("SELECT * FROM wishlist WHERE user_id = ?", [userId]);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const { userId, productId } = req.body;
      await db.execute("INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)", [userId, productId]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist", async (req, res) => {
    try {
      const { userId, productId } = req.query;
      await db.execute("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [userId, productId]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      await db.execute("DELETE FROM wishlist WHERE id = ?", [req.params.id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/admin/products", async (req, res) => {
    try {
      const { name, sku, category_id, price, discount_price, stock, description, image, images } = req.body;
      const [result]: any = await db.execute(
        "INSERT INTO products (name, sku, category_id, price, discount_price, stock, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, sku, category_id, price, discount_price, stock, description, image]
      );
      const productId = result.insertId;

      if (images && Array.isArray(images)) {
        for (const imgPath of images) {
          await db.execute("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)", [productId, imgPath]);
        }
      }

      res.json({ status: "success", productId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const fields = Object.keys(updates).filter(f => f !== 'images');
      const values = fields.map(f => updates[f]);
      const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');

      if (fields.length > 0) {
        await db.execute(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id]);
      }

      if (updates.images && Array.isArray(updates.images)) {
        await db.execute("DELETE FROM product_images WHERE product_id = ?", [id]);
        for (const imgPath of updates.images) {
          await db.execute("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)", [id, imgPath]);
        }
      }

      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin Category Management ---
  app.post("/api/admin/categories", async (req, res) => {
    try {
      const data = req.body;
      if (!data.name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const id = data.id || `cat_${Date.now()}`;
      const name = data.name.trim();
      const slug = data.slug ? data.slug.trim() : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const description = data.description || null;
      const imageUrl = data.imageUrl || data.image_url || data.image || null;
      const iconImage = data.iconImage || imageUrl;
      const bannerImage = data.bannerImage || null;
      const bannerName = data.bannerName || null;
      const wideBannerImage = data.wideBannerImage || null;
      const buttonText = data.buttonText || null;
      const buttonLink = data.buttonLink || null;
      const featuredProducts = data.featuredProducts ? JSON.stringify(data.featuredProducts) : null;
      const metaTitle = data.metaTitle || null;
      const metaDescription = data.metaDescription || null;
      const keywords = data.keywords || null;
      const bannerImages = data.bannerImages ? JSON.stringify(data.bannerImages) : null;
      const sliderSettings = data.sliderSettings ? JSON.stringify(data.sliderSettings) : null;
      const displayOrder = Number(data.displayOrder) || 1;
      const status = data.status || 'ACTIVE';
      const showOnHomepage = data.showOnHomepage !== false ? 1 : 0;
      const isActive = data.isActive !== false ? 1 : 0;

      await db.execute(
        `INSERT INTO categories (
          id, name, slug, description, image_url, icon_image, banner_image, 
          banner_name, wide_banner_image, button_text, button_link, featured_products, 
          meta_title, meta_description, keywords, banner_images, slider_settings, 
          display_order, status, show_on_homepage, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, name, slug, description, imageUrl, iconImage, bannerImage,
          bannerName, wideBannerImage, buttonText, buttonLink, featuredProducts,
          metaTitle, metaDescription, keywords, bannerImages, sliderSettings,
          displayOrder, status, showOnHomepage, isActive
        ]
      );

      res.json({ status: "success", id, slug });
    } catch (error: any) {
      console.error("Failed to add category:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      // Fetch existing
      const [existingRows]: any = await db.execute("SELECT * FROM categories WHERE id = ?", [id]);
      if (existingRows.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      const fields: string[] = [];
      const values: any[] = [];

      const mapping: { [key: string]: string } = {
        name: 'name',
        slug: 'slug',
        description: 'description',
        imageUrl: 'image_url',
        image_url: 'image_url',
        image: 'image_url',
        iconImage: 'icon_image',
        bannerImage: 'banner_image',
        bannerName: 'banner_name',
        wideBannerImage: 'wide_banner_image',
        buttonText: 'button_text',
        buttonLink: 'button_link',
        featuredProducts: 'featured_products',
        metaTitle: 'meta_title',
        metaDescription: 'meta_description',
        keywords: 'keywords',
        bannerImages: 'banner_images',
        sliderSettings: 'slider_settings',
        displayOrder: 'display_order',
        status: 'status',
        showOnHomepage: 'show_on_homepage',
        isActive: 'is_active',
        is_active: 'is_active'
      };

      const columnsUpdated = new Set<string>();

      for (const [key, dbCol] of Object.entries(mapping)) {
        if (data[key] !== undefined) {
          if (columnsUpdated.has(dbCol)) continue;
          columnsUpdated.add(dbCol);

          fields.push(`\`${dbCol}\` = ?`);
          let val = data[key];
          if (Array.isArray(val) || (val !== null && typeof val === 'object')) {
            val = JSON.stringify(val);
          } else if (typeof val === 'boolean') {
            val = val ? 1 : 0;
          }
          values.push(val);
        }
      }

      if (fields.length === 0) {
        return res.json({ status: "success", message: "No fields to update" });
      }

      values.push(id);
      await db.execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
      res.json({ status: "success" });
    } catch (error: any) {
      console.error("Failed to update category:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      await db.execute("DELETE FROM categories WHERE id = ?", [req.params.id]);
      res.json({ status: "success" });
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin Banner Management ---
  app.post("/api/admin/banners", async (req, res) => {
    try {
      const { image, link, title, subtitle } = req.body;
      await db.execute("INSERT INTO banners (image, link, title, subtitle) VALUES (?, ?, ?, ?)", [image, link, title, subtitle]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Admin Order Management ---
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const [orders]: any = await db.execute(`
        SELECT o.*, 
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'productId', oi.product_id,
                   'name', oi.name,
                   'variant', oi.variant,
                   'price', oi.price,
                   'quantity', oi.quantity,
                   'total', oi.total
                 )
               ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.execute("UPDATE orders SET order_status = ? WHERE id = ?", [status, id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.execute("DELETE FROM order_items WHERE order_id = ?", [id]);
      await db.execute("DELETE FROM orders WHERE id = ?", [id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Review Routes ---
  app.get("/api/reviews", async (req, res) => {
    try {
      const [rows]: any = await db.execute("SELECT * FROM reviews ORDER BY created_at DESC");
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const { productId, userId, customerName, rating, reviewText, mediaUrls, status, verified } = req.body;
      const [result]: any = await db.execute(
        "INSERT INTO reviews (product_id, user_id, customer_name, rating, review_text, media_urls, status, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [productId, userId, customerName, rating, reviewText, JSON.stringify(mediaUrls || []), status || 'pending', verified ?? true]
      );
      res.json({ status: "success", id: result.insertId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/reviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const fields = Object.keys(updates);
      const values = fields.map(f => updates[f]);
      const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');

      await db.execute(`UPDATE reviews SET ${setClause} WHERE id = ?`, [...values, id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/reviews/:id", async (req, res) => {
    try {
      await db.execute("DELETE FROM reviews WHERE id = ?", [req.params.id]);
      res.json({ status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [rows]: any = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "Customer not found" });
      
      const customer = rows[0];
      const [reviewCount]: any = await db.execute("SELECT COUNT(*) as count FROM reviews WHERE user_id = ?", [id]);
      const [lastOrder]: any = await db.execute("SELECT created_at FROM orders WHERE email = ? OR phone = ? ORDER BY created_at DESC LIMIT 1", [customer.email, customer.phone]);
      
      res.json({
        ...customer,
        total_reviews: reviewCount[0].count,
        last_order_date: lastOrder.length > 0 ? lastOrder[0].created_at : null
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Upload Route ---
  app.post("/api/upload", upload.single('image'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ status: "success", filePath: `/uploads/${req.file.filename}` });
  });

  // --- Promo Validation ---
  app.post("/api/promo/validate", async (req, res) => {
    try {
      const { code, subtotal } = req.body;
      const [promos]: any = await db.execute("SELECT * FROM coupons WHERE code = ?", [code]);
      const promo = promos[0];

      if (!promo || promo.status === 'Inactive') {
        return res.json({ isValid: false, message: "Invalid or inactive promo code" });
      }

      if (new Date(promo.expiry_date) < new Date()) {
        return res.json({ isValid: false, message: "Promo code expired" });
      }

      if (subtotal < Number(promo.min_order)) {
        return res.json({ isValid: false, message: `Minimum order of ৳${promo.min_order} required` });
      }

      let discount = 0;
      if (promo.type === 'percentage') discount = (subtotal * Number(promo.value)) / 100;
      else discount = Number(promo.value);

      res.json({ isValid: true, discount, promo });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- AI Chat ---
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, settings } = req.body;
      const geminiKey = settings?.geminiKey || process.env.GEMINI_API_KEY;

      if (!geminiKey) return res.json({ text: "AI is currently offline (API key missing)." });

      const [products]: any = await db.execute("SELECT name, price, category_id FROM products WHERE is_active = TRUE LIMIT 10");
      const productContext = products.map((p: any) => `- ${p.name}: ৳${p.price}`).join("\n");

      const prompt = `You are a helpful assistant for Tazu Mart.
      Available products:
      ${productContext}
      
      User: ${message}
      Assistant:`;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await geminiRes.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
      res.json({ text });
    } catch (error) {
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // --- Admin Routes ---
  app.get("/api/admin/customers", async (req, res) => {
    try {
      const [customers]: any = await db.execute("SELECT id, uuid, email, name, phone, role, status, created_at FROM users WHERE role = 'customer'");
      res.json({ customers });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/create-customer", async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute(
        "INSERT INTO users (uuid, email, password, name, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
        [crypto.randomUUID(), email, hashedPassword, name, phone, 'customer']
      );
      res.json({ status: "success" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/update-customer", async (req, res) => {
    try {
      const { id, updates } = req.body;
      if (!updates || Object.keys(updates).length === 0) return res.json({ status: "success" });
      
      const keys = Object.keys(updates);
      const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
      const values = Object.values(updates);
      
      await db.execute(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
      res.json({ status: "success" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/delete-customer", async (req, res) => {
    try {
      const { id } = req.body;
      await db.execute("DELETE FROM users WHERE id = ?", [id]);
      res.json({ status: "success" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Settings ---
  app.get("/api/settings/:key", async (req, res) => {
    const value = await getSetting(req.params.key);
    res.json(value);
  });

  app.post("/api/settings/:key", async (req, res) => {
    await setSetting(req.params.key, req.body);
    res.json({ status: "success" });
  });

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();
