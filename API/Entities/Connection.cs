using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
  public class Connection
  {
    public Connection()
    {
      // generate a default constructor for EF Core 
      // only neccessary if you define other custom constructor on your own
    }

    public Connection(string connectionId, string username)
    {
      ConnectionId = connectionId;
      Username = username;
    }

    public string ConnectionId { get; set; }
    public string Username { get; set; }
  }
}