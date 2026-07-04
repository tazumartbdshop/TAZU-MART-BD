<?php
/**
 * Database Connection Utility
 * Sets up a secure PDO instance for MySQL connection with robust logging.
 */

// Include configuration parameters
require_once __DIR__ . '/config.php';

// Ensure logs directory exists and is secured
if (!file_exists(LOG_DIR)) {
    mkdir(LOG_DIR, 0755, true);
}

// Create a helper to log custom database events/errors
function log_db_error($message, $exception = null) {
    $timestamp = date('[Y-m-d H:i:s]');
    $logMessage = "$timestamp [DATABASE ERROR] $message" . PHP_EOL;
    if ($exception instanceof Exception) {
        $logMessage .= "Trace: " . $exception->getTraceAsString() . PHP_EOL;
    }
    // Append to error log file
    error_log($logMessage, 3, ERROR_LOG_FILE);
}

/**
 * Returns a secure PDO database instance.
 *
 * @return PDO|null
 */
function get_db_connection() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = sprintf(
        "mysql:host=%s;port=%d;dbname=%s;charset=%s",
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_CHARSET
    );

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exceptions on SQL errors
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch associative arrays
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Use real prepared statements
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"     // Force UTF-8 encoding
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // Log the exact error internally
        log_db_error("Connection failed: " . $e->getMessage(), $e);
        
        // Return a verbose, informative error response to the client
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database Connection Failed!",
            "details" => [
                "host" => DB_HOST,
                "port" => DB_PORT,
                "database_name" => DB_NAME,
                "username" => DB_USER,
                "mysql_error" => $e->getMessage()
            ]
        ]);
        exit();
    }
}
