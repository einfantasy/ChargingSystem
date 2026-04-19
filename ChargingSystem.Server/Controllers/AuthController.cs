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

            var expiresInMinutes = 30;
            var expirationTime = DateTime.UtcNow.AddMinutes(expiresInMinutes);

            var (tokenString, _) = GenerateJwtToken(model.Username, expirationTime);

            return Ok(new
            {
                token = tokenString,
                username = model.Username,
                expiresAt = expirationTime,
                expiresIn = expiresInMinutes * 60
            });
        }

        [HttpPost("refresh")]
        public IActionResult RefreshToken()
        {
            var currentToken = Request.Headers.Authorization.ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(currentToken))
            {
                return Unauthorized("无效的 token");
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(currentToken);
                var username = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

                if (string.IsNullOrEmpty(username))
                {
                    return Unauthorized("无效的用户信息");
                }

                var expiresInMinutes = 30;
                var expirationTime = DateTime.UtcNow.AddMinutes(expiresInMinutes);
                var (newToken, _) = GenerateJwtToken(username, expirationTime);

                return Ok(new
                {
                    token = newToken,
                    username = username,
                    expiresAt = expirationTime,
                    expiresIn = expiresInMinutes * 60
                });
            }
            catch
            {
                return Unauthorized("Token 刷新失败");
            }
        }

        private (string token, DateTime expiry) GenerateJwtToken(string username, DateTime expirationTime)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("{D9277D00-D1FC-4411-B23A-4C2571CC7C6C}"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username)
            };

            var token = new JwtSecurityToken(
                issuer: "ChargingSystem",
                audience: "ChargingSystem",
                claims: claims,
                expires: expirationTime,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return (tokenString, expirationTime);
        }
    }

    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}