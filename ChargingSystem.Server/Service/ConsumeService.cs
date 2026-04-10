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

        public async Task AddConsumeAsync(ConsumeDto consume)
        {
            // 生成子消耗记录（解决跨单价问题）
            Consume consumeRecord = new Consume()
            {
                Id = Guid.NewGuid(), // 修正：使用 Guid.NewGuid()
                RechargeId = consume.RechargeId,
                Hour = consume.Hour,
                Date = consume.Date,
                CostAtTime = consume.TeacherId == Guid.Parse("7DCCBBB6-8B4A-420C-B1BE-500ED93F1697") ? 0 : consume.Cost,
            };

            await _context.Consumes.AddAsync(consumeRecord);
            await _context.SaveChangesAsync();
        }

        public async Task<List<StudentBalanceDto>> GetBalanceListAsync()
        {
            var sql = @"
                SELECT 
                    s.StudentId as StudentId,
                    s.Name AS StudentName,
                    r.RechargeId AS RechargeId, 
                    (COALESCE(r.TotalRecharge, 0) - COALESCE(c.TotalConsume, 0)) AS RemainingHours,
                    COALESCE(r.TotalCost, 0) AS Cost
                FROM Students s
                -- 关联充值汇总
                LEFT JOIN (
                    SELECT 
                        StudentId, 
                        RechargeHour AS TotalRecharge,
                        Cost AS TotalCost,
                        Id AS RechargeId
                    FROM Recharges 
                ) r ON s.StudentId = r.StudentId
                -- 关联消费汇总
                LEFT JOIN (
                    SELECT 
                        SUM(Hour) AS TotalConsume,
                        RechargeId
                    FROM Consumes 
                    GROUP BY RechargeId
                ) c ON r.RechargeId = c.RechargeId
                -- 关键修改：过滤掉没有充值记录的行
                WHERE r.RechargeId IS NOT NULL
                ORDER BY RemainingHours DESC";

            // 2. 执行查询
            var results = await _context.Database
                .SqlQueryRaw<StudentBalanceDto>(sql)
                .ToListAsync();

            return results;
        }
    }
}
