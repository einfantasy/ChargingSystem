using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        if (model.Username == "admin" && model.Password == "123456")
        {
            // 设置过期时间，例如 30 分钟后
            var expiresInMinutes = 30;
            var expirationTime = DateTime.UtcNow.AddMinutes(expiresInMinutes);

            return Ok(new
            {
                token = "fake-jwt-token",
                username = model.Username,
                // 将过期时间以 ISO 格式字符串或 Unix 时间戳返回
                expiresAt = expirationTime,
                expiresIn = expiresInMinutes * 60 // 以秒为单位，方便前端计算
            });
        }
        return Unauthorized("用户名或密码错误");
    }
}

public class LoginModel
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}