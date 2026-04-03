using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        // 这里仅作演示，实际应连接数据库并验证密码哈希
        if (model.Username == "admin" && model.Password == "123456")
        {
            return Ok(new { token = "fake-jwt-token", username = model.Username });
        }
        return Unauthorized("用户名或密码错误");
    }
}

public class LoginModel
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}