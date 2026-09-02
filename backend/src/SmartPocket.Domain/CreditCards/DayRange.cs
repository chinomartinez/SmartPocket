namespace SmartPocket.Domain.CreditCards
{
    public readonly record struct DayRange(int StartDay, int EndDay)
    {
        public bool Contains(int day)
        {
            if (day is < 1 or > 31)
                return false;

            return StartDay <= EndDay
                ? day >= StartDay && day <= EndDay
                : day >= StartDay || day <= EndDay;
        }
    }
}
