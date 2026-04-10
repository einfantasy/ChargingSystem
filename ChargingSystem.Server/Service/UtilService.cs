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

        public async Task<DashboardInfo> GetDashboardInfo()
        {
            int year = DateTime.Now.Year;
            int month = DateTime.Now.Month;
            DashboardInfo info = new DashboardInfo() { TotalHours = "0", TotalMoney = "0" };
            var results = await _context.Consumes
                .Where(c => c.Date.Year == year && c.Date.Month == month)
                .OrderByDescending(c => c.Date) // 通常按日期排序
                .ToListAsync();

            decimal totalHours = results.Sum(c => c.Hour);
            decimal totalMoney = 0;// Need to calculate later

            info.TotalHours = totalHours.ToString();
            info.TotalMoney = totalMoney.ToString();
            info.TeacherCount = (await _context.Teachers.CountAsync()).ToString();
            var scCollect = await _context.Consumes
                .Where(c => c.Date.Year == year && c.Date.Month == month)
                .Select(c => c.RechargeId).ToListAsync<Guid>();
            info.StudentCount = (await _context.StudentCourses.Where(sc => scCollect.Contains(sc.Id)).Select(sc => sc.Student_Id).Distinct().CountAsync()).ToString();
            return info;
        }
    }
}
