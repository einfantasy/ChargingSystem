using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ChargingSystem.Server.Controllers
{
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

            //// 设置过期时间，例如 30 分钟后
            //var expiresInMinutes = 30;
            //var expirationTime = DateTime.UtcNow.AddMinutes(expiresInMinutes);

            //return Ok(new
            //{
            //    token = "fake-jwt-token",
            //    username = model.Username,
            //    // 将过期时间以 ISO 格式字符串或 Unix 时间戳返回
            //    expiresAt = expirationTime,
            //    expiresIn = expiresInMinutes * 60 // 以秒为单位，方便前端计算
            //});

            var expiresInMinutes = 30;
            var expirationTime = DateTime.UtcNow.AddMinutes(expiresInMinutes);

            // 密钥（建议放配置文件）
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("{D9277D00-D1FC-4411-B23A-4C2571CC7C6C}"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 载荷（用户信息）
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, model.Username)
            };

            var token = new JwtSecurityToken(
                issuer: "ChargingSystem",
                audience: "ChargingSystem",
                claims: claims,
                expires: expirationTime,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString, // ✅ 真 token
                username = model.Username,
                expiresAt = expirationTime,
                expiresIn = expiresInMinutes * 60
            });
        }
    }

    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}