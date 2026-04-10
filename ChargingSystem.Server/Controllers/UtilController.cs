using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChargingSystem.Server
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtilController : ControllerBase
    {
        private readonly UtilService _service;

        public UtilController(UtilService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> AddStudent()
        {
            var data = await _service.GetDashboardInfo();
            return Ok(data);
        }
    }

    public class DashboardInfo()
    {
        public string TotalHours { get; set; }
        public string TotalMoney { get; set; }
        public string TeacherCount { get; set; }
        public string StudentCount { get; set; }
    }
}
