namespace Backend.Types;

public class RoomType : ObjectType<RoomModel>
{
    protected override void Configure(IObjectTypeDescriptor<RoomModel> descriptor)
    {
        descriptor.Name("Room");
        descriptor.Field(x => x.Id).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.Name).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Building).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Capacity).Type<NonNullType<IntType>>();
    }
}

public class RoomModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Building { get; set; } = string.Empty;
    public int Capacity { get; set; }
}
