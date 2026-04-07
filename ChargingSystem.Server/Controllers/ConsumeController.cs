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
        public async Task<IActionResult> AddConsume([FromBody] Consume consume)
        {
            await _service.AddConsumeAsync(consume);
            return Ok(new
            {
                success = true
            });
        }
    }
}
