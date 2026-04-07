using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Recharge
    {
        [Key]
        public Guid Id { get; set; }

        public Guid Student_Id { get; set; }

        public decimal Recharge_Amount { get; set; }

        public int Recharge_Hour { get; set; }

        public int Course_Type { get; set; } = 0;

        public DateTime Date { get; set; }

        public decimal Cost { get; set; } = 0;

        public Guid Teacher_Id { get; set; }
    }

    public class RechargeService
    {
        private readonly AppDbContext _context;

        public RechargeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Recharge>> GetResumeList()
        {
            return await _context.Recharges.ToListAsync();
        }
    }
}
