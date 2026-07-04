<?php
/**
 * PHP Backend Configuration File
 * Contains database credentials and environment configurations.
 */

// Prevent direct file access
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    header("HTTP/1.1 403 Forbidden");
    exit("Access Denied");
}

// -------------------------------------------------------------------------
// Environment Setup
// -------------------------------------------------------------------------
define('ENV', 'production'); // 'development' or 'production'

// Timezone
date_default_timezone_set('UTC');

// -------------------------------------------------------------------------
// Database Credentials (Hostinger MySQL)
// -------------------------------------------------------------------------
define('DB_HOST', 'auth-db2141.hstgr.io');
define('DB_PORT', 3306);
define('DB_NAME', 'u103041740_tazumartbd');
define('DB_USER', 'u103041740_tazumart');
define('DB_PASS', 'YOU@suf60679');
define('DB_CHARSET', 'utf8mb4');

// -------------------------------------------------------------------------
// Error Logging Configuration
// -------------------------------------------------------------------------
define('LOG_DIR', __DIR__ . '/logs');
define('ERROR_LOG_FILE', LOG_DIR . '/error.log');

// Ensure error logging is enabled
ini_set('log_errors', 1);
ini_set('error_log', ERROR_LOG_FILE);

if (ENV === 'development') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0); // Suppress user-facing error reporting in production
}

// -------------------------------------------------------------------------
// CORS & Security Headers
// -------------------------------------------------------------------------
function set_api_headers() {
    // Allow specific origin or default to all for APIs (configure as needed for security)
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("X-XSS-Protection: 1; mode=block");

    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}
