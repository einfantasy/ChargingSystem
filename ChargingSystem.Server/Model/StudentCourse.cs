using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class StudentCourse
    {
        [Key]
        public Guid Id { get; set; }
        public string Student_Id { get; set; }
        public string Teacher_Id { get; set; }
    }

    public class StudentCourseService
    {
        private readonly AppDbContext _context;

        public StudentCourseService(AppDbContext context)
        {
            _context = context;
        }
    }
}
