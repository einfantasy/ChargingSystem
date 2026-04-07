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

        public async Task<List<Recharge>> GetResumeList()
        {
            return await _context.Recharges.ToListAsync();
        }

        public async Task AddRechargeAsync(RechargeDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1️⃣ 判断 StudentCourses 是否已存在
                var exists = await _context.StudentCourses
                    .AnyAsync(x => x.Student_Id == dto.Student_Id
                                && x.Teacher_Id == dto.Teacher_Id);

                Guid scId = Guid.NewGuid();
                if (!exists)
                {
                    var course = new StudentCourse
                    {
                        Id = scId,
                        Student_Id = dto.Student_Id,
                        Teacher_Id = dto.Teacher_Id
                    };

                    _context.StudentCourses.Add(course);
                }

                // 2️⃣ 插入 Recharge
                var recharge = new Recharge
                {
                    Id = Guid.NewGuid(),
                    StudentCourse_Id = scId,
                    Recharge_Amount = dto.Recharge_Amount,
                    Recharge_Hour = dto.Recharge_Hour,
                    Cost = dto.Cost,
                    Date = DateTime.Parse(dto.Date)
                };

                _context.Recharges.Add(recharge);

                // 3️⃣ 一次性提交
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
