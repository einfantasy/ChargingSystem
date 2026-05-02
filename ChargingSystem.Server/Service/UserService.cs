using Microsoft.EntityFrameworkCore;

namespace ChargingSystem.Server
{
    public class UserService
    {
        private readonly AppDbContext _context;
        private readonly PasswordService _passwordService;

        public UserService(AppDbContext context, PasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        public async Task<List<User>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<User?> GetUsersByName(string name)
        {
            return await _context.Users
                    .FirstOrDefaultAsync(u => u.Name == name);
        }

        public async Task<User> RegisterUserAsync(string username, string password)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = username,
                Password = _passwordService.HashPassword(password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> UpdateUserPasswordAsync(string name, string newPassword)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Name == name);

            if (user == null)
                return false;

            user.Password = _passwordService.HashPassword(newPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task SeedDefaultAdminAsync()
        {
            if (await _context.Users.AnyAsync())
                return;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = "admin",
                Password = _passwordService.HashPassword("admin123"),
                AuthLevel = 0
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
    }
}
