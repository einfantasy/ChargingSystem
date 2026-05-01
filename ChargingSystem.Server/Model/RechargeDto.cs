namespace ChargingSystem.Server
{
    public class RechargeDto
    {
        public string StudentId { get; set; }

        public decimal RechargePrice { get; set; }

        public decimal RechargeHour { get; set; }

        public string Date { get; set; }

        public decimal Cost { get; set; }
    }
}
