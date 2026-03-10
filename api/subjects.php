<?php
/**
 * SIAS Online — Subjects CRUD.
 *
 * GET    /api/subjects.php          → list all
 * GET    /api/subjects.php?id=N     → single
 * POST   /api/subjects.php          → create
 * PUT    /api/subjects.php?id=N     → update
 * DELETE /api/subjects.php?id=N     → delete
 */
require_once __DIR__ . '/database.php';

$db     = getDb();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        requireAuth();
        $id = $_GET['id'] ?? null;
        if ($id !== null) {
            $stmt = $db->prepare('SELECT * FROM subjects WHERE id = :id');
            $stmt->execute([':id' => (int)$id]);
            $row = $stmt->fetch();
            $row ? jsonResponse($row) : jsonError('Subject not found', 404);
        }
        $rows = $db->query('SELECT * FROM subjects ORDER BY code')->fetchAll();
        jsonResponse($rows);
        break;

    case 'POST':
        requireRole('admin');
        $body = jsonBody();
        $code = requiredString($body, 'code');
        $name = requiredString($body, 'name');
        $units = (int)($body['units'] ?? 3);
        $desc  = trim($body['description'] ?? '');

        $stmt = $db->prepare('INSERT INTO subjects (code, name, units, description) VALUES (:code, :name, :units, :desc)');
        try {
            $stmt->execute([':code' => $code, ':name' => $name, ':units' => $units, ':desc' => $desc]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Subject code already exists', 409);
            }
            throw $e;
        }
        jsonResponse(['id' => (int)$db->lastInsertId(), 'code' => $code, 'name' => $name, 'units' => $units, 'description' => $desc], 201);
        break;

    case 'PUT':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $body = jsonBody();
        $code = requiredString($body, 'code');
        $name = requiredString($body, 'name');
        $units = (int)($body['units'] ?? 3);
        $desc  = trim($body['description'] ?? '');

        $stmt = $db->prepare('UPDATE subjects SET code = :code, name = :name, units = :units, description = :desc WHERE id = :id');
        try {
            $stmt->execute([':code' => $code, ':name' => $name, ':units' => $units, ':desc' => $desc, ':id' => $id]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Subject code already exists', 409);
            }
            throw $e;
        }
        if ($stmt->rowCount() === 0) jsonError('Subject not found', 404);
        jsonResponse(['id' => $id, 'code' => $code, 'name' => $name, 'units' => $units, 'description' => $desc]);
        break;

    case 'DELETE':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $stmt = $db->prepare('DELETE FROM subjects WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) jsonError('Subject not found', 404);
        jsonResponse(['message' => 'Deleted']);
        break;

    default:
        jsonError('Method not allowed', 405);
}
