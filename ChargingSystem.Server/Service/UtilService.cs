using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore; // 必须有这个
using System.Linq;

namespace ChargingSystem.Server
{
    public class UtilService
    {
        private readonly AppDbContext _context;

        public UtilService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardInfo> GetDashboardInfo(int queryYear, int queryMonth)
        {
            int year = queryYear;
            int month = queryMonth;
            DashboardInfo info = new DashboardInfo() { TotalHours = "0", TotalMoney = "0" };
            var consumes = await _context.Consumes
                .Where(c => c.Date.Year == year && c.Date.Month == month)
                .OrderByDescending(c => c.Date) // 通常按日期排序
                .ToListAsync();

            var rechargeIds = consumes.Select(c => c.RechargeId).Distinct().ToList();
            var rechargesDict = await _context.Recharges
                .Where(r => rechargeIds.Contains(r.Id))
                .ToDictionaryAsync(r => r.Id);

            decimal totalHours = consumes.Sum(c => c.Hour);
            decimal totalMoney = 0;
            foreach (var c in consumes)
            {
                // 确保能找到对应的充值记录
                if (rechargesDict.TryGetValue(c.RechargeId, out var r))
                {
                    // 公式: (RechargePrice - CostAtTime) * Hour
                    totalMoney += (r.RechargePrice - c.CostAtTime) * c.Hour;
                }
            }

            info.TotalHours = totalHours.ToString();
            info.TotalMoney = totalMoney.ToString("F2");
            info.TeacherCount = (await _context.Teachers.CountAsync()).ToString();
            info.StudentCount = (await _context.Recharges
                .Where(r => rechargeIds.Contains(r.Id))
                .Select(r => r.StudentId) // 只取 StudentId
                .Distinct()               // 去重：一个学生可能有多笔充值记录
                .CountAsync()).ToString();            // 统计总数
            return info;
        }
    }
}
