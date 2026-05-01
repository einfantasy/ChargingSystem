using System;

namespace ChargingSystem.Server
{
    public class RechargeHistoryDto
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public decimal Cost { get; set; }
    }
}
