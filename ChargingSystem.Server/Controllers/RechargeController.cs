using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChargingSystem.Server
{
    [ApiController]
    [Route("api/[controller]")]
    public class RechargeController : ControllerBase
    {
        private readonly RechargeService _service;

        public RechargeController(RechargeService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddRecharge([FromBody] RechargeDto dto)
        {
            await _service.AddRechargeAsync(dto);
            return Ok(new { success = true });
        }

        [Authorize]
        [HttpGet("query")]
        public async Task<IActionResult> GetRechargeList([FromQuery] string studentId)
        {
           var data = await _service.GetRechargeList(studentId);
            return Ok(data);
        }
    }
}
