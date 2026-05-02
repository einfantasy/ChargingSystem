using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChargingSystem.Server
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsumeController : ControllerBase
    {
        private readonly ConsumeService _service;
        private readonly UserService _userService;

        public ConsumeController(ConsumeService service, UserService userService)
        {
            _service = service;
            _userService = userService;
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddConsume([FromBody] ConsumeDto consume)
        {
            await _service.AddConsumeAsync(consume);
            return Ok(new
            {
                success = true
            });
        }

        [Authorize]
        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            var data = _service.GetBalanceListAsync();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("query")]
        public async Task<IActionResult> GetConsumeList([FromQuery] string rechargeId, [FromQuery] string queryDate)
        {
            var data = await _service.GetConsumeList(rechargeId, queryDate);
            return Ok(data);
        }

        [Authorize]
        [HttpGet("query_contribution")]
        public async Task<IActionResult> GetContribution([FromQuery] string queryYear)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            var authLevelStr = User.FindFirstValue("AuthLevel");
            var authLevel = int.TryParse(authLevelStr, out var al) ? al : 0;

            if (authLevel != 0 && username != null)
            {
                var user = await _userService.GetUsersByName(username);
                if (user?.TeacherId.HasValue == true)
                {
                    var data = await _service.GetContribution(queryYear, user.TeacherId.Value);
                    return Ok(data);
                }
            }

            var allData = await _service.GetContribution(queryYear);
            return Ok(allData);
        }
    }
}
