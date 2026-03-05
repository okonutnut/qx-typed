<?php
/**
 * SIAS Online — Database seeder.
 *
 * Run: php api/seed.php
 * Creates the schema and inserts sample data.
 */
require_once __DIR__ . '/database.php';

$db = getDb();

// Ensure tables exist
$schema = file_get_contents(__DIR__ . '/schema.sql');
$db->exec($schema);

echo "Tables created.\n";

// ── Users ────────────────────────────────────────────────────────────
$users = [
    ['admin',   password_hash('admin123',   PASSWORD_DEFAULT), 'System Administrator', 'admin'],
    ['tsaddul', password_hash('faculty123', PASSWORD_DEFAULT), 'Thomas C. Saddul',     'faculty'],
    ['jdoe',    password_hash('faculty123', PASSWORD_DEFAULT), 'Jane Doe',             'faculty'],
    ['student1', password_hash('student123', PASSWORD_DEFAULT), 'Juan Dela Cruz',      'student'],
];

$stmt = $db->prepare('INSERT OR IGNORE INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)');
foreach ($users as $u) $stmt->execute($u);
echo "Users seeded.\n";

// ── Subjects ─────────────────────────────────────────────────────────
$subjects = [
    ['CS101', 'Introduction to Computing',    3, 'Fundamentals of computer science'],
    ['CS102', 'Data Structures',              3, 'Arrays, lists, trees, graphs'],
    ['CS103', 'Database Management Systems',  3, 'Relational databases and SQL'],
    ['CS104', 'Operating Systems',            3, 'Process management, memory, I/O'],
    ['MATH101', 'College Algebra',            3, 'Algebraic expressions and equations'],
    ['MATH102', 'Calculus I',                 3, 'Limits, derivatives, integrals'],
    ['ENG101', 'English Communication',       3, 'Academic reading and writing'],
    ['PE101',  'Physical Education I',        2, 'Fitness and wellness'],
];

$stmt = $db->prepare('INSERT OR IGNORE INTO subjects (code, name, units, description) VALUES (?, ?, ?, ?)');
foreach ($subjects as $s) $stmt->execute($s);
echo "Subjects seeded.\n";

// ── Faculty ──────────────────────────────────────────────────────────
$faculty = [
    [2, 'EMP-001', 'Thomas C. Saddul',  'Computer Science', 'Software Engineering'],
    [3, 'EMP-002', 'Jane Doe',          'Computer Science', 'Database Systems'],
    [null, 'EMP-003', 'Maria Santos',   'Mathematics',      'Applied Mathematics'],
    [null, 'EMP-004', 'Pedro Reyes',    'Languages',        'English Literature'],
];

$stmt = $db->prepare('INSERT OR IGNORE INTO faculty (user_id, employee_id, full_name, department, specialization) VALUES (?, ?, ?, ?, ?)');
foreach ($faculty as $f) $stmt->execute($f);
echo "Faculty seeded.\n";

// ── Faculty-Subject assignments ──────────────────────────────────────
$assignments = [
    [1, 1], // Saddul → CS101
    [1, 2], // Saddul → CS102
    [2, 3], // Doe → CS103
    [2, 4], // Doe → CS104
    [3, 5], // Santos → MATH101
    [3, 6], // Santos → MATH102
    [4, 7], // Reyes → ENG101
];

$stmt = $db->prepare('INSERT OR IGNORE INTO faculty_subjects (faculty_id, subject_id) VALUES (?, ?)');
foreach ($assignments as $a) $stmt->execute($a);
echo "Faculty-subject assignments seeded.\n";

// ── Rooms ────────────────────────────────────────────────────────────
$rooms = [
    ['Room 101', 'Main Building', 40],
    ['Room 102', 'Main Building', 35],
    ['Room 201', 'Main Building', 40],
    ['CompLab 1', 'IT Building',  30],
    ['CompLab 2', 'IT Building',  30],
    ['Gym',       'Annex',        100],
];

$stmt = $db->prepare('INSERT OR IGNORE INTO rooms (name, building, capacity) VALUES (?, ?, ?)');
foreach ($rooms as $r) $stmt->execute($r);
echo "Rooms seeded.\n";

// ── Semesters ────────────────────────────────────────────────────────
$semesters = [
    ['1st Semester', '2025-2026', 1],
    ['2nd Semester', '2025-2026', 0],
    ['Summer',       '2025-2026', 0],
];

$stmt = $db->prepare('INSERT OR IGNORE INTO semesters (name, school_year, is_active) VALUES (?, ?, ?)');
foreach ($semesters as $s) $stmt->execute($s);
echo "Semesters seeded.\n";

// ── Schedules (for active semester) ──────────────────────────────────
$activeSem = $db->query('SELECT id FROM semesters WHERE is_active = 1 LIMIT 1')->fetch();
if ($activeSem) {
    $semId = $activeSem['id'];
    $schedules = [
        // subject_id, faculty_id, room_id, semester_id, day, start, end
        [1, 1, 4, $semId, 'Mon', '07:30', '09:00'], // CS101, Saddul, CompLab 1
        [1, 1, 4, $semId, 'Wed', '07:30', '09:00'],
        [2, 1, 4, $semId, 'Tue', '09:00', '10:30'], // CS102, Saddul, CompLab 1
        [2, 1, 4, $semId, 'Thu', '09:00', '10:30'],
        [3, 2, 5, $semId, 'Mon', '09:00', '10:30'], // CS103, Doe, CompLab 2
        [3, 2, 5, $semId, 'Wed', '09:00', '10:30'],
        [5, 3, 1, $semId, 'Mon', '10:30', '12:00'], // MATH101, Santos, Room 101
        [5, 3, 1, $semId, 'Fri', '10:30', '12:00'],
        [7, 4, 2, $semId, 'Tue', '07:30', '09:00'], // ENG101, Reyes, Room 102
        [7, 4, 2, $semId, 'Thu', '07:30', '09:00'],
    ];

    $stmt = $db->prepare('INSERT OR IGNORE INTO schedules (subject_id, faculty_id, room_id, semester_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)');
    foreach ($schedules as $sc) $stmt->execute($sc);
    echo "Schedules seeded.\n";
}

echo "\nDone! Database ready at api/sias.db\n";
