namespace SmartPocket.SharedKernel.Guards
{
    public static class StringGuard
    {
        public static string GetIfNotNullOrEmpty(this string value, ParamError param)
        {
            value.ThrowIsNullOrEmpty(param);

            return value;
        }

        public static void ThrowIsNullOrEmpty(this string value, ParamError param)
        {
            if (value.IsNullOrEmpty())
                throw param.ThrowException((x) => $"Required input '{x}' was null or empty.");
        }

        public static bool IsNullOrEmpty(this string value)
            => string.IsNullOrEmpty(value);

        public static string GetIfNotNullOrWhiteSpace(this string value, ParamError param)
        {
            value.ThrowIsNullOrWhiteSpace(param);

            return value;
        }

        public static void ThrowIsNullOrWhiteSpace(this string value, ParamError param)
        {
            if (value.IsNullOrWhiteSpace())
                throw param.ThrowException(GetError);
        }

        private static string GetError(string name)
        {
            return $"Required input '{name}' was null, is empty, or consists only of whitespace characters.";
        }

        public static bool IsNullOrWhiteSpace(this string value)
            => string.IsNullOrWhiteSpace(value);
    }
}
