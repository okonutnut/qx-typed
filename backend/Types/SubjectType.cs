namespace Backend.Types;

public class SubjectType : ObjectType<SubjectModel>
{
    protected override void Configure(IObjectTypeDescriptor<SubjectModel> descriptor)
    {
        descriptor.Name("Subject");
        descriptor.Field(x => x.Id).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.Code).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Name).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Units).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.Description).Type<StringType>();
    }
}

public class SubjectModel
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Units { get; set; }
    public string Description { get; set; } = string.Empty;
}
