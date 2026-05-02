using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChargingSystem.Server
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtilController : ControllerBase
    {
        private readonly UtilService _service;
        private readonly UserService _userService;

        public UtilController(UtilService service, UserService userService)
        {
            _service = service;
            _userService = userService;
        }

        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardInfo([FromQuery] string queryYear, [FromQuery] string queryMonth)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var authLevelStr = User.FindFirstValue("AuthLevel");
            var authLevel = int.TryParse(authLevelStr, out var al) ? al : 0;

            DashboardInfoDto result;
            if (authLevel != 0 && username != null)
            {
                var user = await _userService.GetUsersByName(username);
                if (user?.TeacherId.HasValue == true)
                {
                    result = await _service.GetDashboardInfo(int.Parse(queryYear), int.Parse(queryMonth), user.TeacherId.Value);
                    return Ok(result);
                }
            }

            result = await _service.GetDashboardInfo(int.Parse(queryYear), int.Parse(queryMonth));
            return Ok(result);
        }
    }
}

    
