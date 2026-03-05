<?php
/**
 * SIAS Online — Schedules CRUD with conflict detection.
 *
 * GET    /api/schedules.php                     → list (supports ?semester_id, ?faculty_id, ?room_id, ?day_of_week filters)
 * POST   /api/schedules.php                     → create (with conflict check)
 * PUT    /api/schedules.php?id=N                → update (with conflict check)
 * DELETE /api/schedules.php?id=N                → delete
 */
require_once __DIR__ . '/database.php';

$db     = getDb();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * Check for overlapping schedules.
 * Returns an array of conflict descriptions, or empty if none.
 */
function checkConflicts(PDO $db, int $semesterId, int $facultyId, int $roomId, string $day, string $startTime, string $endTime, ?int $excludeId = null): array {
    $conflicts = [];

    // Faculty conflict: same faculty, same day, same semester, overlapping time
    $sql = 'SELECT sc.id, s.code AS subject_code, r.name AS room_name
            FROM schedules sc
            JOIN subjects s ON s.id = sc.subject_id
            JOIN rooms r ON r.id = sc.room_id
            WHERE sc.semester_id = :sem AND sc.faculty_id = :fid AND sc.day_of_week = :day
              AND sc.start_time < :end AND sc.end_time > :start';
    if ($excludeId) $sql .= ' AND sc.id != :excl';

    $stmt = $db->prepare($sql);
    $params = [':sem' => $semesterId, ':fid' => $facultyId, ':day' => $day, ':start' => $startTime, ':end' => $endTime];
    if ($excludeId) $params[':excl'] = $excludeId;
    $stmt->execute($params);
    foreach ($stmt->fetchAll() as $row) {
        $conflicts[] = "Faculty conflict: already teaching {$row['subject_code']} in {$row['room_name']} at overlapping time";
    }

    // Room conflict: same room, same day, same semester, overlapping time
    $sql2 = 'SELECT sc.id, s.code AS subject_code, f.full_name AS faculty_name
             FROM schedules sc
             JOIN subjects s ON s.id = sc.subject_id
             JOIN faculty f ON f.id = sc.faculty_id
             WHERE sc.semester_id = :sem AND sc.room_id = :rid AND sc.day_of_week = :day
               AND sc.start_time < :end AND sc.end_time > :start';
    if ($excludeId) $sql2 .= ' AND sc.id != :excl';

    $stmt2 = $db->prepare($sql2);
    $params2 = [':sem' => $semesterId, ':rid' => $roomId, ':day' => $day, ':start' => $startTime, ':end' => $endTime];
    if ($excludeId) $params2[':excl'] = $excludeId;
    $stmt2->execute($params2);
    foreach ($stmt2->fetchAll() as $row) {
        $conflicts[] = "Room conflict: {$row['subject_code']} by {$row['faculty_name']} already scheduled in this room at overlapping time";
    }

    return $conflicts;
}

switch ($method) {
    case 'GET':
        $where  = [];
        $params = [];

        if (!empty($_GET['semester_id'])) {
            $where[]  = 'sc.semester_id = :sem';
            $params[':sem'] = (int)$_GET['semester_id'];
        }
        if (!empty($_GET['faculty_id'])) {
            $where[]  = 'sc.faculty_id = :fid';
            $params[':fid'] = (int)$_GET['faculty_id'];
        }
        if (!empty($_GET['room_id'])) {
            $where[]  = 'sc.room_id = :rid';
            $params[':rid'] = (int)$_GET['room_id'];
        }
        if (!empty($_GET['day_of_week'])) {
            $where[]  = 'sc.day_of_week = :day';
            $params[':day'] = $_GET['day_of_week'];
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT sc.*,
                       s.code AS subject_code, s.name AS subject_name,
                       f.full_name AS faculty_name, f.employee_id,
                       r.name AS room_name, r.building,
                       sem.name AS semester_name, sem.school_year
                FROM schedules sc
                JOIN subjects s ON s.id = sc.subject_id
                JOIN faculty f ON f.id = sc.faculty_id
                JOIN rooms r ON r.id = sc.room_id
                JOIN semesters sem ON sem.id = sc.semester_id
                $whereClause
                ORDER BY sc.day_of_week, sc.start_time";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        requireRole('admin');
        $body        = jsonBody();
        $subjectId   = (int)($body['subject_id'] ?? 0);
        $facultyId   = (int)($body['faculty_id'] ?? 0);
        $roomId      = (int)($body['room_id'] ?? 0);
        $semesterId  = (int)($body['semester_id'] ?? 0);
        $day         = requiredString($body, 'day_of_week');
        $startTime   = requiredString($body, 'start_time');
        $endTime     = requiredString($body, 'end_time');

        if (!$subjectId || !$facultyId || !$roomId || !$semesterId) {
            jsonError('subject_id, faculty_id, room_id, and semester_id are required');
        }
        if ($startTime >= $endTime) {
            jsonError('start_time must be before end_time');
        }

        $conflicts = checkConflicts($db, $semesterId, $facultyId, $roomId, $day, $startTime, $endTime);
        if ($conflicts) {
            jsonResponse(['error' => 'Schedule conflict', 'conflicts' => $conflicts], 409);
        }

        $stmt = $db->prepare(
            'INSERT INTO schedules (subject_id, faculty_id, room_id, semester_id, day_of_week, start_time, end_time)
             VALUES (:sid, :fid, :rid, :sem, :day, :st, :et)'
        );
        $stmt->execute([
            ':sid' => $subjectId, ':fid' => $facultyId, ':rid' => $roomId,
            ':sem' => $semesterId, ':day' => $day, ':st'  => $startTime, ':et' => $endTime,
        ]);

        jsonResponse(['id' => (int)$db->lastInsertId()], 201);
        break;

    case 'PUT':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $body        = jsonBody();
        $subjectId   = (int)($body['subject_id'] ?? 0);
        $facultyId   = (int)($body['faculty_id'] ?? 0);
        $roomId      = (int)($body['room_id'] ?? 0);
        $semesterId  = (int)($body['semester_id'] ?? 0);
        $day         = requiredString($body, 'day_of_week');
        $startTime   = requiredString($body, 'start_time');
        $endTime     = requiredString($body, 'end_time');

        if (!$subjectId || !$facultyId || !$roomId || !$semesterId) {
            jsonError('subject_id, faculty_id, room_id, and semester_id are required');
        }
        if ($startTime >= $endTime) {
            jsonError('start_time must be before end_time');
        }

        $conflicts = checkConflicts($db, $semesterId, $facultyId, $roomId, $day, $startTime, $endTime, $id);
        if ($conflicts) {
            jsonResponse(['error' => 'Schedule conflict', 'conflicts' => $conflicts], 409);
        }

        $stmt = $db->prepare(
            'UPDATE schedules SET subject_id = :sid, faculty_id = :fid, room_id = :rid,
                    semester_id = :sem, day_of_week = :day, start_time = :st, end_time = :et
             WHERE id = :id'
        );
        $stmt->execute([
            ':sid' => $subjectId, ':fid' => $facultyId, ':rid' => $roomId,
            ':sem' => $semesterId, ':day' => $day, ':st'  => $startTime, ':et' => $endTime,
            ':id'  => $id,
        ]);
        if ($stmt->rowCount() === 0) jsonError('Schedule not found', 404);
        jsonResponse(['id' => $id]);
        break;

    case 'DELETE':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $stmt = $db->prepare('DELETE FROM schedules WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) jsonError('Schedule not found', 404);
        jsonResponse(['message' => 'Deleted']);
        break;

    default:
        jsonError('Method not allowed', 405);
}
