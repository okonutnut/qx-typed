<?php
/**
 * SIAS Online — Authentication endpoint.
 *
 * POST /api/auth.php              → login
 * POST /api/auth.php?action=logout → logout
 * GET  /api/auth.php              → current session user
 */
require_once __DIR__ . '/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Return current user or null
        jsonResponse(['user' => $_SESSION['user'] ?? null]);
        break;

    case 'POST':
        $action = $_GET['action'] ?? 'login';

        if ($action === 'logout') {
            $_SESSION = [];
            session_destroy();
            jsonResponse(['message' => 'Logged out']);
        }

        // ── Login ────────────────────────────────────────────
        $body     = jsonBody();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        if ($username === '' || $password === '') {
            jsonError('Username and password are required');
        }

        $db   = getDb();
        $stmt = $db->prepare('SELECT id, username, password_hash, full_name, role FROM users WHERE username = :u');
        $stmt->execute([':u' => $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonError('Invalid username or password', 401);
        }

        $sessionUser = [
            'id'        => (int)$user['id'],
            'username'  => $user['username'],
            'full_name' => $user['full_name'],
            'role'      => $user['role'],
        ];

        $_SESSION['user'] = $sessionUser;
        jsonResponse(['user' => $sessionUser]);
        break;

    default:
        jsonError('Method not allowed', 405);
}
