using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChargingSystem.Server
{
    [Table("Recharges")]
    public class Recharge
    {
        [Key]
        public Guid Id { get; set; }

        public Guid StudentId { get; set; }

        public decimal RechargePrice { get; set; }

        public decimal RechargeHour { get; set; }

        public DateTime Date { get; set; }

        public decimal Cost { get; set; }
    }
}
