using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet.Actions;

namespace API.Interfaces
{
  public interface IPhotoService
  {
    Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
    // Each photo uploaded to cloudinary is given a public ID 
    Task<DeletionResult> DeletePhotoAsync(string publicId);
  }
}