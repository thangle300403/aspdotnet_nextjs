using Microsoft.AspNetCore.Mvc;
using QLSV.Data;
using QLSV.Models;

namespace QLSV.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubjectController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetSubjects(
            [FromServices] AppDbContext db,
            int page = 1,
            int pageSize = 5,
            string? search = null,
            string? sortBy = "id",
            string? sortOrder = "asc"
        )
        {
            if (page < 1) page = 1;
            if (pageSize <= 0) pageSize = 5;

            var query = db.Subjects.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.Name.Contains(search));
            }

            query = sortBy?.ToLower() switch
            {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(s => s.Name)
                    : query.OrderBy(s => s.Name),

                "number_of_credit" => sortOrder == "desc"
                    ? query.OrderByDescending(s => s.Number_of_credit)
                    : query.OrderBy(s => s.Number_of_credit),

                _ => sortOrder == "desc"
                    ? query.OrderByDescending(s => s.Id)
                    : query.OrderBy(s => s.Id),
            };

            var total = query.Count();

            var subjects = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Number_of_credit
                })
                .ToList();

            var totalPages = (int)Math.Ceiling((double)total / pageSize);

            return Ok(new
            {
                total,
                page,
                pageSize,
                totalPages,
                data = subjects
            });
        }

        [HttpPost]
        public IActionResult CreateSubject([FromServices] AppDbContext db, [FromBody] Subject subject)
        {
            try
            {
                db.Subjects.Add(subject);
                Console.WriteLine("Attempting to create subject with Name: " + subject.Name + ", Number_of_credit: " + subject.Number_of_credit);
                db.SaveChanges();
                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create subject.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateSubject(int id, [FromServices] AppDbContext db, [FromBody] Subject updatedSubject)
        {
            try
            {
                var subject = db.Subjects.Find(id);
                if (subject == null)
                {
                    return NotFound(new { message = "Subject not found." });
                }

                subject.Name = updatedSubject.Name;
                subject.Number_of_credit = updatedSubject.Number_of_credit;

                Console.WriteLine($"Updating subject ID: {id} with Name: {subject.Name}, Number_of_credit: {subject.Number_of_credit}");

                db.SaveChanges();

                return Ok(subject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update subject.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteSubject(int id, [FromServices] AppDbContext db)
        {
            try
            {
                var subject = db.Subjects.Find(id);

                if (subject == null)
                    return NotFound("Không tìm thấy môn học");

                var exists = db.Registers
                .Any(r => r.Subject_id == id);

                if (exists)
                    return BadRequest("Already been registered");

                db.Subjects.Remove(subject);
                Console.WriteLine($"Deleting subject ID: {id}, Name: {subject.Name}");

                db.SaveChanges();

                return Ok("Xóa thành công");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete subject.", error = ex.Message });
            }
        }
    }
}
