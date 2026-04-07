using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChargingSystem.Server
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeacherController : ControllerBase
    {
        private readonly TeacherService _service;

        public TeacherController(TeacherService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet("list")]
        public async Task<IActionResult> GetTeachers()
        {
            var data = await _service.GetTeachers();
            return Ok(data);
        }
    }
}
