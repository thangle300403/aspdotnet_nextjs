using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QLSV.Data;
using QLSV.Models;

namespace QLSV.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RegisterController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetFromDb([FromServices] AppDbContext db)
        {
            var registers = db.Registers.ToList();
            return Ok(registers);
        }

        [HttpPost]
        public IActionResult CreateRegister([FromServices] AppDbContext db, [FromBody] Register register)
        {
            try
            {
                var std = db.Students.Find(register.Student_id);
                if (std == null)
                {
                    return NotFound(new { message = "Student not found." });
                }
                var sub = db.Subjects.Find(register.Subject_id);
                if (sub == null)
                {
                    return NotFound(new { message = "Subject not found." });
                }
                var exists = db.Registers
                .Any(r => r.Student_id == register.Student_id && r.Subject_id == register.Subject_id);

                if (exists)
                    return BadRequest("Already registered");

                db.Registers.Add(register);
                db.SaveChanges();

                return Ok(register);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create register.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateScore(int id, [FromServices] AppDbContext db, [FromBody] float score)
        {
            var reg = db.Registers.Find(id);
            if (reg == null)
                return NotFound();

            reg.Score = score;
            db.SaveChanges();

            return Ok(reg);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteRegister(int id, [FromServices] AppDbContext db)
        {
            var reg = db.Registers.Find(id);
            if (reg == null)
                return NotFound();

            db.Registers.Remove(reg);
            db.SaveChanges();

            return Ok("Deleted");
        }
    }
}
