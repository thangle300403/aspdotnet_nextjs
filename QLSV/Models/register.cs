namespace QLSV.Models
{
    public class Register
    {
        private float _score;
        public int Id { get; set; }
        public int Student_id { get; set; }
        public int Subject_id { get; set; }
        public float Score
        {
            get => _score;
            set
            {
                if (value < 0 || value > 10)
                    throw new ArgumentOutOfRangeException(nameof(_score), "Score must be between 0 and 10.");

                _score = value;
            }
        }
    }
}
