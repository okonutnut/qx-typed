using Backend.Types;

namespace Backend.Mutations;

public class Mutation
{
    public static readonly List<UserModel> Users = new()
    {
        new() { Id = 1, Username = "admin", Password = "admin123", FullName = "Administrator", Role = "admin" },
        new() { Id = 2, Username = "jsmith", Password = "faculty123", FullName = "John Smith", Role = "faculty" }
    };

    public static readonly List<SubjectModel> Subjects = new()
    {
        new() { Id = 1, Code = "CS101", Name = "Introduction to Computer Science", Units = 3, Description = "Basic concepts of programming" },
        new() { Id = 2, Code = "MATH201", Name = "Calculus II", Units = 4, Description = "Advanced calculus" }
    };

    public static readonly List<FacultyModel> Faculties = new()
    {
        new() { Id = 1, UserId = 2, EmployeeId = "FAC001", FullName = "John Smith", Department = "Computer Science", Specialization = "Software Engineering" },
        new() { Id = 2, UserId = null, EmployeeId = "FAC002", FullName = "Alice Johnson", Department = "Mathematics", Specialization = "Applied Mathematics" }
    };

    public static readonly List<RoomModel> Rooms = new()
    {
        new() { Id = 1, Name = "101", Building = "Main Hall", Capacity = 30 },
        new() { Id = 2, Name = "202", Building = "Science Building", Capacity = 50 }
    };

    public static readonly List<SemesterModel> Semesters = new()
    {
        new() { Id = 1, Name = "1st Semester", SchoolYear = "2025-2026", IsActive = 1 },
        new() { Id = 2, Name = "2nd Semester", SchoolYear = "2025-2026", IsActive = 0 }
    };

    public static readonly List<ScheduleModel> Schedules = new()
    {
        new()
        {
            Id = 1, SubjectId = 1, FacultyId = 1, RoomId = 1, SemesterId = 1,
            DayOfWeek = "Monday", StartTime = "09:00", EndTime = "10:30",
            SubjectCode = "CS101", SubjectName = "Introduction to Computer Science",
            FacultyName = "John Smith", EmployeeId = "FAC001",
            RoomName = "101", Building = "Main Hall",
            SemesterName = "1st Semester", SchoolYear = "2025-2026"
        }
    };

    private static int _nextSubjectId = 3;
    private static int _nextFacultyId = 3;
    private static int _nextRoomId = 3;
    private static int _nextSemesterId = 3;
    private static int _nextScheduleId = 2;

    public SubjectModel CreateSubject(string code, string name, int units, string description)
    {
        var subject = new SubjectModel
        {
            Id = _nextSubjectId++,
            Code = code,
            Name = name,
            Units = units,
            Description = description
        };
        Subjects.Add(subject);
        return subject;
    }

    public SubjectModel? UpdateSubject(int id, string code, string name, int units, string description)
    {
        var subject = Subjects.FirstOrDefault(s => s.Id == id);
        if (subject == null) return null;

        subject.Code = code;
        subject.Name = name;
        subject.Units = units;
        subject.Description = description;
        return subject;
    }

    public bool DeleteSubject(int id)
    {
        var subject = Subjects.FirstOrDefault(s => s.Id == id);
        if (subject == null) return false;
        return Subjects.Remove(subject);
    }

    public FacultyModel CreateFaculty(int? userId, string employeeId, string fullName, string department, string specialization)
    {
        var faculty = new FacultyModel
        {
            Id = _nextFacultyId++,
            UserId = userId,
            EmployeeId = employeeId,
            FullName = fullName,
            Department = department,
            Specialization = specialization
        };
        Faculties.Add(faculty);
        return faculty;
    }

    public FacultyModel? UpdateFaculty(int id, int? userId, string employeeId, string fullName, string department, string specialization)
    {
        var faculty = Faculties.FirstOrDefault(f => f.Id == id);
        if (faculty == null) return null;

        faculty.UserId = userId;
        faculty.EmployeeId = employeeId;
        faculty.FullName = fullName;
        faculty.Department = department;
        faculty.Specialization = specialization;
        return faculty;
    }

    public bool DeleteFaculty(int id)
    {
        var faculty = Faculties.FirstOrDefault(f => f.Id == id);
        if (faculty == null) return false;
        return Faculties.Remove(faculty);
    }

    public RoomModel CreateRoom(string name, string building, int capacity)
    {
        var room = new RoomModel
        {
            Id = _nextRoomId++,
            Name = name,
            Building = building,
            Capacity = capacity
        };
        Rooms.Add(room);
        return room;
    }

