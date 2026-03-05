<?php
/**
 * SIAS Online — Semesters CRUD + set-active.
 *
 * GET    /api/semesters.php            → list all
 * GET    /api/semesters.php?active=1   → get active semester
 * POST   /api/semesters.php            → create
 * PUT    /api/semesters.php?id=N       → update
 * PUT    /api/semesters.php?id=N&activate=1 → set as active
 * DELETE /api/semesters.php?id=N       → delete
 */
require_once __DIR__ . '/database.php';

$db     = getDb();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (!empty($_GET['active'])) {
            $row = $db->query('SELECT * FROM semesters WHERE is_active = 1 LIMIT 1')->fetch();
            jsonResponse($row ?: null);
        }
        $rows = $db->query('SELECT * FROM semesters ORDER BY school_year DESC, name')->fetchAll();
        jsonResponse($rows);
        break;

    case 'POST':
        requireRole('admin');
        $body       = jsonBody();
        $name       = requiredString($body, 'name');
        $schoolYear = requiredString($body, 'school_year');

        $stmt = $db->prepare('INSERT INTO semesters (name, school_year) VALUES (:name, :sy)');
        try {
            $stmt->execute([':name' => $name, ':sy' => $schoolYear]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Semester already exists for this school year', 409);
            }
            throw $e;
        }
        jsonResponse(['id' => (int)$db->lastInsertId(), 'name' => $name, 'school_year' => $schoolYear, 'is_active' => 0], 201);
        break;

    case 'PUT':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        // Activate mode
        if (!empty($_GET['activate'])) {
            $db->exec('UPDATE semesters SET is_active = 0');
            $stmt = $db->prepare('UPDATE semesters SET is_active = 1 WHERE id = :id');
            $stmt->execute([':id' => $id]);
            if ($stmt->rowCount() === 0) jsonError('Semester not found', 404);
            jsonResponse(['message' => 'Semester activated']);
        }

        // Normal update
        $body       = jsonBody();
        $name       = requiredString($body, 'name');
        $schoolYear = requiredString($body, 'school_year');

        $stmt = $db->prepare('UPDATE semesters SET name = :name, school_year = :sy WHERE id = :id');
        try {
            $stmt->execute([':name' => $name, ':sy' => $schoolYear, ':id' => $id]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Semester already exists for this school year', 409);
            }
            throw $e;
        }
        if ($stmt->rowCount() === 0) jsonError('Semester not found', 404);
        jsonResponse(['id' => $id, 'name' => $name, 'school_year' => $schoolYear]);
        break;

    case 'DELETE':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $stmt = $db->prepare('DELETE FROM semesters WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) jsonError('Semester not found', 404);
        jsonResponse(['message' => 'Deleted']);
        break;

    default:
        jsonError('Method not allowed', 405);
}
