using Microsoft.EntityFrameworkCore;

namespace ChargingSystem.Server
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<StudentsBalance>(entity =>
            {
                entity.HasNoKey();          // ⭐ 必须：声明为无主键
                entity.ToView("StudentsBalance"); // ⭐ 指定 View 名
            });
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Recharge> Recharges { get; set; }
        public DbSet<Consume> Consumes { get; set; }
        public DbSet<StudentsBalance> StudentsBalanceList { get; set; }
    }
}