using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
  public class MessageDto
  {
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderUsername { get; set; }
    // So we can display the image of the user sending the message
    public string SenderPhotoUrl { get; set; }
    public int RecipientId { get; set; }
    public string RecipientUsername { get; set; }
    public string RecipientPhotoUrl { get; set; }
    public string Content { get; set; }
    // Can be null if the message has not been read 
    public DateTime DateSent { get; set; }
    public DateTime? DateRead { get; set; }
  }
}