    public RoomModel? UpdateRoom(int id, string name, string building, int capacity)
    {
        var room = Rooms.FirstOrDefault(r => r.Id == id);
        if (room == null) return null;

        room.Name = name;
        room.Building = building;
        room.Capacity = capacity;
        return room;
    }

    public bool DeleteRoom(int id)
    {
        var room = Rooms.FirstOrDefault(r => r.Id == id);
        if (room == null) return false;
        return Rooms.Remove(room);
    }

    public SemesterModel CreateSemester(string name, string schoolYear, int isActive)
    {
        if (isActive == 1)
        {
            foreach (var sem in Semesters)
            {
                sem.IsActive = 0;
            }
        }

        var semester = new SemesterModel
        {
            Id = _nextSemesterId++,
            Name = name,
            SchoolYear = schoolYear,
            IsActive = isActive
        };
        Semesters.Add(semester);
        return semester;
    }

    public SemesterModel? UpdateSemester(int id, string name, string schoolYear, int isActive)
    {
        var semester = Semesters.FirstOrDefault(s => s.Id == id);
        if (semester == null) return null;

        if (isActive == 1)
        {
            foreach (var sem in Semesters)
            {
                sem.IsActive = 0;
            }
        }

        semester.Name = name;
        semester.SchoolYear = schoolYear;
        semester.IsActive = isActive;
        return semester;
    }

    public bool DeleteSemester(int id)
    {
        var semester = Semesters.FirstOrDefault(s => s.Id == id);
        if (semester == null) return false;
        return Semesters.Remove(semester);
    }

    public ScheduleModel CreateSchedule(
        int subjectId, int facultyId, int roomId, int semesterId,
        string dayOfWeek, string startTime, string endTime)
    {
        var subject = Subjects.FirstOrDefault(s => s.Id == subjectId);
        var faculty = Faculties.FirstOrDefault(f => f.Id == facultyId);
        var room = Rooms.FirstOrDefault(r => r.Id == roomId);
        var semester = Semesters.FirstOrDefault(s => s.Id == semesterId);

        var schedule = new ScheduleModel
        {
            Id = _nextScheduleId++,
            SubjectId = subjectId,
            FacultyId = facultyId,
            RoomId = roomId,
            SemesterId = semesterId,
            DayOfWeek = dayOfWeek,
            StartTime = startTime,
            EndTime = endTime,
            SubjectCode = subject?.Code ?? "",
            SubjectName = subject?.Name ?? "",
            FacultyName = faculty?.FullName ?? "",
            EmployeeId = faculty?.EmployeeId ?? "",
            RoomName = room?.Name ?? "",
            Building = room?.Building ?? "",
            SemesterName = semester?.Name ?? "",
            SchoolYear = semester?.SchoolYear ?? ""
        };
        Schedules.Add(schedule);
        return schedule;
    }

    public ScheduleModel? UpdateSchedule(
        int id, int subjectId, int facultyId, int roomId, int semesterId,
        string dayOfWeek, string startTime, string endTime)
    {
        var schedule = Schedules.FirstOrDefault(s => s.Id == id);
        if (schedule == null) return null;

        var subject = Subjects.FirstOrDefault(s => s.Id == subjectId);
        var faculty = Faculties.FirstOrDefault(f => f.Id == facultyId);
        var room = Rooms.FirstOrDefault(r => r.Id == roomId);
        var semester = Semesters.FirstOrDefault(s => s.Id == semesterId);

        schedule.SubjectId = subjectId;
        schedule.FacultyId = facultyId;
        schedule.RoomId = roomId;
        schedule.SemesterId = semesterId;
        schedule.DayOfWeek = dayOfWeek;
        schedule.StartTime = startTime;
        schedule.EndTime = endTime;
        schedule.SubjectCode = subject?.Code ?? "";
        schedule.SubjectName = subject?.Name ?? "";
        schedule.FacultyName = faculty?.FullName ?? "";
        schedule.EmployeeId = faculty?.EmployeeId ?? "";
        schedule.RoomName = room?.Name ?? "";
        schedule.Building = room?.Building ?? "";
        schedule.SemesterName = semester?.Name ?? "";
        schedule.SchoolYear = semester?.SchoolYear ?? "";

        return schedule;
    }

    public bool DeleteSchedule(int id)
    {
        var schedule = Schedules.FirstOrDefault(s => s.Id == id);
        if (schedule == null) return false;
        return Schedules.Remove(schedule);
    }
}
