namespace ChargingSystem.Server
{
    public class StudentCourseService
    {
        private readonly AppDbContext _context;

        public StudentCourseService(AppDbContext context)
        {
            _context = context;
        }
    }
}
