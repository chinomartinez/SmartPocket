using SmartPocket.SharedKernel;
using SmartPocket.SharedKernel.Guards;
using System.Text.RegularExpressions;

namespace SmartPocket.Domain
{ 
    public partial class Icon : ValueObject
    {
        public string Code { get; private set; }

        public string ColorHex { get; private set; }

        public Icon(string code, string colorHex)
        {
            code.ThrowIsNullOrEmpty(nameof(code));
            colorHex.ThrowIsNullOrEmpty(nameof(colorHex));

            if (!ColorHexRegex().IsMatch(colorHex))
                throw new ArgumentException("Invalid color hex.");

            Code = code;
            ColorHex = colorHex;
        }

        protected override IEnumerable<object> GetAtomicValues()
        {
            yield return Code;
            yield return ColorHex;
        }

        [GeneratedRegex("^#(?:[0-9a-fA-F]{3}){1,2}$")]
        public static partial Regex ColorHexRegex();
    }
}
