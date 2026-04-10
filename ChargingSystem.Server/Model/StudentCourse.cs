using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChargingSystem.Server
{
    public class StudentCourse
    {
        [Key]
        public Guid Id { get; set; }
        public Guid Student_Id { get; set; }
        public Guid Teacher_Id { get; set; }
    }
}
