using Microsoft.AspNetCore.Mvc;
using QLSV.Data;
using QLSV.Models;

namespace QLSV.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetStudents(
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

            var query = db.Students.AsQueryable();

            // 🔍 SEARCH
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.Name.Contains(search));
            }

            // 🔄 SORT
            query = sortBy?.ToLower() switch
            {
                "name" => sortOrder == "desc"
                    ? query.OrderByDescending(s => s.Name)
                    : query.OrderBy(s => s.Name),

                "birthday" => sortOrder == "desc"
                    ? query.OrderByDescending(s => s.Birthday)
                    : query.OrderBy(s => s.Birthday),

                _ => sortOrder == "desc"
                    ? query.OrderByDescending(s => s.Id)
                    : query.OrderBy(s => s.Id),
            };

            var total = query.Count();

            var students = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Gender,
                    s.Birthday
                })
                .ToList();

            var totalPages = (int)Math.Ceiling((double)total / pageSize);

            return Ok(new
            {
                total,
                page,
                pageSize,
                totalPages,
                data = students
            });
        }

        [HttpPost]
        public IActionResult CreateStudent([FromServices] AppDbContext db, [FromBody] Student student)
        {
            try
            {
                db.Students.Add(student);
                db.SaveChanges();
                Console.WriteLine("Created student with ID: " + student.Id);
                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create student.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateStudent(int id, [FromServices] AppDbContext db, [FromBody] Student updatedStudent)
        {
            try
            {
                var student = db.Students.Find(id);
                if (student == null)
                {
                    return NotFound(new { message = "Student not found." });
                }

                student.Name = updatedStudent.Name;
                student.Gender = updatedStudent.Gender;
                student.Birthday = updatedStudent.Birthday;

                Console.WriteLine($"Updating student ID: {id} with Name: {student.Name}, Gender: {student.Gender}, Birthday: {student.Birthday}");

                db.SaveChanges();

                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update student.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteStudent(int id, [FromServices] AppDbContext db)
        {
            try
            {
                var student = db.Students.Find(id);

                if (student == null)
                    return NotFound("Không tìm thấy sinh viên");

                var exists = db.Registers
                .Any(r => r.Student_id == id);

                if (exists)
                {
                    Console.WriteLine($"Cannot delete student ID: {id} because they are registered for a subject.");
                    return BadRequest("Already registered");
                }

                db.Students.Remove(student);
                Console.WriteLine($"Deleting student ID: {id}, Name: {student.Name}");

                db.SaveChanges();

                return Ok("Xóa thành công");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete student.", error = ex.Message });
            }
        }
    }
}
