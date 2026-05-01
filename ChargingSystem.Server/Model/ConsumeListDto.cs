using System;

namespace ChargingSystem.Server
{
    public class ConsumeListDto
    {
        public Guid Id { get; set; }
        public Guid RechargeId { get; set; }
        public string TeacherName { get; set; }
        public string Subject { get; set; }
        public DateTime Date { get; set; }
        public decimal Hour { get; set; }
    }
}
