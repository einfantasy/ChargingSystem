using Microsoft.EntityFrameworkCore;
using QuestPDF;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ChargingSystem.Server
{
    public class StudentHistoryPdfResult
    {
        public string StudentName { get; set; } = string.Empty;
        public byte[] PdfBytes { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
    }

    public class StudentService
    {
        private readonly AppDbContext _context;

        public StudentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Student>> GetStudents()
        {
            return await _context.Students.ToListAsync();
        }

        public async Task AddStudentAsync(Student student)
        {
            await _context.Students.AddAsync(student);
            await _context.SaveChangesAsync();
        }

        public async Task<StudentHistoryPdfResult?> GetStudentHistoryAsync(Guid studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.StudentId == studentId);
            if (student == null)
                return null;

            var studentName = student.Name;

            var records = await _context.Consumes
                .Join(_context.Recharges,
                    c => c.RechargeId,
                    r => r.Id,
                    (c, r) => new { Consume = c, Recharge = r })
                .Join(_context.Students,
                    cr => cr.Recharge.StudentId,
                    s => s.StudentId,
                    (cr, s) => new { cr.Consume, cr.Recharge, Student = s })
                .Join(_context.Teachers,
                    crs => crs.Consume.TeacherId,
                    t => t.TeacherId,
                    (crs, t) => new { crs.Consume, crs.Student, Teacher = t })
                .Where(x => x.Student.StudentId == studentId)
                .OrderBy(x => x.Consume.Date)
                .Select(x => new StudentHistoryRecordDto
                {
                    Id = x.Consume.Id,
                    StudentName = x.Student.Name,
                    Hour = x.Consume.Hour,
                    Date = x.Consume.Date,
                    Subject = x.Teacher.Subject
                })
                .ToListAsync();

            if (!records.Any())
                return null;

            QuestPDF.Settings.License = LicenseType.Community;
            Settings.CheckIfAllTextGlyphsAreAvailable = false;
            var doc = Document.Create(document =>
            {
                document.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x
                        .FontSize(10)
                        .FontFamily("Noto Sans CJK SC"));

                    page.Header()
                        .Text($"Student: {studentName}")
                        .FontSize(18)
                        .Bold();

                    page.Content()
                        .PaddingVertical(10)
                        .Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("ID").Bold().FontColor(Colors.Grey.Darken3);
                                header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Student").Bold().FontColor(Colors.Grey.Darken3);
                                header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Hours").Bold().FontColor(Colors.Grey.Darken3);
                                header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Date").Bold().FontColor(Colors.Grey.Darken3);
                                header.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6).Text("Subject").Bold().FontColor(Colors.Grey.Darken3);
                            });

                            foreach (var record in records)
                            {
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten4).Padding(6).Text(record.Id.ToString());
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten4).Padding(6).Text(record.StudentName);
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten4).Padding(6).Text(record.Hour.ToString());
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten4).Padding(6).Text(record.Date.ToString("yyyy-MM-dd"));
                                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten4).Padding(6).Text(record.Subject ?? string.Empty);
                            }
                        });

                    page.Footer()
                        .AlignRight()
                        .DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Grey.Medium))
                        .Text(x =>
                        {
                            x.CurrentPageNumber();
                            x.Span(" / ");
                            x.TotalPages();
                        });
                });
            });

            var pdfBytes = doc.GeneratePdf();
            var fileName = $"{studentName}_history_{DateTime.Now:yyyyMMdd_HHmmss}.pdf";
            return new StudentHistoryPdfResult
            {
                StudentName = studentName,
                PdfBytes = pdfBytes,
                FileName = fileName
            };
        }
    }
}
