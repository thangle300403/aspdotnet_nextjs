namespace QLSV.Models
{
    public class Subject
    {
        private int _number_of_credit;
        public int Id { get; set; }
        public string Name { get; set; }
        public int Number_of_credit
        {
            get => _number_of_credit;
            set
            {
                if (value < 1 || value > 3)
                    throw new ArgumentOutOfRangeException(nameof(_number_of_credit), "Credit must be between 1 and 3.");

                _number_of_credit = value;
            }
        }
    }
}
