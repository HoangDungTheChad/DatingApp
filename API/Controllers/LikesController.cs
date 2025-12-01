using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
  // make sure we're authenticated to this controller  
  [Authorize]
  public class LikesController : BaseApiController
  {
    private readonly IUnitOfWork _unitOfWork;

    public LikesController(IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
    }

    [HttpPost("add-like/{username}")]
    public async Task<ActionResult> AddLike(string username)
    {
      var sourceUserId = User.GetUserId();
      var likedUser = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
      var sourceUser = await _unitOfWork.LikesRepository.GetUserWithLikes(sourceUserId);

      // we can't find the user that they wanted to like 
      if (likedUser == null) return NotFound();

      if (sourceUser.UserName == username) return BadRequest("You cannot like yourself");

      var userLike = await _unitOfWork.LikesRepository.GetUserLike(sourceUserId, likedUser.Id);
      if (userLike != null) return BadRequest("You already liked this user");

      userLike = new UserLike
      {
        SourceUserId = sourceUserId,
        LikedUserId = likedUser.Id
      };

      sourceUser.LikedUsers.Add(userLike);

      // be careful with saving changes, later we'll use an alternative  
      // approach (unit of work)
      if (await _unitOfWork.Complete()) return Ok();

      return BadRequest("Failed to save user");
    }

    [HttpDelete("remove-like/{username}")]
    public async Task<ActionResult> Removelike(string username, string relationshipType)
    {
      var sourceUserId = User.GetUserId();
      var likedUserId = await _unitOfWork.UserRepository.GetUserIdByUsernameAsync(username);

      // Outgoing means you liked them and vice versa  
      var outgoingLike = await _unitOfWork.LikesRepository.GetUserLike(sourceUserId, likedUserId);
      var incomingLike = await _unitOfWork.LikesRepository.GetUserLike(likedUserId, sourceUserId);

      switch (relationshipType)
      {
        case "likedByMe":
          if (outgoingLike == null) return BadRequest("You haven't liked this user");
          _unitOfWork.LikesRepository.RemoveUserLike(outgoingLike);
          break;
        case "likedMe":
          if (incomingLike == null) return BadRequest("This user hasn't liked you");
          _unitOfWork.LikesRepository.RemoveUserLike(incomingLike);

          // Optional: if both side like each other (a match), remove both  
          if (outgoingLike != null)
            _unitOfWork.LikesRepository.RemoveUserLike(outgoingLike);
          break;
        default:
          return BadRequest("Invalid relationship type, it is now " + relationshipType);
      }

      if (await _unitOfWork.Complete()) return Ok();

      return BadRequest("RemoveLike failed");
    }

    [HttpGet("likes-pagination")]
    public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery] LikesParams likesParams)
    {
      likesParams.UserId = User.GetUserId();
      var users = await _unitOfWork.LikesRepository.GetUserLikes(likesParams);

      Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

      return Ok(users);
    }

    // getting a list of already liked users without the pagination stuff 
    [HttpGet("liked-users")]
    public async Task<ActionResult<IEnumerable<LikeDto>>> GetLikedUsers()
    {
      var userId = User.GetUserId();
      var userWithLikes = await _unitOfWork.LikesRepository.GetUserWithLikes(userId); 
      if (userWithLikes == null) return NotFound("User not found");  
      
      var likedUsers = userWithLikes.LikedUsers?.Select(ul => new LikeDto
      {
        // ul means UserLike 
        Username = ul.LikedUser.UserName,
        // KnownAs = ul.LikedUser.KnownAs,
        // Age = ul.LikedUser.DateOfBirth.CalculateAge(),
        // PhotoUrl = ul.LikedUser.Photos.FirstOrDefault(p => p.IsMain).Url,
        // City = ul.LikedUser.City,
        // Id = ul.LikedUser.Id
      }); 

      return Ok(likedUsers); 
    }
  }
}