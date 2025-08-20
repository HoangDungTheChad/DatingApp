using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.SignalR
{
  // this is going to be a service to be shared among every  
  // single connection that comes in our server
  public class PresenceTracker
  {
    // Using a dictionary to keep track of who is online is not scalable when we 
    // have multiple servers, but in this case there's a single server so  
    // I choose the simplest solution possible, we store their connection ids
    // with username as the key (they can login their account in multiple devices!) 
    private static readonly Dictionary<string, List<string>> OnlineUsers =
      new Dictionary<string, List<string>>();

    public Task<bool> UserConnected(string username, string connectionId)
    {
      bool isOnline = false; // is the user online for the first time (no other devices connected )
      // our dict is not a thread safe resource, so if multiple users update  
      // it at the same time we're going to run into problems  
      lock (OnlineUsers)
      {
        if (OnlineUsers.ContainsKey(username))
        {
          // remember user can connected our app using multiple devices 
          OnlineUsers[username].Add(connectionId);
        }
        else
        {
          OnlineUsers.Add(username, new List<string> { connectionId });
          isOnline = true;
        }
      }

      return Task.FromResult(isOnline);
    }

    public Task<bool> UserDisconnected(string username, string connectionId)
    {
      bool isOffline = false; // Is the user really offline or their other devices still connected ? 
      lock (OnlineUsers)
      {
        if (!OnlineUsers.ContainsKey(username)) return Task.FromResult(isOffline);

        OnlineUsers[username].Remove(connectionId);

        if (OnlineUsers[username].Count == 0)
        {
          OnlineUsers.Remove(username);
          isOffline = true; 
        }

        return Task.FromResult(isOffline);
      }
    }

    public Task<string[]> GetOnlineUsers()
    {
      string[] onlineUsers;

      lock (OnlineUsers)
      {
        onlineUsers = OnlineUsers.OrderBy(item => item.Key).Select(item => item.Key).ToArray();
      }

      return Task.FromResult(onlineUsers);
    }

    public Task<List<string>> GetConnectionsForUser(string username)
    {
      List<string> connectionIds;
      lock (OnlineUsers)
      {
        connectionIds = OnlineUsers.GetValueOrDefault(username);
      }
      return Task.FromResult(connectionIds);
    }
  }
}