using Microsoft.EntityFrameworkCore;

namespace ChargingSystem.Server
{
    public class ConsumeService
    {
        private readonly AppDbContext _context;

        public ConsumeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Consume>> GetConsumeList()
        {
            return await _context.Consumes.ToListAsync();
        }

        public async Task AddConsumeAsync(Consume consume)
        {
            await _context.Consumes.AddAsync(consume);
            await _context.SaveChangesAsync();
        }
    }
}
