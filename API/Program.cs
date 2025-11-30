using System.Text;
using API.Data;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Middleware;
using API.Services;
using API.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
  Args = args,
  WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "browser")
});

var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
if (env != "Development")
{
  // Read PORT from environment variable (Docker will provide this)
  var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
  builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}


// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddCors();
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddSignalR();


var app = builder.Build();
// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors(x => x.AllowAnyHeader()
  .AllowAnyMethod()
  .AllowCredentials() // Not sure if this is neccessary for the SignalR authentication 
  .WithOrigins("https://localhost:4200"));

// the order of these middleware is important 
app.UseAuthentication();
app.UseAuthorization();

// Serve files from wwwroot/browser
var defaultFilesOptions = new DefaultFilesOptions();
defaultFilesOptions.DefaultFileNames.Clear();                 // remove "index.html"
defaultFilesOptions.DefaultFileNames.Add("index.html");   // tell .NET your real file

app.UseDefaultFiles(defaultFilesOptions);

app.UseStaticFiles();

// map your controllers (REST API)
app.MapControllers();

// map your Signal Hub (real-time endpoints)
app.MapHub<PresenceHub>("/hubs/presence");
app.MapHub<MessageHub>("/hubs/message");

// Fallback to Angular app for client-side routes
app.MapFallbackToFile("index.html");

// ==== SEED DATA HERE ==== // 
// Create a mini-container to grab scoped services 
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
  var context = services.GetRequiredService<DataContext>();
  var userManager = services.GetRequiredService<UserManager<AppUser>>();
  var roleManager = services.GetRequiredService<RoleManager<AppRole>>();



  await context.Database.MigrateAsync();

  // Console.WriteLine("WAITING FOR DEBUGGER TO ATTACH...");
  // while (!System.Diagnostics.Debugger.IsAttached) { }  // 🛑 wait for debugger
  // Console.WriteLine("DEBUGGER ATTACHED ✅");

  await Seed.SeedUsers(userManager, roleManager);
}
catch (Exception ex)
{
  var logger = services.GetRequiredService<ILogger<Program>>();
  logger.LogError(ex, "An error occured while seeding the database");
}

app.Run();
