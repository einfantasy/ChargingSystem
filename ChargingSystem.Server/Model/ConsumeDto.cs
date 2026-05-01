using System;

namespace ChargingSystem.Server
{
    public class ConsumeDto
    {
        public Guid RechargeId { get; set; }
        public Guid TeacherId { get; set; }
        public decimal Hour { get; set; }
        public DateTime Date { get; set; }
        public decimal Cost { get; set; }
    }
}
