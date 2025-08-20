using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
  public class Message
  {
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderUsername { get; set; }
    public AppUser Sender { get; set; }
    public int RecipientId { get; set; }
    public string RecipientUsername { get; set; }
    public AppUser Recipient { get; set; }
    public string Content { get; set; }
    // Can be null if the message has not been read 
    public DateTime DateSent { get; set; } = DateTime.UtcNow;
    public DateTime? DateRead { get; set; }
    // Delete the msg from sender's view, not from recipient's 
    public bool SenderDeleted { get; set; }
    // If both set to true, delete the msg from the server 
    public bool RecipientDeleted { get; set; }
  }
}