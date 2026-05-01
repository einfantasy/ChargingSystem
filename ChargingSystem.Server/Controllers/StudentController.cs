using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChargingSystem.Server
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly StudentService _service;

        public StudentController(StudentService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddStudent([FromBody] Student student)
        {
            await _service.AddStudentAsync(student);
            return Ok(new
            {
                success = true
            });
        }

        [Authorize]
        [HttpGet("list")]
        public async Task<IActionResult> GetStudents()
        {
            var data = await _service.GetStudents();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("history")]
        public async Task<IActionResult> GetStudentHistory([FromQuery] Guid studentId)
        {
            var result = await _service.GetStudentHistoryAsync(studentId);

            if (result == null)
                return NotFound(new { message = "Student not found or no records" });

            return File(result.PdfBytes, "application/pdf", result.FileName);
        }
    }
}
