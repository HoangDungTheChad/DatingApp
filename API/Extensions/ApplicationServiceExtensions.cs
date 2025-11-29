using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
  public static class ApplicationServiceExtensions
  {
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
      services.AddSingleton<PresenceTracker>();
      services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
      services.AddScoped<ITokenService, TokenService>();
      services.AddScoped<LogUserActivity>();

      // services.AddScoped<IUserRepository, UserRepository>();
      // services.AddScoped<ILikesRepository, LikesRepository>();
      // services.AddScoped<IMessageRepository, MessageRepository>(); 
      services.AddScoped<IUnitOfWork, UnitOfWork>();

      services.AddScoped<IPhotoService, PhotoService>();
      services.AddAutoMapper(typeof(AutoMapperProfiles).Assembly);

      services.AddDbContext<DataContext>(options =>
      {
        var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        string connStr;

        // Depending on if in development or production mode, use either render-provided  
        // connnection string or development connection string from env var  
        if (env == "Development")
        {
          // Use the connection string from file  
          connStr = config.GetConnectionString("DefaultConnection");
        }
        else
        {
          // Use connection string provided at runtime by Render, it's a bit complex bro Giang!
          var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

          if (!string.IsNullOrEmpty(databaseUrl))
          {
            // parse database url to connection string for Npgsql 
            connStr = ParseRenderDatabaseUrl(databaseUrl); 
          }
          else
          {
            throw new Exception("Environment variable not found: DATABASE_URL");
          }
        }

        options.UseNpgsql(connStr); 
      });

      return services;
    }

    static string ParseRenderDatabaseUrl(string databaseUrl)
    {
      try
      {
        var uri = new Uri(databaseUrl);

        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 5432;
        var database = uri.AbsolutePath.TrimStart('/');
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo[0];
        var password = userInfo.Length > 1 ? userInfo[1] : "";

        // Render requires SSL
        return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
      }
      catch (Exception ex)
      {
        throw new Exception($"Failed to parse DATABASE_URL: {ex.Message}", ex);
      }
    }
  }
}