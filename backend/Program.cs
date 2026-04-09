using Backend.Queries;
using Backend.Mutations;
using Backend.Types;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<PushService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
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
