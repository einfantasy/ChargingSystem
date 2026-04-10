using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Student
    {
        [Key]
        public Guid StudentId { get; set; }
        public string Name { get; set; }
    }
}
