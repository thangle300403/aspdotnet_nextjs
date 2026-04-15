using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QLSV.Data;
using QLSV.Models;

namespace QLSV.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private const string RefreshTokenCookieName = "refreshToken";
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromMinutes(1);

        private void SetRefreshTokenCookie(string refreshToken)
        {
            Response.Cookies.Append(
                RefreshTokenCookieName,
                refreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.Add(RefreshTokenLifetime),
                    Path = "/api/auth"
                }
            );
        }

        private void ClearRefreshTokenCookie()
        {
            Response.Cookies.Delete(
                RefreshTokenCookieName,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Path = "/api/auth"
                }
            );
        }

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Email hoac mat khau khong dung." });
            }

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Email hoac mat khau khong dung." });
            }

            var accessToken = GenerateToken(user, "access", DateTime.UtcNow.AddMinutes(0.5));
            var refreshToken = GenerateToken(user, "refresh", DateTime.UtcNow.Add(RefreshTokenLifetime));

            SetRefreshTokenCookie(refreshToken);

            return Ok(new
            {
                message = "Dang nhap thanh cong.",
                accessToken,
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return Unauthorized(new { message = "Hết phiên đăng nhập." });
            }

            try
            {
                var principal = ValidateToken(refreshToken);
                var tokenType = principal.FindFirst("token_type")?.Value;

                if (tokenType != "refresh")
                {
                    return Unauthorized(new { message = "Token cung cap khong phai refresh token." });
                }

                var email = principal.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrWhiteSpace(email))
                {
                    return Unauthorized(new { message = "Refresh token khong hop le." });
                }

                var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
                if (user == null)
                {
                    return Unauthorized(new { message = "Nguoi dung khong ton tai." });
                }

                var accessToken = GenerateToken(user, "access", DateTime.UtcNow.AddMinutes(1));

                return Ok(new
                {
                    message = "Cap moi access token thanh cong.",
                    accessToken
                });
            }
            catch (SecurityTokenExpiredException)
            {
                ClearRefreshTokenCookie();
                return Unauthorized(new { message = "Refresh token da het han." });
            }
            catch
            {
                ClearRefreshTokenCookie();
                return Unauthorized(new { message = "Refresh token khong hop le." });
            }
        }

        private ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
                ),
                ClockSkew = TimeSpan.Zero
            };

            return tokenHandler.ValidateToken(token, validationParameters, out _);
        }

        private string GenerateToken(User user, string tokenType, DateTime expires)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role_id.ToString()),
                new Claim("token_type", tokenType)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
            );

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
