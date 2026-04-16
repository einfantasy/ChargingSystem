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
    }

    public class StudentBalanceDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public Guid RechargeId { get; set; }
        public decimal RemainingHours { get; set; }
        public decimal Cost { get; set; }
    }

    public class ConsumeDto
    {
        public Guid RechargeId { get; set; }
        public Guid TeacherId { get; set; }
        public decimal Hour { get; set; }
        public DateTime Date { get; set; }
        public decimal Cost { get; set; }
    }

    public class ConsumeListDto
    {
        public Guid Id { get; set; }
        public Guid RechargeId { get; set; }
        public string TeacherName { get; set; }
        public string Subject { get; set; }
        public DateTime Date { get; set; }
        public decimal Hour { get; set; }
    }
}
