using Backend.Types;

namespace Backend.Queries;

public class Query
{
    public IEnumerable<UserModel> GetUsers()
    {
        return new List<UserModel>
        {
            new() { Id = 1, Username = "admin", FullName = "Administrator", Role = "admin" },
            new() { Id = 2, Username = "jsmith", FullName = "John Smith", Role = "faculty" },
            new() { Id = 3, Username = "mjane", FullName = "Jane Doe", Role = "student" }
        };
    }

    public UserModel? GetUser(int id)
    {
        return GetUsers().FirstOrDefault(u => u.Id == id);
    }

    public IEnumerable<SubjectModel> GetSubjects()
    {
        return new List<SubjectModel>
        {
            new() { Id = 1, Code = "CS101", Name = "Introduction to Computer Science", Units = 3, Description = "Basic concepts of programming" },
            new() { Id = 2, Code = "MATH201", Name = "Calculus II", Units = 4, Description = "Advanced calculus" }
        };
    }

    public SubjectModel? GetSubject(int id)
    {
        return GetSubjects().FirstOrDefault(s => s.Id == id);
    }

    public IEnumerable<FacultyModel> GetFaculties()
    {
        return new List<FacultyModel>
        {
            new() { Id = 1, UserId = 2, EmployeeId = "FAC001", FullName = "John Smith", Department = "Computer Science", Specialization = "Software Engineering" },
            new() { Id = 2, UserId = null, EmployeeId = "FAC002", FullName = "Alice Johnson", Department = "Mathematics", Specialization = "Applied Mathematics" }
        };
    }

    public FacultyModel? GetFaculty(int id)
    {
        return GetFaculties().FirstOrDefault(f => f.Id == id);
    }

    public IEnumerable<RoomModel> GetRooms()
    {
        return new List<RoomModel>
        {
            new() { Id = 1, Name = "101", Building = "Main Hall", Capacity = 30 },
            new() { Id = 2, Name = "202", Building = "Science Building", Capacity = 50 }
        };
    }

    public RoomModel? GetRoom(int id)
    {
        return GetRooms().FirstOrDefault(r => r.Id == id);
    }

    public IEnumerable<SemesterModel> GetSemesters()
    {
        return new List<SemesterModel>
        {
            new() { Id = 1, Name = "1st Semester", SchoolYear = "2025-2026", IsActive = 1 },
            new() { Id = 2, Name = "2nd Semester", SchoolYear = "2025-2026", IsActive = 0 }
        };
    }

    public SemesterModel? GetSemester(int id)
    {
        return GetSemesters().FirstOrDefault(s => s.Id == id);
    }

    public SemesterModel? GetActiveSemester()
    {
        return GetSemesters().FirstOrDefault(s => s.IsActive == 1);
    }

    public IEnumerable<ScheduleModel> GetSchedules()
    {
        return new List<ScheduleModel>
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
    }

    public ScheduleModel? GetSchedule(int id)
    {
        return GetSchedules().FirstOrDefault(s => s.Id == id);
    }

    public IEnumerable<FacultySubjectModel> GetFacultySubjects()
    {
        return new List<FacultySubjectModel>
        {
            new() { Id = 1, FacultyId = 1, SubjectId = 1, Code = "CS101", Name = "Introduction to Computer Science", Units = 3 }
        };
    }

    public IEnumerable<FacultySubjectModel> GetFacultySubjectsByFaculty(int facultyId)
    {
        return GetFacultySubjects().Where(fs => fs.FacultyId == facultyId);
    }
}
