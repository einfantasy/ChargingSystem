using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ChargingSystem.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly JwtService _jwtService;
        private readonly PasswordService _passwordService;
        private readonly UserService _userService;

        public AuthController(JwtService jwtService, PasswordService passwordService, UserService userService)
        {
            _jwtService = jwtService;
            _passwordService = passwordService;
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

            if (!_passwordService.VerifyPassword(model.Password, user.Password))
            {
                return Unauthorized("密码错误");
            }

            var (tokenString, expiresAt) = _jwtService.GenerateToken(model.Username);

            return Ok(new
            {
                token = tokenString,
                username = model.Username,
                expiresAt = expiresAt,
                expiresIn = 30 * 60
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

                var (newToken, expiresAt) = _jwtService.GenerateToken(username);

                return Ok(new
                {
                    token = newToken,
                    username = username,
                    expiresAt = expiresAt,
                    expiresIn = 30 * 60
                });
            }
            catch
            {
                return Unauthorized("Token 刷新失败");
            }
        }
    }

    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
