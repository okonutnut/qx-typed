namespace Backend.Types;

public class UserType : ObjectType<UserModel>
{
    protected override void Configure(IObjectTypeDescriptor<UserModel> descriptor)
    {
        descriptor.Name("User");
        descriptor.Field(x => x.Id).Type<NonNullType<IntType>>();
        descriptor.Field(x => x.Username).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Password).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.FullName).Type<NonNullType<StringType>>();
        descriptor.Field(x => x.Role).Type<NonNullType<StringType>>();
    }
}

public class UserModel
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
