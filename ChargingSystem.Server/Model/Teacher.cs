using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Teacher
    {
        [Key]
        public Guid Teacher_Id { get; set; }
        public string Name { get; set; }
        public string Subject { get; set; }
    }

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
    }
}
