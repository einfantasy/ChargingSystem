using Microsoft.EntityFrameworkCore;

namespace ChargingSystem.Server
{
    public class TeacherService
    {
        private readonly AppDbContext _context;

        public TeacherService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Teacher>> GetTeachers()
        {
            return await _context.Teachers.ToListAsync();
        }

        public async Task AddTeacherAsync(Teacher teacher)
        {
            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveTeacherAsync(string teacherId)
        {
            // 使用 FindAsync 异步查找
            var teacher = await _context.Teachers.FindAsync(Guid.Parse(teacherId));

            if (teacher != null)
            {
                _context.Teachers.Remove(teacher);
                // 使用 SaveChangesAsync 异步保存
                await _context.SaveChangesAsync();
            }
        }
    }
}
