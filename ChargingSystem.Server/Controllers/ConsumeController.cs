using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChargingSystem.Server
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsumeController : ControllerBase
    {
        private readonly ConsumeService _service;

        public ConsumeController(ConsumeService service)
        {
            _service = service;
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
            var data = await _service.GetContribution(queryYear);
            return Ok(data);
        }
    }
}
