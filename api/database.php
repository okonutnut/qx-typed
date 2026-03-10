<?php
/**
 * SIAS Online — Shared database connection and helpers.
 *
 * Include this file at the top of every API endpoint:
 *   require_once __DIR__ . '/database.php';
 */

if (PHP_SAPI !== 'cli') {
    // ── CORS / JSON headers ─────────────────────────────────────────
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    // ── Session ──────────────────────────────────────────────────────
    session_start();
}

// ── SQLite connection (singleton) ────────────────────────────────────
function getDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dbPath = __DIR__ . '/sias.db';
    $isNew  = !file_exists($dbPath);

    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA foreign_keys = ON');

    if ($isNew) {
        $schema = file_get_contents(__DIR__ . '/schema.sql');
        $pdo->exec($schema);
    }

    return $pdo;
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Read JSON request body. */
function jsonBody(): array {
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}

/** Send a JSON response and exit. */
function jsonResponse(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Send an error response and exit. */
function jsonError(string $message, int $status = 400): never {
    jsonResponse(['error' => $message], $status);
}

/** Require the user to be authenticated. Returns the session user array. */
function requireAuth(): array {
    if (empty($_SESSION['user'])) {
        jsonError('Unauthorized', 401);
    }
    return $_SESSION['user'];
}

/** Require the user to have one of the specified roles. */
function requireRole(string ...$roles): array {
    $user = requireAuth();
    if (!in_array($user['role'], $roles, true)) {
        jsonError('Forbidden', 403);
    }
    return $user;
}

/** Get a required string parameter from an associative array (or error). */
function requiredString(array $data, string $key): string {
    $value = trim($data[$key] ?? '');
    if ($value === '') {
        jsonError("Missing required field: $key");
    }
    return $value;
}
