<?php
/**
 * Category Management REST API
 * Supports CRUD operations, validates input, handles database schema check & updates, and logs errors with stack traces.
 */

// Enable Error Reporting & Logging via configuration
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Set headers for JSON response and CORS compliance
set_api_headers();

try {
    $pdo = get_db_connection();
    if (!$pdo) {
        throw new Exception("Unable to establish a MySQL database connection.");
    }

    // Automatically verify and update/create the table schema
    ensure_categories_schema($pdo);

    // Route based on HTTP request method
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            handle_get($pdo);
            break;
        case 'POST':
            handle_post($pdo);
            break;
        case 'PATCH':
        case 'PUT':
            handle_patch($pdo);
            break;
        case 'DELETE':
            handle_delete($pdo);
            break;
        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
            break;
    }

} catch (Exception $e) {
    log_db_error("Fatal Category API exception: " . $e->getMessage(), $e);
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Internal Server Error",
        "detail" => $e->getMessage()
    ]);
}

/**
 * Validates and ensures the 'categories' table has the exact columns required.
 */
function ensure_categories_schema($pdo) {
    try {
        // 1. Create table if not exists with essential columns
        $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            image_url TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Ensure unique constraint on slug is added safely if possible (avoid failures if already existing)
        try {
            $pdo->exec("ALTER TABLE categories ADD UNIQUE INDEX idx_category_slug (slug)");
        } catch (PDOException $ex) {
            // Index already exists, ignore
        }

        // 2. Fetch current columns to identify missing ones
        $stmt = $pdo->query("SHOW COLUMNS FROM categories");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Map of modern rich features columns
        $columns_to_add = [
            'description'       => 'TEXT NULL',
            'icon_image'        => 'TEXT NULL',
            'banner_image'      => 'TEXT NULL',
            'banner_name'       => 'VARCHAR(255) NULL',
            'wide_banner_image' => 'TEXT NULL',
            'button_text'       => 'VARCHAR(255) NULL',
            'button_link'       => 'VARCHAR(255) NULL',
            'featured_products' => 'JSON NULL',
            'meta_title'        => 'VARCHAR(255) NULL',
            'meta_description'  => 'TEXT NULL',
            'keywords'          => 'TEXT NULL',
            'banner_images'     => 'JSON NULL',
            'slider_settings'   => 'JSON NULL',
            'display_order'     => 'INT DEFAULT 1',
            'status'            => "VARCHAR(50) DEFAULT 'ACTIVE'",
            'show_on_homepage'  => 'BOOLEAN DEFAULT TRUE'
        ];

        foreach ($columns_to_add as $col => $definition) {
            if (!in_array($col, $columns)) {
                $pdo->exec("ALTER TABLE categories ADD COLUMN `$col` $definition");
                log_db_error("Upgraded categories schema: added column `$col` successfully.");
            }
        }
    } catch (PDOException $e) {
        log_db_error("Schema verification/upgrade failed: " . $e->getMessage(), $e);
        throw new Exception("Database schema error while checking categories: " . $e->getMessage());
    }
}

/**
 * GET Handler - Retrieves all active categories or all categories for admin panel.
 */
function handle_get($pdo) {
    // Fetch all categories so both admin and client list properly and client-side can filter active ones
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY display_order ASC, created_at DESC");
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format output types properly (e.g. JSON strings to arrays, boolean values)
    $formatted = array_map(function($c) {
        return [
            "id" => $c['id'],
            "name" => $c['name'],
            "slug" => $c['slug'],
            "description" => $c['description'] ?? '',
            "image_url" => $c['image_url'] ?? '',
            "image" => $c['image_url'] ?? '', // alias for frontend compatibility
            "iconImage" => $c['icon_image'] ?? '',
            "bannerImage" => $c['banner_image'] ?? '',
            "bannerName" => $c['banner_name'] ?? '',
            "wideBannerImage" => $c['wide_banner_image'] ?? '',
            "buttonText" => $c['button_text'] ?? '',
            "buttonLink" => $c['button_link'] ?? '',
            "featuredProducts" => isset($c['featured_products']) && $c['featured_products'] ? json_decode($c['featured_products'], true) : [],
            "metaTitle" => $c['meta_title'] ?? '',
            "metaDescription" => $c['meta_description'] ?? '',
            "keywords" => $c['keywords'] ?? '',
            "bannerImages" => isset($c['banner_images']) && $c['banner_images'] ? json_decode($c['banner_images'], true) : [],
            "sliderSettings" => isset($c['slider_settings']) && $c['slider_settings'] ? json_decode($c['slider_settings'], true) : null,
            "displayOrder" => (int)($c['display_order'] ?? 1),
            "status" => $c['status'] ?? 'ACTIVE',
            "showOnHomepage" => (bool)($c['show_on_homepage'] ?? true),
            "is_active" => (bool)($c['is_active'] ?? true),
            "created_at" => $c['created_at']
        ];
    }, $categories);

    echo json_encode($formatted);
}

