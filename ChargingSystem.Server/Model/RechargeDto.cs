using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class RechargeDto
    {
        public required string StudentId { get; set; }

        public decimal RechargePrice { get; set; }

        public decimal RechargeHour { get; set; }

        public required string Date { get; set; }

        public decimal Cost { get; set; }
    }
}
