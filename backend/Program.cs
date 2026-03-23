using Backend.Queries;
using Backend.Mutations;
using Backend.Types;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<UserType>()
    .AddType<SubjectType>()
    .AddType<FacultyType>()
    .AddType<RoomType>()
    .AddType<SemesterType>()
    .AddType<ScheduleType>()
    .AddType<FacultySubjectType>();

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapGraphQL();

app.Run();
