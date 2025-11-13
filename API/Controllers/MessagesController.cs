using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
  [Authorize]
  public class MessagesController : BaseApiController
  {
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MessagesController(IUnitOfWork unitOfWork, IMapper mapper)
    {
      _unitOfWork = unitOfWork;
      _mapper = mapper;
    }

    // // Remove this, we got this functionality inside our signalR Hub 
    // [HttpPost]
    // public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    // {
    //   var username = User.GetUserName();
    //   if (username == createMessageDto.RecipientUserName.ToLower())
    //     return BadRequest("You cannot send messages to yourself");

    //   var sender = await _userRepository.GetUserByUsernameAsync(username);
    //   var recipient = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUserName);

    //   if (recipient == null) return NotFound();

    //   var message = new Message()
    //   {
    //     Sender = sender,
    //     SenderUsername = sender.UserName,
    //     Recipient = recipient,
    //     RecipientUsername = recipient.UserName,
    //     Content = createMessageDto.Content
    //   };

    //   _unitOfWork.MessageRepository.AddMessage(message);

    //   if (await _unitOfWork.MessageRepository.SaveAllAsync()) return Ok(_mapper.Map<MessageDto>(message));

    //   return BadRequest("Failed to send message");
    // }

    //---------------------------------------------

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUsers([FromQuery] MessageParams messageParams)
    {
      messageParams.Username = User.GetUserName();

      var messages = await _unitOfWork.MessageRepository.GetMessagesForUser(messageParams);

      Response.AddPaginationHeader(messages.CurrentPage, messages.PageSize,
         messages.TotalCount, messages.TotalPages);

      return messages;
    }

    // Remove this, we got this functionality inside our signalR hub 
    [HttpGet("thread/{username}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
    {
      var currentUsername = User.GetUserName();
      var recipientUsername = username;

      return Ok(await _unitOfWork.MessageRepository.GetMessageThread(currentUsername, recipientUsername));
    }

    // Get the total number of unread messages that I have   
    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
      var username = User.GetUserName();

      var unreadCount = await _unitOfWork.MessageRepository.GetUnreadCount(username); 
      
      return unreadCount; 
    }

    // Get unread count from a sender  
    [HttpGet("unread-count-from/{senderUsername}")]
    public async Task<ActionResult<int>> GetUnreadCountFrom(string senderUsername)
    {
      var username = User.GetUserName();
      var unreadCount = await _unitOfWork.MessageRepository.GetUnreadCountFrom(username, senderUsername); 
      return unreadCount; 
    }
    
    // make the delete route strictly numeric 
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
      var username = User.GetUserName();

      var message = await _unitOfWork.MessageRepository.GetMessage(id);

      // IMPORTANT: always remember to eagerly load Sender and Recipient 
      if (message.Sender.UserName != username && message.Recipient.UserName != username)
      {
        // this message has nothing to do with current user 
        return Unauthorized();
      }

      if (message.Sender.UserName == username)
      {
        message.SenderDeleted = true;
      }

      if (message.Recipient.UserName == username)
      {
        message.RecipientDeleted = true;
      }

      if (message.SenderDeleted && message.RecipientDeleted)
      {
        _unitOfWork.MessageRepository.DeleteMessage(message);
      }

      if (await _unitOfWork.Complete()) return Ok();

      return BadRequest("Problem deleting the message");
    }
  }
}