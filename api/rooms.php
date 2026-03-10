<?php
/**
 * SIAS Online — Rooms CRUD.
 *
 * GET    /api/rooms.php          → list all
 * POST   /api/rooms.php          → create
 * PUT    /api/rooms.php?id=N     → update
 * DELETE /api/rooms.php?id=N     → delete
 */
require_once __DIR__ . '/database.php';

$db     = getDb();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        requireAuth();
        $rows = $db->query('SELECT * FROM rooms ORDER BY building, name')->fetchAll();
        jsonResponse($rows);
        break;

    case 'POST':
        requireRole('admin');
        $body     = jsonBody();
        $name     = requiredString($body, 'name');
        $building = trim($body['building'] ?? '');
        $capacity = (int)($body['capacity'] ?? 0);

        $stmt = $db->prepare('INSERT INTO rooms (name, building, capacity) VALUES (:name, :bldg, :cap)');
        try {
            $stmt->execute([':name' => $name, ':bldg' => $building, ':cap' => $capacity]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Room name already exists', 409);
            }
            throw $e;
        }
        jsonResponse(['id' => (int)$db->lastInsertId(), 'name' => $name, 'building' => $building, 'capacity' => $capacity], 201);
        break;

    case 'PUT':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $body     = jsonBody();
        $name     = requiredString($body, 'name');
        $building = trim($body['building'] ?? '');
        $capacity = (int)($body['capacity'] ?? 0);

        $stmt = $db->prepare('UPDATE rooms SET name = :name, building = :bldg, capacity = :cap WHERE id = :id');
        try {
            $stmt->execute([':name' => $name, ':bldg' => $building, ':cap' => $capacity, ':id' => $id]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Room name already exists', 409);
            }
            throw $e;
        }
        if ($stmt->rowCount() === 0) jsonError('Room not found', 404);
        jsonResponse(['id' => $id, 'name' => $name, 'building' => $building, 'capacity' => $capacity]);
        break;

    case 'DELETE':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $stmt = $db->prepare('DELETE FROM rooms WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) jsonError('Room not found', 404);
        jsonResponse(['message' => 'Deleted']);
        break;

    default:
        jsonError('Method not allowed', 405);
}
