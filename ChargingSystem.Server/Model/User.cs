using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Password { get; set; }
        public Guid? TeacherId { get; set; }
        public int AuthLevel { get; set; }
    }
}