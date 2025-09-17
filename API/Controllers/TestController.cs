using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
    
namespace API.Controllers
{

  public class TestController : BaseApiController
  {
    [HttpGet("boss")]
    public ActionResult<string> GetBossName()
    {
      return "Le Hoang Dung"; 
    }
  }
}