using System.ComponentModel.DataAnnotations;

namespace ChargingSystem.Server
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
    }
}