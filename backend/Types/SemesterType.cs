namespace Backend.Types;

public class SemesterType : ObjectType<SemesterModel>
{
    protected override void Configure(IObjectTypeDescriptor<SemesterModel> descriptor)
    {
        descriptor.Name("Semester");
        descriptor.Field(x => x.Id).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.Name).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.SchoolYear).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.IsActive).Type<NonNullType<IntType>>();
    }
}

public class SemesterModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SchoolYear { get; set; } = string.Empty;
    public int IsActive { get; set; }
}
