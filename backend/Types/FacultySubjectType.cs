namespace Backend.Types;

public class FacultySubjectType : ObjectType<FacultySubjectModel>
{
    protected override void Configure(IObjectTypeDescriptor<FacultySubjectModel> descriptor)
    {
        descriptor.Name("FacultySubject");
        descriptor.Field(x => x.Id).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.FacultyId).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.SubjectId).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.Code).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Name).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Units).Type<NonNullType<IntType>>();
    }
}

public class FacultySubjectModel
{
    public int Id { get; set; }
    public int FacultyId { get; set; }
    public int SubjectId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Units { get; set; }
}
