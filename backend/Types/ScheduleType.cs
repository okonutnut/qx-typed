namespace Backend.Types;

public class ScheduleType : ObjectType<ScheduleModel>
{
    protected override void Configure(IObjectTypeDescriptor<ScheduleModel> descriptor)
    {
        descriptor.Name("Schedule");
        descriptor.Field(x => x.Id).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.SubjectId).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.FacultyId).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.RoomId).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.SemesterId).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.DayOfWeek).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.StartTime).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.EndTime).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.SubjectCode).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.SubjectName).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.FacultyName).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.EmployeeId).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.RoomName).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Building).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.SemesterName).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.SchoolYear).Type<NonNullType<StringType>>();
    }
}

public class ScheduleModel
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public int FacultyId { get; set; }
    public int RoomId { get; set; }
    public int SemesterId { get; set; }
    public string DayOfWeek { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string FacultyName { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string RoomName { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public string SemesterName { get; set; } = string.Empty;
    public string SchoolYear { get; set; } = string.Empty;
}
