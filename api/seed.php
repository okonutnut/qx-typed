<?php
/**
 * SIAS Online — Database seeder.
 *
 * Run: php api/seed.php
 * Rebuilds demo data with a few hundred records for AG Grid testing.
 */
require_once __DIR__ . '/database.php';

$db = getDb();

$schema = file_get_contents(__DIR__ . '/schema.sql');
$db->exec($schema);

function resetDatabase(PDO $db): void {
    $tables = [
        'schedules',
        'faculty_subjects',
        'faculty',
        'subjects',
        'rooms',
        'semesters',
        'users',
    ];

    $db->beginTransaction();
    $db->exec('PRAGMA foreign_keys = OFF');
    foreach ($tables as $table) {
        $db->exec("DELETE FROM {$table}");
    }
    $db->exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'subjects', 'faculty', 'faculty_subjects', 'rooms', 'semesters', 'schedules')");
    $db->exec('PRAGMA foreign_keys = ON');
    $db->commit();
}

function insertMany(PDO $db, string $sql, array $rows): void {
    $stmt = $db->prepare($sql);
    foreach ($rows as $row) {
        $stmt->execute($row);
    }
}

function buildFacultyName(int $index): string {
    $firstNames = [
        'Thomas', 'Jane', 'Maria', 'Pedro', 'Anna', 'Mark', 'Liza', 'Paolo',
        'Angela', 'Ramon', 'Elaine', 'Victor', 'Irene', 'Carlo', 'Bianca',
        'Dennis', 'Celia', 'Martin', 'Grace', 'Kevin', 'Rhea', 'Noel',
    ];
    $lastNames = [
        'Saddul', 'Doe', 'Santos', 'Reyes', 'Garcia', 'Villanueva', 'Torres',
        'Cruz', 'Mendoza', 'Navarro', 'Aquino', 'Lim', 'Ramos', 'Soriano',
        'Bautista', 'Fernandez', 'Domingo', 'Mercado', 'Salazar', 'Flores',
        'Pascual', 'Castro',
    ];

    $first = $firstNames[$index % count($firstNames)];
    $last = $lastNames[intdiv($index, count($firstNames)) % count($lastNames)];
    return "{$first} {$last}";
}

function buildSubjectCatalog(): array {
    $tracks = [
        ['prefix' => 'CS', 'title' => 'Computer Science', 'topics' => [
            'Programming', 'Data Structures', 'Algorithms', 'Database Systems',
            'Operating Systems', 'Networks', 'Web Development', 'Mobile Development',
            'Software Engineering', 'Information Assurance', 'Human Computer Interaction',
            'Cloud Computing',
        ]],
        ['prefix' => 'IT', 'title' => 'Information Technology', 'topics' => [
            'Systems Administration', 'Technical Support', 'Enterprise Architecture',
            'Business Analytics', 'IT Project Management', 'DevOps', 'Virtualization',
            'Infrastructure Security', 'Service Management', 'Digital Governance',
            'Platform Engineering', 'Automation',
        ]],
        ['prefix' => 'MATH', 'title' => 'Mathematics', 'topics' => [
            'College Algebra', 'Trigonometry', 'Calculus', 'Linear Algebra',
            'Discrete Mathematics', 'Statistics', 'Quantitative Methods',
            'Differential Equations', 'Numerical Analysis', 'Operations Research',
            'Mathematical Modeling', 'Probability',
        ]],
        ['prefix' => 'ENG', 'title' => 'English', 'topics' => [
            'Communication', 'Technical Writing', 'Speech', 'Academic Reading',
            'Business Correspondence', 'Creative Writing', 'Professional Presentation',
            'Research Writing', 'Editing', 'Argumentation', 'World Literature',
            'Language Studies',
        ]],
        ['prefix' => 'BUS', 'title' => 'Business', 'topics' => [
            'Accounting', 'Economics', 'Entrepreneurship', 'Marketing',
            'Business Law', 'Operations Management', 'Human Resources',
            'Finance', 'Strategic Management', 'Supply Chain', 'Innovation',
            'Organizational Behavior',
        ]],
    ];

    $subjects = [];
    foreach ($tracks as $track) {
        foreach ([100, 200] as $bandIndex => $levelBand) {
            foreach ($track['topics'] as $topicIndex => $topic) {
                $level = $levelBand + ($topicIndex + 1);
                $code = $track['prefix'] . $level;
                $subjects[] = [
                    $code,
                    "{$track['title']} {$topic} " . ($bandIndex === 0 ? 'I' : 'II'),
                    ($track['prefix'] === 'ENG' ? 2 : 3),
                    "Core {$topic} course under the {$track['title']} track.",
                ];
            }
        }
    }

    return $subjects;
}

