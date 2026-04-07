using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChargingSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentBalanceController : ControllerBase
    {
        private readonly StudentsBalanceService _service;

        public StudentBalanceController(StudentsBalanceService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("balance")]
        public async Task<IActionResult> GetStudentsBalance()
        {
            var data = await _service.GetStudentsBalance();
            return Ok(data);
        }
    }
}
