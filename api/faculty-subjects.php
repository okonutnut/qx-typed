<?php
/**
 * SIAS Online — Faculty-Subject assignments.
 *
 * GET    /api/faculty-subjects.php?faculty_id=N  → list subjects for faculty
 * POST   /api/faculty-subjects.php               → assign  { faculty_id, subject_id }
 * DELETE /api/faculty-subjects.php?id=N          → unassign by row id
 */
require_once __DIR__ . '/database.php';

$db     = getDb();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        requireAuth();
        $facultyId = (int)($_GET['faculty_id'] ?? 0);
        if (!$facultyId) jsonError('Missing faculty_id');

        $stmt = $db->prepare(
            'SELECT fs.id, fs.faculty_id, fs.subject_id, s.code, s.name, s.units
             FROM faculty_subjects fs
             JOIN subjects s ON s.id = fs.subject_id
             WHERE fs.faculty_id = :fid
             ORDER BY s.code'
        );
        $stmt->execute([':fid' => $facultyId]);
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        requireRole('admin');
        $body      = jsonBody();
        $facultyId = (int)($body['faculty_id'] ?? 0);
        $subjectId = (int)($body['subject_id'] ?? 0);
        if (!$facultyId || !$subjectId) jsonError('faculty_id and subject_id are required');

        $stmt = $db->prepare('INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES (:fid, :sid)');
        try {
            $stmt->execute([':fid' => $facultyId, ':sid' => $subjectId]);
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'UNIQUE')) {
                jsonError('Subject already assigned to this faculty', 409);
            }
            throw $e;
        }
        jsonResponse(['id' => (int)$db->lastInsertId(), 'faculty_id' => $facultyId, 'subject_id' => $subjectId], 201);
        break;

    case 'DELETE':
        requireRole('admin');
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) jsonError('Missing id');

        $stmt = $db->prepare('DELETE FROM faculty_subjects WHERE id = :id');
        $stmt->execute([':id' => $id]);
        if ($stmt->rowCount() === 0) jsonError('Assignment not found', 404);
        jsonResponse(['message' => 'Deleted']);
        break;

    default:
        jsonError('Method not allowed', 405);
}
