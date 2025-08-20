using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
  public class MessageHub : Hub
  {
    private readonly IMessageRepository _messageRepository;
    private readonly IMapper _mapper;
    private readonly IUserRepository _userRepository;
    private readonly PresenceTracker _presenceTracker;
    private readonly IHubContext<PresenceHub> _presenceHub;
    public MessageHub(IMessageRepository messageRepository, IMapper mapper,
      IUserRepository userRepository, IHubContext<PresenceHub> presenceHub,
      PresenceTracker presenceTracker)
    {
      _presenceHub = presenceHub;
      _presenceTracker = presenceTracker;
      _messageRepository = messageRepository;
      _mapper = mapper;
      _userRepository = userRepository;
    }

    public override async Task OnConnectedAsync()
    {
      var httpContext = Context.GetHttpContext();
      var otherUser = httpContext.Request.Query["user"].ToString();

      // the group name is the combination of both usernames in alphabetical order  
      var groupName = GetGroupName(Context.User.GetUserName(), otherUser);
      await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
      var group = await AddToGroup(groupName);
      await Clients.Group(groupName).SendAsync("UpdatedGroup", group); 

      var messages = await _messageRepository.GetMessageThread(Context.User.GetUserName(), otherUser);

      await Clients.Caller.SendAsync("ReceiveMessageThread", messages);
    }

    public override async Task OnDisconnectedAsync(Exception ex)
    {
      var group = await RemoveFromGroup();
      await Clients.Group(group.Name).SendAsync("UpdatedGroup", group); 

      // automatically remove them from the group on disconnected  
      await base.OnDisconnectedAsync(ex);
    }

    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
      // copied code from Message controller and refactor a bit 
      var username = Context.User.GetUserName();
      if (username == createMessageDto.RecipientUserName.ToLower())
        // return BadRequest("You cannot send messages to yourself");
        throw new HubException("You cannot send messages to your self");

      var sender = await _userRepository.GetUserByUsernameAsync(username);
      var recipient = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUserName);

      if (recipient == null)
      {
        // return NotFound("Not found user"); 
        throw new HubException("Not found user");
      }

      var message = new Message()
      {
        Sender = sender,
        SenderUsername = sender.UserName,
        Recipient = recipient,
        RecipientUsername = recipient.UserName,
        Content = createMessageDto.Content
      };

      _messageRepository.AddMessage(message);

      // get hold of the group name  
      var groupName = GetGroupName(sender.UserName, recipient.UserName);
      var group = await _messageRepository.GetMessageGroup(groupName);

      if (group.Connections.Any(connection => connection.Username == createMessageDto.RecipientUserName))
      {
        // recipient connected to same group as the sender in message hub
        message.DateRead = DateTime.UtcNow;
      }
      else
      {
        // else means the recipient is not chatting with the sender 
        var connectionIds = await _presenceTracker.GetConnectionsForUser(recipient.UserName);
        if (connectionIds != null)
        {
          // that means the recipient is online and we can send the new message notification  
          await _presenceHub.Clients.Clients(connectionIds).SendAsync("NewMessageReceived",
            new { username = sender.UserName, knownAs = sender.KnownAs });

          // the payload SignalR delivers will look like this 
          // {
          //   "username": "someUser",
          //   "knownAs": "Some KnownAs"
          // }
        }
      }

      if (await _messageRepository.SaveAllAsync())
      {
        await Clients.Group(groupName).SendAsync("NewMessage", _mapper.Map<MessageDto>(message));
        // return Ok(_mapper.Map<MessageDto>(message));
      }

      // we don't return anything from this so the final line is unnecessary 
      // return BadRequest("Failed to send message");
    }

    private async Task<Group> AddToGroup(string groupName)
    {
      var group = await _messageRepository.GetMessageGroup(groupName);
      var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());

      if (group == null)
      {
        group = new Group(groupName);
        _messageRepository.AddGroup(group);
      }

      if (!group.Connections.Any(c => c.ConnectionId == connection.ConnectionId))
      {
        group.Connections.Add(connection);
      }

      // returning the group so they're always gonna know who is connected inside the group  
      // that they're in so we can check if the recipient has joined the grop and  
      // marked the messages as read 
      if (await _messageRepository.SaveAllAsync()) return group;  

      throw new HubException("Failied to add to group"); 

    }

    private async Task<Group> RemoveFromGroup()
    {
      var group = await _messageRepository.GetGroupForConnection(Context.ConnectionId);
      var connection = group.Connections.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId); 
      _messageRepository.RemoveConnection(connection);
      if(await _messageRepository.SaveAllAsync()) return group;

      throw new HubException("Failed to remove from group"); 
    }

    private string GetGroupName(string caller, string other)
    {
      var stringCompare = string.CompareOrdinal(caller, other) < 0;
      return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
    }
  }
}