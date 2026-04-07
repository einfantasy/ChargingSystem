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
        public string Student_Id { get; set; }

        public string Teacher_Id { get; set; }

        public decimal Recharge_Amount { get; set; }

        public int Recharge_Hour { get; set; }

        public string Date { get; set; }

        public decimal Cost { get; set; }
    }
}
