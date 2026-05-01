using System;

namespace ChargingSystem.Server
{
    public class StudentBalanceDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public Guid RechargeId { get; set; }
        public decimal RemainingHours { get; set; }
        public decimal Cost { get; set; }
    }
}
