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
    private readonly IUserRepository _userRepository;
    private readonly ILikesRepository _likesRepository;
    public LikesController(ILikesRepository likesRepository, IUserRepository userRepository)
    {
      _likesRepository = likesRepository;
      _userRepository = userRepository;
    }

    [HttpPost("{username}")]
    public async Task<ActionResult> AddLike(string username)
    {
      var sourceUserId = User.GetUserId();
      var likedUser = await _userRepository.GetUserByUsernameAsync(username);
      var sourceUser = await _likesRepository.GetUserWithLikes(sourceUserId);

      // we can't find the user that they wanted to like 
      if (likedUser == null) return NotFound();

      if (sourceUser.UserName == username) return BadRequest("You cannot like yourself");

      var userLike = await _likesRepository.GetUserLike(sourceUserId, likedUser.Id);
      if (userLike != null) return BadRequest("You already liked this user");

      userLike = new UserLike
      {
        SourceUserId = sourceUserId,
        LikedUserId = likedUser.Id
      };

      sourceUser.LikedUsers.Add(userLike);

      // be careful with saving changes, later we'll use an alternative  
      // approach (unit of work)
      if (await _userRepository.SaveAllAsync()) return Ok();

      return BadRequest("Failed to save user");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery] LikesParams likesParams)
    {
      likesParams.UserId = User.GetUserId(); 
      var users = await _likesRepository.GetUserLikes(likesParams);

      Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages); 
      
      return Ok(users); 
    }
  }
}