/**
 * POST Handler - Inserts a new category with robust validation.
 */
function handle_post($pdo) {
    // Read input stream
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
        return;
    }

    // Required fields validation
    if (empty($data['name'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Category Name is required."]);
        return;
    }

    // Auto-generate ID if not provided
    $id = !empty($data['id']) ? $data['id'] : uniqid('cat_');
    $name = trim($data['name']);
    
    // Auto-generate unique slug if not provided
    $slug = !empty($data['slug']) ? trim($data['slug']) : strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $name));
    
    // Extract rich options
    $description = $data['description'] ?? null;
    $imageUrl = $data['imageUrl'] ?? $data['image_url'] ?? $data['image'] ?? null;
    $iconImage = $data['iconImage'] ?? $imageUrl;
    $bannerImage = $data['bannerImage'] ?? null;
    $bannerName = $data['bannerName'] ?? null;
    $wideBannerImage = $data['wideBannerImage'] ?? null;
    $buttonText = $data['buttonText'] ?? null;
    $buttonLink = $data['buttonLink'] ?? null;
    $featuredProducts = isset($data['featuredProducts']) ? json_encode($data['featuredProducts']) : null;
    $metaTitle = $data['metaTitle'] ?? null;
    $metaDescription = $data['metaDescription'] ?? null;
    $keywords = $data['keywords'] ?? null;
    $bannerImages = isset($data['bannerImages']) ? json_encode($data['bannerImages']) : null;
    $sliderSettings = isset($data['sliderSettings']) ? json_encode($data['sliderSettings']) : null;
    $displayOrder = isset($data['displayOrder']) ? (int)$data['displayOrder'] : 1;
    $status = $data['status'] ?? 'ACTIVE';
    $showOnHomepage = isset($data['showOnHomepage']) ? (int)(bool)$data['showOnHomepage'] : 1;
    $isActive = isset($data['isActive']) ? (int)(bool)$data['isActive'] : 1;

    // Verify slug uniqueness
    $checkStmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ?");
    $checkStmt->execute([$slug]);
    if ($checkStmt->fetch()) {
        // Appending unique suffix if slug conflicts
        $slug = $slug . '-' . rand(100, 999);
    }

    // Verify the table existence and columns before inserting
    try {
        $tableCheck = $pdo->query("SHOW TABLES LIKE 'categories'")->fetchAll();
        if (empty($tableCheck)) {
            // Table is missing! Try to auto-create
            log_db_error("categories table does not exist in database '" . DB_NAME . "', trying to auto-create.");
            ensure_categories_schema($pdo);
            
            // Re-check
            $tableCheck = $pdo->query("SHOW TABLES LIKE 'categories'")->fetchAll();
            if (empty($tableCheck)) {
                throw new PDOException("Table 'categories' is missing and auto-creation failed in database '" . DB_NAME . "'.");
            }
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database Structure Error: " . $e->getMessage(),
            "details" => [
                "database_name" => DB_NAME,
                "table_name" => "categories",
                "reason" => "Table verification or schema creation failed."
            ]
        ]);
        return;
    }

    try {
        $sql = "INSERT INTO categories (
                    id, name, slug, description, image_url, icon_image, banner_image, 
                    banner_name, wide_banner_image, button_text, button_link, featured_products, 
                    meta_title, meta_description, keywords, banner_images, slider_settings, 
                    display_order, status, show_on_homepage, is_active
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?, ?, 
                    ?, ?, ?, ?
                )";

        $stmt = $pdo->prepare($sql);
        $executed = $stmt->execute([
            $id, $name, $slug, $description, $imageUrl, $iconImage, $bannerImage,
            $bannerName, $wideBannerImage, $buttonText, $buttonLink, $featuredProducts,
            $metaTitle, $metaDescription, $keywords, $bannerImages, $sliderSettings,
            $displayOrder, $status, $showOnHomepage, $isActive
        ]);

        if (!$executed) {
            throw new PDOException("PDO Statement execute returned false without throwing exception.");
        }

        // --- IMMEDIATE PERSISTENCE VERIFICATION ---
        $verifyStmt = $pdo->prepare("SELECT id, name, slug FROM categories WHERE id = ?");
        $verifyStmt->execute([$id]);
        $verifiedRow = $verifyStmt->fetch();

        if (!$verifiedRow) {
            throw new PDOException("Transaction failure or silent write loss. The newly inserted category with ID '{$id}' was NOT found in table 'categories' of database '" . DB_NAME . "' immediately after insertion.");
        }

        if (trim($verifiedRow['name']) !== $name) {
            throw new PDOException("Data integrity mismatch. Inserted name '{$name}' but verified name is '{$verifiedRow['name']}'.");
        }

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Category was successfully saved and verified in Hostinger MySQL Database!",
            "database_details" => [
                "database_name" => DB_NAME,
                "table_name" => "categories",
                "verified_row" => $verifiedRow,
                "connection_status" => "Active and Persistent"
            ],
            "id" => $id,
            "slug" => $slug
        ]);

    } catch (PDOException $e) {
        log_db_error("Failed to insert category to MySQL: " . $e->getMessage(), $e);
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database INSERT or Verification failure! No record was saved.",
            "details" => [
                "database_name" => DB_NAME,
                "table_name" => "categories",
                "mysql_error" => $e->getMessage()
            ]
        ]);
    }
}

