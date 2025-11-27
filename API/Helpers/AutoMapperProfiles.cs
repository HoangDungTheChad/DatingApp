using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers
{
  public class AutoMapperProfiles : Profile
  {
    public AutoMapperProfiles()
    {
      CreateMap<AppUser, MemberDto>()
        .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src =>
          src.Photos.FirstOrDefault(x => x.IsMain).Url))
        .ForMember(dest => dest.Age, opt => opt.MapFrom(src =>
          src.DateOfBirth.CalculateAge()));
      CreateMap<Photo, PhotoDto>();
      CreateMap<MemberUpdateDto, AppUser>();

      // Also make sure DateOfBirth is set to UTC for postgres reason 
      CreateMap<RegisterDto, AppUser>()
          .ForMember(dest => dest.DateOfBirth,
              opt => opt.MapFrom(src => ParseToUtc(src.DateOfBirth))); 

      CreateMap<Message, MessageDto>()
        .ForMember(dest => dest.SenderPhotoUrl, opt => opt.MapFrom(src =>
          src.Sender.Photos.FirstOrDefault(x => x.IsMain).Url))
        .ForMember(dest => dest.RecipientPhotoUrl, opt => opt.MapFrom(
          src => src.Recipient.Photos.FirstOrDefault(x => x.IsMain).Url));
    }

    public static DateTime ParseToUtc(string dob)
    {
      var parsed = DateTime.Parse(dob);  
      
      if (parsed.Kind != DateTimeKind.Utc) 
        return DateTime.SpecifyKind(parsed, DateTimeKind.Utc);  

      return parsed.ToUniversalTime(); 
    }
  }
}