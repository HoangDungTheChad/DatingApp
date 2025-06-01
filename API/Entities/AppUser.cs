using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
  public class AppUser
  {
    public int Id { get; set; }
    public string UserName { get; set; }
    public byte[] PasswordHash { get; set; }
    public byte[] PasswordSalt { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string KnownAs { get; set; }
    public DateTime Created { get; set; } = DateTime.Now;
    public DateTime LastActive { get; set; } = DateTime.Now;
    public string Gender { get; set; }
    public string Introduction { get; set; }
    public string LookingFor { get; set; }
    public string Interests { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
    public ICollection<Photo> Photos { get; set; }

    // The method name is important, because AutoMapper'll use
    // that to populate the value for the MemberDto's Age property.
    
    // public int GetAge()
    // {
    //   DateTime today = DateTime.Today;
    //   int age = today.Year - DateOfBirth.Year;
    //   if (DateOfBirth > today.AddYears(-age)) --age;
    //   return age;
    // }
  }
}