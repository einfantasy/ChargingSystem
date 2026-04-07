using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Consume
    {
        [Key]
        public Guid Id { get; set; }

        public Guid Student_Id { get; set; }

        public int Course_Type { get; set; } = 0;

        public int Hour { get; set; }

        public DateTime Date { get; set; }

        public Guid Teacher_Id { get; set; }
    }

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
    }
}
