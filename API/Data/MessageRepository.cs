using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query.Internal;

namespace API.Data
{
  public class MessageRepository : IMessageRepository
  {
    private readonly DataContext _context;
    private readonly IMapper _mapper;

    public MessageRepository(DataContext context, IMapper mapper)
    {
      _context = context;
      _mapper = mapper;
    }

    public void AddGroup(Group group)
    {
      _context.Groups.Add(group);
    }

    public void AddMessage(Message message)
    {
      _context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
      _context.Messages.Remove(message);
    }

    public async Task<Connection> GetConnection(string connectionId)
    {
      return await _context.Connections.FindAsync(connectionId);
    }

    public async Task<Group> GetGroupForConnection(string connectionId)
    {
      return await _context.Groups
        .Include(g => g.Connections)
        .Where(g => g.Connections.Any(x => x.ConnectionId == connectionId))
        .FirstOrDefaultAsync();
    }

    public async Task<Message> GetMessage(int id)
    {
      return await _context.Messages
        .Include(m => m.Sender)
        .Include(m => m.Recipient)
        .SingleOrDefaultAsync(m => m.Id == id);
    }

    public async Task<Group> GetMessageGroup(string groupName)
    {
      return await _context.Groups
        .Include(g => g.Connections)
        .FirstOrDefaultAsync(g => g.Name == groupName);
    }

    public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
    {
      var query = _context.Messages
        .OrderByDescending(m => m.DateSent) // order them by latest sent date 
        .AsQueryable();

      query = messageParams.Container switch
      {
        "Inbox" => query.Where(m => m.RecipientUsername == messageParams.Username && m.RecipientDeleted == false),
        "Outbox" => query.Where(m => m.SenderUsername == messageParams.Username && m.SenderDeleted == false),
        // Default case  
        _ => query.Where(m => m.RecipientUsername == messageParams.Username && m.RecipientDeleted == false && m.DateRead == null)
      };

      // this is a query, not messages yet, be careful with the name 
      var messages = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

      return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername)
    {
      var messages = await _context.Messages
        .Include(m => m.Sender).ThenInclude(u => u.Photos)
        .Include(m => m.Recipient).ThenInclude(u => u.Photos)
        .Where(m => m.Recipient.UserName == currentUsername && m.RecipientDeleted == false
                && m.Sender.UserName == recipientUsername
                || m.RecipientUsername == recipientUsername
                && m.Sender.UserName == currentUsername && m.SenderDeleted == false
        )
        .OrderBy(m => m.DateSent) // oldest to newest 
        .ToListAsync();

      var unreadMessages = messages.Where(m => m.DateRead == null
        && m.RecipientUsername == currentUsername).ToList();

      if (unreadMessages.Any())
      {
        foreach (var msg in unreadMessages)
        {
          msg.DateRead = DateTime.UtcNow;
        }

        // it's uow's job to save changes, check out MessageHub!
        // await _context.SaveChangesAsync();
      }
      // Map to DTOs
      var messageDtos = _mapper.Map<IEnumerable<MessageDto>>(messages);

      // 🔥 Force DateTimes to UTC kind, fuck automapper 
      // foreach (var dto in messageDtos)
      // {
      //   dto.DateRead = DateTime.SpecifyKind(dto.DateRead.Value, DateTimeKind.Utc);
      // }

      // return messageDtos;
      // return _mapper.Map<IEnumerable<MessageDto>>(messages); 
      return messageDtos; 
    }

    public async Task<int> GetUnreadCount(string username)
    {
      var count = await _context.Messages
        .Where(m => m.RecipientUsername == username
                  && !m.RecipientDeleted
                  && m.DateRead == null)
        .CountAsync(); 

      return count; 
    }

    public async Task<int> GetUnreadCountFrom(string username, string senderUsername)
    {
      var count = await _context.Messages
        .Where(m => m.RecipientUsername == username
          && !m.RecipientDeleted
          && m.SenderUsername == senderUsername
          && m.DateRead == null)
        .CountAsync(); 
      
      return count; 
    }

    public void RemoveConnection(Connection connection)
    {
      _context.Connections.Remove(connection);
    }
  }
}