using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Helpers
{
  // We need to add this class as a service 
  public class LogUserActivity : IAsyncActionFilter
  {
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
      // So now we get access to the context after the  
      // action has been executed 
      var resultContext = await next();

      // Check if user is not authenticated   
      if (!resultContext.HttpContext.User.Identity.IsAuthenticated) return;

      // the user is authenticated, now let's update their lastActive prop 
      var userId = resultContext.HttpContext.User.GetUserId();
      var repo = resultContext.HttpContext.RequestServices.GetService<IUserRepository>();
      var user = await repo.GetUserByIdAsync(userId);
      user.LastActive = DateTime.Now;

      await repo.SaveAllAsync();
    }
  }
}