# Component Composition Patterns

Quick reference de patterns de composición para SmartPocket React app.

---

## Container/Presentational Pattern

Separación entre lógica (data/state) y UI.

```typescript
// Container - lógica y data
function AccountListContainer() {
  const { data: accounts, isLoading, error } = useAccounts();
  const deleteMutation = useDeleteAccount();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;
  if (!accounts) return null;

  return <AccountListView accounts={accounts} onDelete={handleDelete} />;
}

// Presentational - solo UI
interface AccountListViewProps {
  accounts: Account[];
  onDelete: (id: number) => void;
}

function AccountListView({ accounts, onDelete }: AccountListViewProps) {
  return (
    <div className="grid gap-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} onDelete={() => onDelete(account.id)} />
      ))}
    </div>
  );
}
```

---

## Compound Components Pattern

Components que trabajan juntos. Usado por shadcn/ui.

```typescript
// Uso - flexible composition
<Card>
  <CardHeader>
    <CardTitle>Account Details</CardTitle>
    <CardDescription>View and edit account information</CardDescription>
  </CardHeader>
  <CardContent>
    <AccountForm />
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
    <Button variant="outline">Cancel</Button>
  </CardFooter>
</Card>
```

**Implementación básica:**

```typescript
interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, ...props }: CardProps) => (
  <div className={cn("rounded-lg border bg-card", className)} {...props} />
);

const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-2xl font-semibold", className)} {...props} />
);

const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
```

**Con Context (para state compartido):**

```typescript
// Context pattern para Tabs
const TabsContext = createContext<{ activeTab: string; setActiveTab: (tab: string) => void }>(undefined);

function Tabs({ children, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabsTrigger({ value, children }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button onClick={() => setActiveTab(value)} className={cn(activeTab === value && "active")}>
      {children}
    </button>
  );
}
```

---

**Referencias:**

- [React Docs - Composition vs Inheritance](https://react.dev/learn/composition-vs-inheritance)
- [Compound Components Pattern](https://www.patterns.dev/react/compound-pattern)
- [shadcn/ui - Component Structure](https://ui.shadcn.com/docs/components)
