using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
  [Authorize]
  public class PresenceHub : Hub
  {
    private readonly PresenceTracker _tracker;
    public PresenceHub(PresenceTracker presenceTracker)
    {
      _tracker = presenceTracker;
    }
    public override async Task OnConnectedAsync()
    {
      // update the presence tracker 
      var isOnline = await _tracker.UserConnected(Context.User.GetUserName(), Context.ConnectionId);
      if (isOnline)
      {
        // first time connected to the app 
        await Clients.Others.SendAsync("UserIsOnline", Context.User.GetUserName());
      }

      await Clients.Others.SendAsync("UserIsOnline", Context.User.GetUserName());

      var currentUsers = await _tracker.GetOnlineUsers();
      // await Clients.All.SendAsync("GetOnlineUsers", currentUsers); // send the updated online users list 
      await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);
    }

    public override async Task OnDisconnectedAsync(Exception ex)
    {
      var isOffline = await _tracker.UserDisconnected(Context.User.GetUserName(), Context.ConnectionId);
      if (isOffline)
      {
        // they genuinely gone offline, no other devices connected; 
        await Clients.Others.SendAsync("UserIsOffline", Context.User.GetUserName());
      }

      // var currentUsers = await _tracker.GetOnlineUsers();  
      // await Clients.All.SendAsync("GetOnlineUsers", currentUsers); 

      await base.OnDisconnectedAsync(ex);
    }
  }
}