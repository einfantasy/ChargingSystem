using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Student
    {
        [Key]
        public Guid Student_Id { get; set; }
        public string Name { get; set; }
    }
}
