using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Teacher
    {
        [Key]
        public Guid TeacherId { get; set; }
        public string Name { get; set; }
        public string Subject { get; set; }
    }
}
