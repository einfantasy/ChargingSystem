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
                TeacherId = consume.TeacherId,
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
                    ROUND((COALESCE(r.TotalRecharge, 0) - COALESCE(c.TotalConsume, 0)), 2) AS RemainingHours,
                    ROUND(COALESCE(r.TotalCost, 0), 2) AS Cost
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
                ORDER BY RemainingHours DESC, StudentName;";

            // 2. 执行查询
            var results = await _context.Database
                .SqlQueryRaw<StudentBalanceDto>(sql)
                .ToListAsync();

            return results;
        }

        public async Task<List<ConsumeListDto>> GetConsumeList(string rechargeId, string queryDate)
        {
            DateTime dt = DateTime.ParseExact(queryDate, "yyyy-MM", System.Globalization.CultureInfo.InvariantCulture);

            var result = await _context.Consumes
                .Where(c => c.RechargeId == Guid.Parse(rechargeId) && c.Date.Year == dt.Year && c.Date.Month == dt.Month)
                .Join(_context.Teachers,
                    c => c.TeacherId,
                    t => t.TeacherId,
                    (c, t) => new ConsumeListDto
                    {
                        Id = c.Id,
                        RechargeId = c.RechargeId,
                        TeacherName = t.Name,
                        Subject = t.Subject,
                        Date = c.Date,
                        Hour = c.Hour
                    })
                .OrderBy(re => re.Date)
                .ToListAsync();

            return result;
        }

        public async Task<List<ContributiontDto>> GetContribution(string queryYear)
        {
            var result = await _context.Consumes
                .Where(c => c.Date.Year == int.Parse(queryYear))          // 筛选指定年份
                .GroupBy(c => c.Date)                      // 按日期分组
                .Select(g => new ContributiontDto          // 投影到 DTO 类
                {
                    Date = g.Key,
                    Hour = g.Sum(c => c.Hour)              // 计算当天总课时
                })
                .OrderBy(x => x.Date)                      // 按日期升序排列
                .ToListAsync();                            // 异步执行并返回 List

            return result;
        }

        public async Task<List<ContributiontDto>> GetContribution(string queryYear, Guid teacherId)
        {
            var result = await _context.Consumes
                .Where(c => c.Date.Year == int.Parse(queryYear) && c.TeacherId == teacherId)          // 筛选指定年份和teacherId
                .GroupBy(c => c.Date)                      // 按日期分组
                .Select(g => new ContributiontDto          // 投影到 DTO 类
                {
                    Date = g.Key,
                    Hour = g.Sum(c => c.Hour)              // 计算当天总课时
                })
                .OrderBy(x => x.Date)                      // 按日期升序排列
                .ToListAsync();                            // 异步执行并返回 List

            return result;
        }
    }
}
