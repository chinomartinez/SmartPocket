# Anti-Patterns Críticos - Component Architecture

Quick reference de errores comunes en React + TypeScript para SmartPocket.

---

## TypeScript Strict Mode

### Non-null assertions sin validación

```typescript
// ❌ MAL
const account = accounts.find((a) => a.id === id)!;
account.name; // Runtime crash si no existe

// ✅ BIEN
const account = accounts.find((a) => a.id === id);
if (!account) return null;
return account.name;

// O con optional chaining
return accounts.find((a) => a.id === id)?.name;
```

### Uso de `any`

```typescript
// ❌ MAL
function process(data: any) {
  return data.value;
}

// ✅ BIEN - generics
function process<T>(data: T): T {
  return data;
}

// ✅ BIEN - union types
function handle(error: Error | ApiError) {
  if ("errors" in error) return error.errors;
  return error.message;
}
```

---

## Performance Issues

### Inline function props (re-renders)

```typescript
// ❌ MAL - nueva función en cada render
function AccountList() {
  return (
    <>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onClick={() => handleClick(account.id)} // Nueva función cada vez
        />
      ))}
    </>
  );
}

// ✅ BIEN - extract callback
function AccountList() {
  const handleAccountClick = (id: number) => handleClick(id);

  return (
    <>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onClick={() => handleAccountClick(account.id)}
        />
      ))}
    </>
  );
}

// ✅ MEJOR - useCallback
const handleAccountClick = useCallback(
  (id: number) => handleClick(id),
  [handleClick]
);
```

### Missing React.memo

```typescript
// ❌ MAL - re-render en CADA list update
function ExpensiveCard({ account }: { account: Account }) {
  const stats = calculateComplexStats(account); // Expensive
  return <div><Stats data={stats} /></div>;
}

// ✅ BIEN - memo para expensive components
export const ExpensiveCard = memo(function ExpensiveCard({ account }: { account: Account }) {
  const stats = calculateComplexStats(account);
  return <div><Stats data={stats} /></div>;
});
```

### Destructuring excesivo

```typescript
// ❌ MAL - dificulta lectura
const {
  account: {
    name,
    currency: { symbol, code },
    metadata: {
      createdAt,
      tags: [primaryTag, ...otherTags],
    },
  },
} = props;

// ✅ BIEN - balance claridad
const { account } = props;
const { name, balance } = account;
const symbol = account.currency?.symbol ?? "$";
const createdAt = account.metadata?.createdAt;
```

---

## Mutation de State

```typescript
// ❌ MAL - mutación directa
function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);

  const handleUpdate = (id: number, newName: string) => {
    const account = accounts.find((a) => a.id === id);
    if (account) {
      account.name = newName; // Mutación directa - React no detecta!
      setAccounts(accounts); // Misma referencia
    }
  };
}

// ✅ BIEN - immutability
function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);

  const handleUpdate = (id: number, newName: string) => {
    setAccounts(
      accounts.map((account) =>
        account.id === id
          ? { ...account, name: newName } // Nuevo objeto
          : account,
      ),
    );
  };
}
```

**Immutability patterns:**

```typescript
// Arrays
const newArray = [...oldArray, newItem]; // Agregar
const filtered = oldArray.filter((item) => item.id !== removeId); // Remover
const updated = oldArray.map((item) => (item.id === updateId ? { ...item, ...changes } : item)); // Update

// Objects
const newObj = { ...oldObj, field: newValue }; // Update field
const { removed, ...rest } = oldObj; // Remove field
const merged = { ...obj1, ...obj2 }; // Merge
```

---

**Referencias:**

- [React Docs - Strict Mode](https://react.dev/reference/react/StrictMode)
- [TypeScript - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [React Docs - memo](https://react.dev/reference/react/memo)