/**
 * PATCH/PUT Handler - Updates an existing category.
 */
function handle_patch($pdo) {
    // Get ID from query parameters
    $id = $_GET['id'] ?? null;
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
        return;
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Category ID parameter is required for updates."]);
        return;
    }

    // Verify category exists
    $checkStmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Category not found."]);
        return;
    }

    // Build dynamic UPDATE SQL based on provided keys
    $fields = [];
    $params = [];

    // Map payload key to DB column name
    $mapping = [
        'name'             => 'name',
        'slug'             => 'slug',
        'description'      => 'description',
        'imageUrl'         => 'image_url',
        'image_url'        => 'image_url',
        'image'            => 'image_url',
        'iconImage'        => 'icon_image',
        'bannerImage'      => 'banner_image',
        'bannerName'       => 'banner_name',
        'wideBannerImage'  => 'wide_banner_image',
        'buttonText'       => 'button_text',
        'buttonLink'       => 'button_link',
        'featuredProducts' => 'featured_products',
        'metaTitle'        => 'meta_title',
        'metaDescription'  => 'meta_description',
        'keywords'         => 'keywords',
        'bannerImages'     => 'banner_images',
        'sliderSettings'   => 'slider_settings',
        'displayOrder'     => 'display_order',
        'status'           => 'status',
        'showOnHomepage'   => 'show_on_homepage',
        'isActive'         => 'is_active',
        'is_active'        => 'is_active'
    ];

    foreach ($mapping as $payloadKey => $dbCol) {
        if (array_key_exists($payloadKey, $data)) {
            // Encode arrays/objects into JSON strings for MySQL
            $val = $data[$payloadKey];
            if (is_array($val)) {
                $val = json_encode($val);
            } elseif (is_bool($val)) {
                $val = $val ? 1 : 0;
            }
            
            // To prevent duplicate columns in query if multiple matching keys exist (e.g. image, imageUrl, image_url)
            if (!in_array($dbCol, array_keys($fields))) {
                $fields[$dbCol] = "?";
                $params[] = $val;
            }
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No valid fields provided to update."]);
        return;
    }

    // Build the query
    $setString = "";
    foreach ($fields as $col => $placeholder) {
        $setString .= "`$col` = $placeholder, ";
    }
    $setString = rtrim($setString, ", ");

    $sql = "UPDATE categories SET $setString WHERE id = ?";
    $params[] = $id;

    try {
        $stmt = $pdo->prepare($sql);
        $executed = $stmt->execute($params);

        if (!$executed) {
            throw new PDOException("PDO Statement execute returned false on update.");
        }

        // --- IMMEDIATE PERSISTENCE VERIFICATION ---
        $verifyStmt = $pdo->prepare("SELECT id, name, slug, status, image_url FROM categories WHERE id = ?");
        $verifyStmt->execute([$id]);
        $verifiedRow = $verifyStmt->fetch();

        if (!$verifiedRow) {
            throw new PDOException("Category record was deleted or lost immediately after update. Verification failed on table 'categories' in database '" . DB_NAME . "'.");
        }

        echo json_encode([
            "status" => "success",
            "message" => "Category updated and verified successfully in Hostinger MySQL Database!",
            "database_details" => [
                "database_name" => DB_NAME,
                "table_name" => "categories",
                "verified_row" => $verifiedRow,
                "connection_status" => "Active and Persistent"
            ]
        ]);
    } catch (PDOException $e) {
        log_db_error("Failed to update category: " . $e->getMessage(), $e);
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database UPDATE or Verification failure! No changes saved.",
            "details" => [
                "database_name" => DB_NAME,
                "table_name" => "categories",
                "mysql_error" => $e->getMessage()
            ]
        ]);
    }
}

/**
 * DELETE Handler - Removes a category from the database.
 */
function handle_delete($pdo) {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Category ID parameter is required for deletion."]);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "status" => "success",
                "message" => "Category deleted successfully."
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Category not found."
            ]);
        }
    } catch (PDOException $e) {
        log_db_error("Failed to delete category: " . $e->getMessage(), $e);
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database DELETE operation failed: " . $e->getMessage()
        ]);
    }
}
