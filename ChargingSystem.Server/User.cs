using Microsoft.EntityFrameworkCore;

namespace ChargingSystem.Server
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public string Password { get; set; }
    }

    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
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
    }
}