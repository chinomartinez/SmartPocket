using NSubstitute;
using SmartPocket.Persistence;
using SmartPocket.Persistence.DatabaseTransactions;
using SmartPocket.SharedKernel.Entities;

namespace SmartPocket.Tests.Infrastructures
{
    internal sealed class FakeSmartPocketContext : ISmartPocketContext
    {
        private readonly Dictionary<Type, List<BaseEntity>> _sets = new();
        private readonly List<(Type SetType, BaseEntity Entity)> _added = new();
        private readonly List<(Type SetType, BaseEntity Entity)> _deleted = new();

        public FakeSmartPocketContext(IDatabaseContextTransaction? transaction = null)
        {
            Transaction = transaction ?? Substitute.For<IDatabaseContextTransaction>();
        }

        public IDatabaseContextTransaction Transaction { get; }

        public FakeSmartPocketContext With<T>(params T[] entities) where T : BaseEntity
        {
            GetOrCreateSet(typeof(T)).AddRange(entities);

            return this;
        }

        public IReadOnlyList<T> Saved<T>() where T : BaseEntity
        {
            return GetOrCreateSet(typeof(T)).Cast<T>().ToList();
        }

        public IQueryable<T> Query<T>() where T : BaseEntity
        {
            return GetOrCreateSet(typeof(T)).Cast<T>().AsAsyncQueryable();
        }

        public ValueTask<T> FindAsyncOrThrow<T>(object id, CancellationToken cancellation) where T : BaseEntity
        {
            var entity = Find<T>(id);

            if (entity is null)
                throw new InvalidOperationException($"Entity '{typeof(T).Name}' with id '{id}' could not be found.");

            return ValueTask.FromResult(entity);
        }

        public ValueTask<T?> FindAsync<T>(object id, CancellationToken cancellation) where T : BaseEntity
        {
            return ValueTask.FromResult(Find<T>(id));
        }

        public T AddEntity<T>(T entity) where T : BaseEntity
        {
            _added.Add((typeof(T), entity));

            return entity;
        }

        public void AddRange<T>(IEnumerable<T> entities) where T : BaseEntity
        {
            foreach (var entity in entities)
                _added.Add((typeof(T), entity));
        }

        public T DeleteEntity<T>(T entity) where T : BaseEntity
        {
            _deleted.Add((typeof(T), entity));

            return entity;
        }

        public void DeleteRange<T>(IEnumerable<T> entities) where T : BaseEntity
        {
            foreach (var entity in entities)
                _deleted.Add((typeof(T), entity));
        }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var affected = _added.Count + _deleted.Count;

            foreach (var (setType, entity) in _added)
            {
                var set = GetOrCreateSet(setType);

                if (!set.Contains(entity))
                    set.Add(entity);
            }

            foreach (var (setType, entity) in _deleted)
                GetOrCreateSet(setType).Remove(entity);

            _added.Clear();
            _deleted.Clear();

            return Task.FromResult(affected);
        }

        public void DiscardAllChanges()
        {
            _added.Clear();
            _deleted.Clear();
        }

        public Task<IDatabaseContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Transaction);
        }

        private T? Find<T>(object id) where T : BaseEntity
        {
            var saved = GetOrCreateSet(typeof(T)).Cast<T>();
            var pending = _added
                .Where(x => x.SetType == typeof(T))
                .Select(x => (T)x.Entity);

            return saved
                .Concat(pending)
                .FirstOrDefault(entity => entity.GetId().Equals(id));
        }

        private List<BaseEntity> GetOrCreateSet(Type type)
        {
            if (!_sets.TryGetValue(type, out var set))
            {
                set = new List<BaseEntity>();
                _sets[type] = set;
            }

            return set;
        }
    }
}
