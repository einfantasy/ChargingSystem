using System;

namespace ChargingSystem.Server
{
    public class StudentHistoryRecordDto
    {
        public Guid Id { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public decimal Hour { get; set; }
        public DateTime Date { get; set; }
        public string? Subject { get; set; }
    }
}
