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
    }
}
