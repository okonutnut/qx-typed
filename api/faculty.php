<?php
/**
 * SIAS Online — Faculty CRUD.
 *
 * GET    /api/faculty.php          → list all
 * GET    /api/faculty.php?id=N     → single
 * POST   /api/faculty.php          → create
 * PUT    /api/faculty.php?id=N     → update
 * DELETE /api/faculty.php?id=N     → delete
 */
require_once __DIR__ . '/database.php';

$db     = getDb();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        requireAuth();
        $id = $_GET['id'] ?? null;
        if ($id !== null) {
            $stmt = $db->prepare('SELECT * FROM faculty WHERE id = :id');
            $stmt->execute([':id' => (int)$id]);
            $row = $stmt->fetch();
            $row ? jsonResponse($row) : jsonError('Faculty not found', 404);
        }
        $rows = $db->query('SELECT * FROM faculty ORDER BY full_name')->fetchAll();
        jsonResponse($rows);
        break;

    case 'POST':
        requireRole('admin');
        $body          = jsonBody();
        $employeeId    = requiredString($body, 'employee_id');
        $fullName      = requiredString($body, 'full_name');
        $department    = trim($body['department'] ?? '');
        $specialization = trim($body['specialization'] ?? '');
        $userId        = !empty($body['user_id']) ? (int)$body['user_id'] : null;

        $stmt = $db->prepare(
            'INSERT INTO faculty (user_id, employee_id, full_name, department, specialization)
             VALUES (:uid, :eid, :name, :dept, :spec)'
        );
        try {
            $stmt->execute([
                ':uid'  => $userId,
                ':eid'  => $employeeId,
                ':name' => $fullName,
                ':dept' => $department,
                ':spec' => $specialization,
            ]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Employee ID already exists', 409);
            }
            throw $e;
        }

        jsonResponse([
            'id'             => (int)$db->lastInsertId(),
            'employee_id'    => $employeeId,
            'full_name'      => $fullName,
            'department'     => $department,
            'specialization' => $specialization,
        ], 201);
        break;

    case 'PUT':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $body          = jsonBody();
        $employeeId    = requiredString($body, 'employee_id');
        $fullName      = requiredString($body, 'full_name');
        $department    = trim($body['department'] ?? '');
        $specialization = trim($body['specialization'] ?? '');

        $stmt = $db->prepare(
            'UPDATE faculty SET employee_id = :eid, full_name = :name, department = :dept, specialization = :spec WHERE id = :id'
        );
        try {
            $stmt->execute([
                ':eid'  => $employeeId,
                ':name' => $fullName,
                ':dept' => $department,
                ':spec' => $specialization,
                ':id'   => $id,
            ]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Employee ID already exists', 409);
            }
            throw $e;
        }
        if ($stmt->rowCount() === 0) jsonError('Faculty not found', 404);

        jsonResponse([
            'id'             => $id,
            'employee_id'    => $employeeId,
            'full_name'      => $fullName,
            'department'     => $department,
            'specialization' => $specialization,
        ]);
        break;

    case 'DELETE':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $stmt = $db->prepare('DELETE FROM faculty WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) jsonError('Faculty not found', 404);
        jsonResponse(['message' => 'Deleted']);
        break;

    default:
        jsonError('Method not allowed', 405);
}
