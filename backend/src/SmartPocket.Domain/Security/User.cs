using SmartPocket.SharedKernel.Entities;
using SmartPocket.SharedKernel.Guards;

namespace SmartPocket.Domain.Security
{
    public class User : BaseAuditEntity<int>
    {
        public string Email { get; private set; }
        public string Name { get; private set; }
        public string Surname {  get; private set; }

        public User(string email, string name, string surname)
        {
            Email = email.GetIfNotNullOrWhiteSpace(nameof(email));
            Name = name.GetIfNotNullOrWhiteSpace(nameof(name));
            Surname = surname.GetIfNotNullOrWhiteSpace(nameof(surname));
        }
    }
}
