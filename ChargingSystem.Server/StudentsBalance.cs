using Microsoft.EntityFrameworkCore;

namespace ChargingSystem.Server
{
    public class StudentsBalance
    {
        public Guid Student_Id { get; set; }
        public string Name { get; set; }
        public decimal Balance { get; set; }
    }

    public class StudentsBalanceService
    {
        private readonly AppDbContext _context;

        public StudentsBalanceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentsBalance>> GetStudentsBalance()
        {
            return await _context.StudentsBalanceList.ToListAsync();
        }
    }
}
