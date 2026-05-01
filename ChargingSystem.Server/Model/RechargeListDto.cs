using System;

namespace ChargingSystem.Server
{
    public class RechargeListDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public decimal TotalHours { get; set; }
        public decimal TotalMoney { get; set; }
        public DateTime? LastRechargeDate { get; set; }
        public decimal? CurrentCost { get; set; }
        public decimal? RemainingHours { get; set; }
    }
}
