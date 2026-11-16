using Xunit.v3;

namespace SmartPocket.Tests.Infrastructures
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method | AttributeTargets.Assembly)]
    public sealed class IntegrationTestAttribute : Attribute, ITraitAttribute
    {
        public IReadOnlyCollection<KeyValuePair<string, string>> GetTraits()
        {
            return new[]
            {
                new KeyValuePair<string, string>("Category", "Integration")
            };
        }
    }
}
