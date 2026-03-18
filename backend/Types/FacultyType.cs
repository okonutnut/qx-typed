namespace Backend.Types;

public class FacultyType : ObjectType<FacultyModel>
{
    protected override void Configure(IObjectTypeDescriptor<FacultyModel> descriptor)
    {
        descriptor.Name("Faculty");
        descriptor.Field(x => x.Id).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.UserId).Type<IntType>();
        descriptor.Field(x => x.EmployeeId).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.FullName).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Department).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Specialization).Type<StringType>();
    }
}

public class FacultyModel
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
}
