namespace SmartPocket.SharedKernel.Guards
{
    public static class NumericGuard
    {
        public static T GetIfNotZero<T>(this T value, ParamError param) where T : struct, IComparable
        {
            value.ThrowIsZero(param);

            return value;
        }

        public static void ThrowIsZero<T>(this T value, ParamError param) where T : struct, IComparable
        {
            if (value.IsZero())
                throw param.ThrowException((x) => $"Required input '{x}' cannot be zero or negative.");
        }

        public static bool IsZero<T>(this T value) where T : struct, IComparable
            => value.CompareTo(default(T)) == 0;


        public static T GetIfNotNegativeOrZero<T>(this T value, ParamError param) where T : struct, IComparable
        {
            value.ThrowIsNegativeOrZero(param);

            return value;
        }

        public static void ThrowIsNegativeOrZero<T>(this T value, ParamError param) where T : struct, IComparable
        {
            if (value.IsNegativeOrZero())
                throw param.ThrowException((x) => $"Required input '{x}' cannot be zero or negative.");
        }

        public static bool IsNegativeOrZero<T>(this T value) where T : struct, IComparable
            => value.CompareTo(default(T)) <= 0;
    }
}
