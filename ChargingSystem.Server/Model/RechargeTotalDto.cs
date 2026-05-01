using System;

namespace ChargingSystem.Server
{
    public class RechargeTotalDto
    {
        public int RechargeCount { get; set; }
        public decimal TotalMoney { get; set; }
        public decimal TotalHours { get; set; }
    }
}
