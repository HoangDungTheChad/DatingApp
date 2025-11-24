using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace API.SignalR
{
  [Route("[controller]")]
  public class FallbackController : Controller
  {
    public ActionResult Index() {
      return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "browser", "index.html"), "text/html"); 
    }
  }
}