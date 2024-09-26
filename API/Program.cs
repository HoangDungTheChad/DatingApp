using API.Data; 
using Microsoft.EntityFrameworkCore; 

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<DataContext>(options => {
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection"); 
    
    options.UseSqlite(connectionString.ToString()); 
}); 

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(policy => 
    policy.AllowAnyHeader()
          .AllowAnyMethod() 
          .WithOrigins("http://localhost:4200")
); 

app.MapControllers(); 

app.Run();
