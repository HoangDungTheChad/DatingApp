using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
  public class DataContext : IdentityDbContext<AppUser, AppRole, int,
    IdentityUserClaim<int>, AppUserRole, IdentityUserLogin<int>,
    IdentityRoleClaim<int>, IdentityUserToken<int>>
  {
    public DataContext(DbContextOptions options) : base(options)
    {
    }

    // Using IdentityDbContext, we don't need this anymore 
    // public DbSet<AppUser> Users { get; set; }
    public DbSet<UserLike> Likes { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Connection> Connections { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      base.OnModelCreating(modelBuilder);

      modelBuilder.Entity<AppUser>()
        .HasMany(user => user.UserRoles)
        .WithOne(userRole => userRole.User)
        .HasForeignKey(userRole => userRole.UserId)
        .IsRequired();  // The UserId foreign key is required (not nullable) 

      modelBuilder.Entity<AppRole>()
        .HasMany(role => role.UserRoles)
        .WithOne(userRole => userRole.Role)
        .HasForeignKey(userRole => userRole.RoleId)
        .IsRequired();

      modelBuilder.Entity<UserLike>()
        .HasKey(k => new { k.SourceUserId, k.LikedUserId });

      modelBuilder.Entity<UserLike>()
        .HasOne(like => like.SourceUser)
        .WithMany(user => user.LikedUsers)
        .HasForeignKey(like => like.SourceUserId)
        .OnDelete(DeleteBehavior.Cascade);

      modelBuilder.Entity<UserLike>()
        .HasOne(like => like.LikedUser)
        .WithMany(user => user.LikedByUsers)
        .HasForeignKey(s => s.LikedUserId)
        .OnDelete(DeleteBehavior.Cascade);

      // Configure the relationship between Message and AppUser  
      modelBuilder.Entity<Message>()
        .HasOne(m => m.Sender)
        .WithMany(u => u.MessagesSent)
        .OnDelete(DeleteBehavior.Restrict);

      modelBuilder.Entity<Message>()
        .HasOne(m => m.Recipient)
        .WithMany(u => u.MessagesReceived)
        .OnDelete(DeleteBehavior.Restrict);
    }
  }
}