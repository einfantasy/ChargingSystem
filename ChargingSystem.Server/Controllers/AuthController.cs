using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;

    public AuthController(UserService userService)
    {
        _userService = userService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _userService.GetUsersByName(model.Username);

        if (user == null)
        {
            return Unauthorized("用户不存在");
        }

        if (user.Password != model.Password)
        {
            return Unauthorized("密码错误");
        }

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
}

public class LoginModel
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}