function pickSubjectIds(array $subjectIds, int $facultyIndex): array {
    $subjectCount = count($subjectIds);
    $start = ($facultyIndex * 3) % $subjectCount;
    $count = 4 + ($facultyIndex % 2);
    $picked = [];

    for ($offset = 0; $offset < $count; $offset++) {
        $picked[] = $subjectIds[($start + $offset) % $subjectCount];
    }

    return array_values(array_unique($picked));
}

function buildScheduleRows(array $facultyAssignments, array $roomIds, int $semesterId): array {
    $meetingPairs = [
        ['Mon', 'Wed'],
        ['Tue', 'Thu'],
        ['Fri', 'Sat'],
    ];
    $timeSlots = [
        ['07:30', '09:00'],
        ['09:00', '10:30'],
        ['10:30', '12:00'],
        ['13:00', '14:30'],
        ['14:30', '16:00'],
        ['16:00', '17:30'],
    ];

    $facultyBusy = [];
    $roomBusy = [];
    $schedules = [];
    $pairIndex = 0;

    foreach ($facultyAssignments as $facultyId => $subjectIds) {
        $facultySlotIndex = 0;
        foreach ($subjectIds as $subjectId) {
            $meetingPair = $meetingPairs[$pairIndex % count($meetingPairs)];
            $scheduled = false;

            for ($slotAttempt = 0; $slotAttempt < count($timeSlots) && !$scheduled; $slotAttempt++) {
                $slot = $timeSlots[($facultySlotIndex + $slotAttempt) % count($timeSlots)];
                foreach ($roomIds as $roomId) {
                    $conflict = false;
                    foreach ($meetingPair as $day) {
                        $facultyKey = "{$facultyId}|{$day}|{$slot[0]}";
                        $roomKey = "{$roomId}|{$day}|{$slot[0]}";
                        if (isset($facultyBusy[$facultyKey]) || isset($roomBusy[$roomKey])) {
                            $conflict = true;
                            break;
                        }
                    }

                    if ($conflict) {
                        continue;
                    }

                    foreach ($meetingPair as $day) {
                        $facultyBusy["{$facultyId}|{$day}|{$slot[0]}"] = true;
                        $roomBusy["{$roomId}|{$day}|{$slot[0]}"] = true;
                        $schedules[] = [
                            $subjectId,
                            $facultyId,
                            $roomId,
                            $semesterId,
                            $day,
                            $slot[0],
                            $slot[1],
                        ];
                    }

                    $scheduled = true;
                    $facultySlotIndex = ($facultySlotIndex + 1) % count($timeSlots);
                    $pairIndex++;
                    break;
                }
            }
        }
    }

    return $schedules;
}

resetDatabase($db);
echo "Database reset.\n";

$users = [
    ['admin', password_hash('admin123', PASSWORD_DEFAULT), 'System Administrator', 'admin'],
];

$facultyCount = 120;
for ($i = 0; $i < $facultyCount; $i++) {
    $name = buildFacultyName($i);
    $users[] = [
        sprintf('faculty%03d', $i + 1),
        password_hash('faculty123', PASSWORD_DEFAULT),
        $name,
        'faculty',
    ];
}

for ($i = 0; $i < 40; $i++) {
    $users[] = [
        sprintf('student%03d', $i + 1),
        password_hash('student123', PASSWORD_DEFAULT),
        'Student ' . str_pad((string)($i + 1), 3, '0', STR_PAD_LEFT),
        'student',
    ];
}

