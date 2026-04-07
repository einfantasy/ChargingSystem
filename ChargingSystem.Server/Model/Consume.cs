using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Consume
    {
        [Key]
        public Guid Id { get; set; }

        public Guid StudentCourse_Id { get; set; }

        public int Hour { get; set; }

        public DateTime Date { get; set; }
    }
}
