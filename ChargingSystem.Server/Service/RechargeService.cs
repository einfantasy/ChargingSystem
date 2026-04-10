using Microsoft.EntityFrameworkCore;

namespace ChargingSystem.Server
{
    public class RechargeService
    {
        private readonly AppDbContext _context;

        public RechargeService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Recharge>> GetRechargeList(string studentId)
        {
            return await _context.Recharges.Where(x => x.StudentId == Guid.Parse(studentId)).ToListAsync();
        }

        public async Task AddRechargeAsync(RechargeDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var recharge = new Recharge
                {
                    Id = Guid.NewGuid(),
                    StudentId = Guid.Parse(dto.StudentId),
                    RechargePrice = dto.RechargePrice,
                    RechargeHour = dto.RechargeHour,
                    Date = DateTime.Parse(dto.Date),
                    Cost = dto.Cost
                };

                _context.Recharges.Add(recharge);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
