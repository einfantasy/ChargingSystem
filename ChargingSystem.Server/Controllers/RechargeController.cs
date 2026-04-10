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
    }

    public class RechargeDto
    {
        public string StudentId { get; set; }

        public decimal RechargePrice { get; set; }

        public decimal RechargeHour { get; set; }

        public string Date { get; set; }

        public decimal Cost { get; set; }
    }
}
