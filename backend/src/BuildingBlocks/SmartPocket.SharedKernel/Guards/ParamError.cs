namespace SmartPocket.SharedKernel.Guards
{
    public readonly struct ParamError
    {
        private readonly Func<Exception>? _exceptionFactorty;

        public string? Name { get; }
        public string? Message { get; }

        public ParamError(string name, string? message = null)
        {
            if (string.IsNullOrEmpty(name))
                throw new ArgumentNullException(nameof(name));

            Name = name;
            Message = message;
        }

        public ParamError(Func<Exception> exceptionFactory)
        {
            _exceptionFactorty = exceptionFactory;
        }

        public static implicit operator ParamError(string name)
            => new(name);

        public static implicit operator ParamError(Func<Exception> exceptionFactory)
            => new(exceptionFactory);

        public Exception ThrowException(Func<string, string> messageFactory)
        {
            return _exceptionFactorty?.Invoke() ?? CreateException(messageFactory);
        }

        private Exception CreateException(Func<string, string> messageFactory)
        {
            return new ArgumentException(Message ?? messageFactory(Name!), Name);
        }
    }
}
