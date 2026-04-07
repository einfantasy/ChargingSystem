using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class Recharge
    {
        [Key]
        public Guid Id { get; set; }

        public Guid StudentCourse_Id { get; set; }

        public decimal Recharge_Amount { get; set; }

        public int Recharge_Hour { get; set; }

        public decimal Cost { get; set; } = 0;

        public DateTime Date { get; set; }
    }
}
