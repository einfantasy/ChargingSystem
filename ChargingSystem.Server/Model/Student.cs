using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Student
    {
        [Key]
        public Guid Student_Id { get; set; }
        public string Name { get; set; }
    }

    public class StudentService
    {
        private readonly AppDbContext _context;

        public StudentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Student>> GetStudents()
        {
            return await _context.Students.ToListAsync();
        }

        public async Task AddStudentAsync(Student student)
        {
            await _context.Students.AddAsync(student);
            await _context.SaveChangesAsync();
        }
    }
}