insertMany(
    $db,
    'INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
    $users
);
echo 'Users seeded: ' . count($users) . "\n";

$subjects = buildSubjectCatalog();
insertMany(
    $db,
    'INSERT INTO subjects (code, name, units, description) VALUES (?, ?, ?, ?)',
    $subjects
);
$subjectIds = $db->query('SELECT id FROM subjects ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
echo 'Subjects seeded: ' . count($subjects) . "\n";

$departments = [
    ['Computer Science', 'Software Engineering'],
    ['Computer Science', 'Data Systems'],
    ['Information Technology', 'Infrastructure'],
    ['Information Technology', 'Cybersecurity'],
    ['Mathematics', 'Applied Mathematics'],
    ['Languages', 'Communication'],
    ['Business', 'Operations Management'],
    ['Business', 'Analytics'],
];

$facultyRows = [];
$userRows = $db->query("SELECT id, full_name FROM users WHERE role = 'faculty' ORDER BY id")->fetchAll();
foreach ($userRows as $index => $user) {
    $dept = $departments[$index % count($departments)];
    $facultyRows[] = [
        $user['id'],
        sprintf('EMP-%03d', $index + 1),
        $user['full_name'],
        $dept[0],
        $dept[1],
    ];
}

insertMany(
    $db,
    'INSERT INTO faculty (user_id, employee_id, full_name, department, specialization) VALUES (?, ?, ?, ?, ?)',
    $facultyRows
);
$facultyIds = $db->query('SELECT id FROM faculty ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
echo 'Faculty seeded: ' . count($facultyRows) . "\n";

$assignmentRows = [];
$facultyAssignments = [];
foreach ($facultyIds as $index => $facultyId) {
    $assignedSubjectIds = pickSubjectIds($subjectIds, $index);
    $facultyAssignments[$facultyId] = $assignedSubjectIds;
    foreach ($assignedSubjectIds as $subjectId) {
        $assignmentRows[] = [$facultyId, $subjectId];
    }
}

insertMany(
    $db,
    'INSERT INTO faculty_subjects (faculty_id, subject_id) VALUES (?, ?)',
    $assignmentRows
);
echo 'Faculty-subject assignments seeded: ' . count($assignmentRows) . "\n";

$rooms = [];
$buildings = ['Main Building', 'IT Building', 'Science Wing', 'Business Center'];
for ($i = 1; $i <= 24; $i++) {
    $rooms[] = [
        'Room ' . str_pad((string)$i, 3, '0', STR_PAD_LEFT),
        $buildings[($i - 1) % count($buildings)],
        30 + (($i * 5) % 35),
    ];
}
for ($i = 1; $i <= 6; $i++) {
    $rooms[] = [
        'CompLab ' . $i,
        'IT Building',
        36 + ($i * 2),
    ];
}

insertMany(
    $db,
    'INSERT INTO rooms (name, building, capacity) VALUES (?, ?, ?)',
    $rooms
);
$roomIds = $db->query('SELECT id FROM rooms ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
echo 'Rooms seeded: ' . count($rooms) . "\n";

$semesters = [
    ['1st Semester', '2025-2026', 1],
    ['2nd Semester', '2025-2026', 0],
    ['Summer', '2025-2026', 0],
    ['1st Semester', '2026-2027', 0],
    ['2nd Semester', '2026-2027', 0],
    ['Summer', '2026-2027', 0],
];

insertMany(
    $db,
    'INSERT INTO semesters (name, school_year, is_active) VALUES (?, ?, ?)',
    $semesters
);
$activeSemesterId = (int)$db->query('SELECT id FROM semesters WHERE is_active = 1 LIMIT 1')->fetchColumn();
echo 'Semesters seeded: ' . count($semesters) . "\n";

$scheduleRows = buildScheduleRows($facultyAssignments, $roomIds, $activeSemesterId);
insertMany(
    $db,
    'INSERT INTO schedules (subject_id, faculty_id, room_id, semester_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
    $scheduleRows
);
echo 'Schedules seeded: ' . count($scheduleRows) . "\n";

echo "\nDone! Database ready at api/sias.db\n";
