using System.Text;
using API.Data;
using API.Extensions;
using API.Interfaces;
using API.Middleware;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddControllers(); 
builder.Services.AddIdentityServices(builder.Configuration); 


var app = builder.Build();
// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().WithOrigins("https://localhost:4200")); 

// the order of these middleware is important 
app.UseAuthentication();  
app.UseAuthorization();

app.MapControllers();

// ==== SEED DATA HERE ==== // 
// Create a mini-container to grab scoped services 
using var scope = app.Services.CreateScope(); 
var services = scope.ServiceProvider;

try
{
  var context = services.GetRequiredService<DataContext>();
  await context.Database.MigrateAsync();
  await Seed.SeedUsers(context);
}
catch (Exception ex)
{
  var logger = services.GetRequiredService<ILogger<Program>>();
  logger.LogError(ex, "An error occured whle seeding the database"); 
}

app.Run();
