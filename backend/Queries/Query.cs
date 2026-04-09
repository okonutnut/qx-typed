using Backend.Types;
using Backend.Mutations;
using Backend.Services;

namespace Backend.Queries;

public class Query
{
    private static readonly PushService _pushService = new();

    public IEnumerable<UserModel> GetUsers()
    {
        return Mutation.Users;
    }

    public UserModel? GetUser(int id)
    {
        return GetUsers().FirstOrDefault(u => u.Id == id);
    }

    public IEnumerable<SubjectModel> GetSubjects()
    {
        return Mutation.Subjects;
    }

    public SubjectModel? GetSubject(int id)
    {
        return Mutation.Subjects.FirstOrDefault(s => s.Id == id);
    }

    public IEnumerable<FacultyModel> GetFaculties()
    {
        return Mutation.Faculties;
    }

    public FacultyModel? GetFaculty(int id)
    {
        return Mutation.Faculties.FirstOrDefault(f => f.Id == id);
    }

    public IEnumerable<RoomModel> GetRooms()
    {
        return Mutation.Rooms;
    }

    public RoomModel? GetRoom(int id)
    {
        return Mutation.Rooms.FirstOrDefault(r => r.Id == id);
    }

    public IEnumerable<SemesterModel> GetSemesters()
    {
        return Mutation.Semesters;
    }

    public SemesterModel? GetSemester(int id)
    {
        return Mutation.Semesters.FirstOrDefault(s => s.Id == id);
    }

    public SemesterModel? GetActiveSemester()
    {
        return Mutation.Semesters.FirstOrDefault(s => s.IsActive == 1);
    }

    public IEnumerable<ScheduleModel> GetSchedules()
    {
        return Mutation.Schedules;
    }

    public ScheduleModel? GetSchedule(int id)
    {
        return Mutation.Schedules.FirstOrDefault(s => s.Id == id);
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

    public string GetVapidPublicKey() => _pushService.GetVapidPublicKey();
}
