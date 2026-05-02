using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChargingSystem.Server
{
    [Table("Consumes")]
    public class Consume
    {
        [Key]
        public Guid Id { get; set; }

        public Guid RechargeId { get; set; }

        public Guid TeacherId { get; set; }

        public decimal Hour { get; set; }

        public DateTime Date { get; set; }

        public decimal CostAtTime { get; set; }

        [ForeignKey("RechargeId")]
        public Recharge Recharge { get; set; }
    }
}
