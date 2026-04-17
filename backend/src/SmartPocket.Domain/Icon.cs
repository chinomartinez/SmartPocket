using System.Text.RegularExpressions;

namespace SmartPocket.Domain
{ 
    public readonly partial record struct Icon(string Code, string ColorHex)
    {
        [GeneratedRegex("^#(?:[0-9a-fA-F]{3}){1,2}$")]
        public static partial Regex ColorHexRegex();
    }
}
