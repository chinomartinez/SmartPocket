---
name: frontend-financial-display
description: "Patterns visuales reutilizables para SmartPocket. **Usar al** aplicar color semántico (ingreso/gasto/transferencia), glassmorphism effects, formatear montos, estilizar números con font-mono, aplicar hover states, o cualquier decisión visual financiera. Mantiene consistencia del design system (paleta, timing, effects). NO cubre estructura de componentes específicos."
argument-hint: 'Visual aspect (e.g., "color for expense", "glassmorphism", "number formatting")'
---

# SmartPocket - Financial Display Patterns

Patterns visuales reutilizables y design tokens para cualquier componente financiero. Enfocado en estilos, colores, effects y formateo — NO en estructura de componentes.

---

## When to Use This Skill

- **Color semántico**: decidir qué color usar para ingreso/gasto/transferencia
- **Glassmorphism**: aplicar `.glass-card`, `.glass-card-strong`, `.glass-card-hover`
- **Typography**: usar `font-mono` en montos, jerarquía de tamaños
- **Number formatting**: formatear montos con símbolos de moneda
- **Effects**: glow, hover states, timing de animaciones
- **Responsive styles**: spacing progresivo, mobile-first patterns
- **Empty states**: estilizar mensajes de contenido vacío

**NO usar para**: estructura de componentes (ver `frontend-component-architecture`)

---

## Color Semántico Financiero

### Paleta Establecida

Usar colores específicos según tipo de dato financiero:

| Tipo de Dato       | Color Token    | Hex         | Clases Tailwind                          | Cuándo Usar                            |
| ------------------ | -------------- | ----------- | ---------------------------------------- | -------------------------------------- |
| **Ingreso (+)**    | `emerald`      | `#10b981`   | `text-emerald-400`, `bg-emerald-500`     | Dinero que entra, valores positivos    |
| **Gasto (-)**      | `red`          | `#ef4444`   | `text-red-400`, `bg-red-500`             | Dinero que sale, valores negativos     |
| **Transferencia**  | `sp-purple`    | `#8b5cf6`   | `text-sp-purple-400`, `bg-sp-purple-500` | Movimiento entre cuentas propias       |
| **Balance Total**  | `text-primary` | `#f8fafc`   | `text-slate-50`                          | Balance consolidado (dato neutral)     |
| **Próximo Pago**   | `yellow/red`   | Condicional | `text-yellow-400` / `text-red-400`       | Según días restantes (ver regla abajo) |
| **Primario (CTA)** | `sp-blue`      | `#1e40af`   | `bg-sp-blue-600`, `text-sp-blue-400`     | Botones primarios, links, FAB          |

### Reglas de Aplicación

**Montos Positivos/Negativos:**

```tsx
// ✅ Correcto: Color según signo
<span className={amount >= 0 ? "text-emerald-400" : "text-red-400"}>
  {formatCurrency(amount)}
</span>

// ❌ Incorrecto: Siempre mismo color
<span className="text-slate-400">{formatCurrency(amount)}</span>
```

**Tipo de Transacción:**

| Tipo       | Color                | Ícono   | Uso                                       |
| ---------- | -------------------- | ------- | ----------------------------------------- |
| `expense`  | `text-red-400`       | 🔻 / 📤 | Gastos (comida, transporte, subscripción) |
| `income`   | `text-emerald-400`   | 🔺 / 📥 | Ingresos (salario, freelance, devolución) |
| `transfer` | `text-sp-purple-400` | 🔄      | Transferencias entre cuentas propias      |

**Próximos Pagos (Urgencia):**

```tsx
// Lógica de color según días restantes
const getPaymentUrgencyColor = (daysUntil: number) => {
  if (daysUntil <= 3) return "text-red-400 font-semibold"; // ⚠️ Urgente
  if (daysUntil <= 7) return "text-yellow-400"; // ⚠️ Próximo
  return "text-slate-400"; // ℹ️ Normal
};
```

### Color Backgrounds

**Cards & Surfaces:**

```tsx
// Card de cuenta/categoría con color de acento
<div className="glass-card border-l-4 border-emerald-500">
  {/* Border lateral de color semántico */}
</div>

// Badge de tipo de transacción
<span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
  Gasto
</span>
```

---

## Glassmorphism Effects

### Clases Custom Establecidas

Definidas en `src/index.css` bajo `@layer utilities`:

| Clase                | Uso                                    | Propiedades                                              |
| -------------------- | -------------------------------------- | -------------------------------------------------------- |
| `.glass-card`        | Cards estándar                         | `backdrop-blur-md` + `bg-slate-800/60` + border + shadow |
| `.glass-card-strong` | Sidebar, Header, modales               | `backdrop-blur-lg` + `bg-slate-800/80` (más opaco)       |
| `.glass-card-hover`  | Cards interactivas (combinar con base) | Hover: `bg-slate-700/70` + `scale-105` + `shadow-xl`     |

### Patterns de Uso

**Card Estándar (sin hover):**

```tsx
// AccountCard, CategoryCard, MetricCard
<div className="glass-card p-6 rounded-2xl">
  <h3 className="text-lg font-semibold text-slate-50">Cuenta Principal</h3>
  <p className="text-2xl font-mono text-emerald-400">$12,500.00</p>
</div>
```

**Card Interactiva (con hover):**

```tsx
// TransactionItem, clickeable cards
<div className="glass-card glass-card-hover group p-4 rounded-xl cursor-pointer">
  <div className="flex items-center gap-3">
    <Icon className="group-hover:scale-110 transition-transform duration-200" />
    <span className="text-slate-50">{description}</span>
  </div>
</div>
```

**Surface Elevada (Sidebar/Header/Modal):**

```tsx
// Sidebar, Header, Modal backdrop
<aside className="glass-card-strong fixed h-screen w-64 border-r border-slate-700/50">
  {/* Navegación */}
</aside>
```

### Reglas de Composición

1. **Base siempre primero**: `.glass-card` o `.glass-card-strong`
2. **Hover opcional**: Agregar `.glass-card-hover` solo si es interactivo
3. **Group pattern**: Usar `group` en contenedor + `group-hover:` en hijos
4. **Border subtle**: `border border-slate-700/30` (ya incluido en `.glass-card`)

```tsx
// ✅ Correcto: Composición completa
<div className="glass-card glass-card-hover group">
  <Icon className="group-hover:scale-110 transition-transform duration-200" />
</div>

// ❌ Incorrecto: Solo hover sin base
<div className="glass-card-hover">
```

---

## Typography & Number Display

### Montos Financieros

**Regla crítica**: SIEMPRE usar `font-mono` para montos en listas/tablas (alineación vertical).

```tsx
// ✅ Correcto: Monospace para alineación
<span className="font-mono text-2xl text-emerald-400">
  ${balance.toFixed(2)}
</span>

// ❌ Incorrecto: Sans-serif desalinea columnas
<span className="text-2xl text-emerald-400">
  ${balance.toFixed(2)}
</span>
```

### Jerarquía de Tamaños

| Contexto               | Size Class  | Weight           | Ejemplo                |
| ---------------------- | ----------- | ---------------- | ---------------------- |
| **Balance Hero**       | `text-4xl`  | `font-extrabold` | Balance total en Home  |
| **Balance Card**       | `text-2xl`  | `font-bold`      | Balance en AccountCard |
| **Montos en Lista**    | `text-base` | `font-medium`    | Transacciones en lista |
| **Montos Secundarios** | `text-sm`   | `font-normal`    | Metadata, subtotales   |

### Number Glow Effect

Para balances importantes en Hero sections:

```tsx
// Con glow sutil (text-shadow inline style)
<h2
  className="text-4xl font-mono font-extrabold text-emerald-400"
  style={{ textShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
>
  ${totalBalance.toFixed(2)}
</h2>
```

**Cuándo usar glow:**

- Balance total (hero en Home)
- Métricas destacadas en Dashboard
- Montos call-to-action

**Cuándo NO usar glow:**

- Listas de transacciones (clutter visual)
- Montos repetitivos en tablas

---

## Formateo de Montos

### Helpers de Formateo

**Uso de utility existente** (`src/utils/formatters.ts` - verificar existencia):

```typescript
// Helper esperado (si no existe, créalo)
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Con símbolo custom
export function formatAmount(amount: number, symbol: string = "$"): string {
  return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
```

**Uso en componentes:**

```tsx
import { formatCurrency } from "@/utils/formatters";

// Con Intl (recomendado)
<span className="font-mono text-emerald-400">{formatCurrency(balance)}</span>

// Con símbolo manual
<span className="font-mono">$ {amount.toLocaleString("es-AR")}</span>
```

### Prefijo de Signo

Para diferencias/cambios (+ / -):

```tsx
// Mostrar signo explícito
const displayAmount = amount >= 0 ? `+${formatCurrency(amount)}` : formatCurrency(amount);

<span className={amount >= 0 ? "text-emerald-400" : "text-red-400"}>{displayAmount}</span>;
```

---

## Hover States & Microinteractions

### Timing Establecido

| Contexto              | Duration       | Uso                                     |
| --------------------- | -------------- | --------------------------------------- |
| Hover rápido          | `duration-200` | Iconos, pequeños elementos interactivos |
| Transición estándar   | `duration-300` | Cards, buttons, modales                 |
| Animaciones complejas | `duration-500` | Balance counter, gráficos               |

### Patterns de Hover

**Card con Scale:**

```tsx
<div className="glass-card glass-card-hover group transition-all duration-300">
  {/* El scale-105 ya está en .glass-card-hover */}
</div>
```

**Íconos en Cards:**

```tsx
<Icon className="text-slate-400 group-hover:scale-110 group-hover:text-sp-blue-400 transition-all duration-200" />
```

**Botones con Translate:**

```tsx
<button className="flex items-center gap-2 text-sp-blue-400 hover:gap-3 transition-all duration-200">
  Ver detalles
  <ArrowRight className="group-hover:translate-x-0.5 transition-transform" />
</button>
```

### Balance Counter Animation

Para actualización de balance en tiempo real (TanStack Query cache invalidation):

```tsx
import { useSpring, animated } from "@react-spring/web"; // Verificar si está instalado

function AnimatedBalance({ value }: { value: number }) {
  const props = useSpring({
    number: value,
    from: { number: 0 },
    config: { duration: 500 },
  });

  return (
    <animated.span className="font-mono text-4xl font-extrabold text-emerald-400">
      {props.number.to((n) => `$${n.toFixed(2)}`)}
    </animated.span>
  );
}
```

**Alternativa sin librería** (CSS transition):

```tsx
<span
  key={balance} // Force re-render con nueva key
  className="font-mono text-4xl font-extrabold text-emerald-400 animate-pulse"
>
  {formatCurrency(balance)}
</span>
```

---

## Responsive Patterns (Mobile-First)

### Grid de Cards

```tsx
// Dashboard de cuentas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {accounts.map((account) => (
    <AccountCard key={account.id} {...account} />
  ))}
</div>
```

### Spacing Progresivo

```tsx
// Padding de containers
<section className="px-4 md:px-6 lg:px-8 py-6 md:py-8">

// Gap entre elementos
<div className="space-y-4 md:space-y-6">
```

### Typography Responsive

```tsx
// Balance hero que reduce en mobile
<h2 className="text-3xl md:text-4xl lg:text-5xl font-mono font-extrabold text-emerald-400">
  {formatCurrency(totalBalance)}
</h2>
```

---

## Empty States

### Pattern Estándar

```tsx
// Sin transacciones, cuentas, etc.
<div className="glass-card p-8 rounded-2xl text-center">
  <div className="inline-flex p-4 rounded-full bg-slate-700/50 mb-4">
    <Icon className="w-8 h-8 text-slate-500" />
  </div>
  <h3 className="text-lg font-semibold text-slate-400 mb-2">No hay transacciones</h3>
  <p className="text-sm text-slate-500 mb-6">Comienza registrando tu primera transacción</p>
  <button className="px-6 py-3 bg-sp-blue-600 text-white rounded-xl hover:bg-sp-blue-700 transition-colors duration-200">
    Nueva Transacción
  </button>
</div>
```

---

## Anti-Patterns (NO Hacer)

❌ **Color sin significado semántico**

```tsx
// Incorrecto: Ingreso en rojo, gasto en verde
<span className="text-red-400">{income}</span>
```

❌ **Sans-serif en montos de lista**

```tsx
// Incorrecto: Desalinea columnas
<span className="text-base text-emerald-400">{amount}</span>
```

❌ **Glassmorphism sin clase base**

```tsx
// Incorrecto: Re-definir propiedades ya existentes
<div className="backdrop-blur-md bg-slate-800/60">
```

❌ **Hover en elementos no interactivos**

```tsx
// Incorrecto: Display card sin acción
<div className="glass-card-hover"> {/* No hace nada al click */}
```

❌ **Number glow en todos los montos**

```tsx
// Incorrecto: Clutter visual en listas
<span style={{ textShadow: "..." }}>{amount}</span> {/* En cada item */}
```

❌ **CSS inline para styling base**

```tsx
// Incorrecto: Usar clases Tailwind establecidas
<div style={{ padding: '24px', borderRadius: '16px' }}>
```

---

## Checklist de Implementación

### Al Aplicar Estilos Financieros:

- [ ] **Color semántico**: ingreso=`emerald-400`, gasto=`red-400`, transferencia=`sp-purple-400`
- [ ] **Font-mono**: en montos dentro de listas/tablas (alineación vertical)
- [ ] **Glassmorphism**: usar `.glass-card` (base) o `.glass-card-strong` (elevated)
- [ ] **Hover**: solo si es interactivo (`.glass-card-hover` + `group` pattern)
- [ ] **Timing**: `duration-200` hover, `duration-300` transiciones estándar
- [ ] **Formateo**: usar `formatCurrency()` o `formatAmount()` helpers
- [ ] **Responsive**: mobile-first con `md:`, `lg:` breakpoints
- [ ] **Contraste**: verificar WCAG AA (color sobre background oscuro)

### Al Mostrar Montos Destacados:

- [ ] **Glow effect**: aplicar `textShadow` si es hero/métrica principal
- [ ] **Jerarquía**: `text-4xl` hero, `text-2xl` cards, `text-base` listas
- [ ] **Weight**: `font-extrabold` hero, `font-bold` destacados, `font-medium` estándar
- [ ] **Animation**: counter animation si se actualiza en tiempo real (opcional)

---

## Ejemplos de Aplicación

### Monto con Color Semántico

```tsx
// En cualquier componente que muestre montos
const amountColor =
  type === "income"
    ? "text-emerald-400"
    : type === "expense"
      ? "text-red-400"
      : "text-sp-purple-400";

<span className={`font-mono text-base font-semibold ${amountColor}`}>
  {formatCurrency(amount)}
</span>;
```

### Balance Hero con Glow

```tsx
// Balance destacado en hero section
<h2
  className="text-4xl md:text-5xl font-mono font-extrabold text-emerald-400"
  style={{ textShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
>
  {formatCurrency(totalBalance)}
</h2>
```

### Card con Glassmorphism + Hover

```tsx
// Card interactiva con todos los effects
<div className="glass-card glass-card-hover group p-6 rounded-2xl">
  <Icon className="text-slate-400 group-hover:scale-110 group-hover:text-sp-blue-400 transition-all duration-200" />
  <span className="font-mono text-2xl font-bold text-emerald-400">{formatCurrency(balance)}</span>
</div>
```

### Border Accent + Background Subtle

```tsx
// Card con color de acento en border y background
<div className="glass-card border-l-4 border-emerald-500 p-6 rounded-2xl">
  <div className="p-3 rounded-xl bg-emerald-500/20">
    <Icon className="w-6 h-6 text-emerald-400" />
  </div>
</div>
```

### Badge de Tipo

```tsx
// Badge pequeño con color semántico
const badgeColor =
  type === "expense" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400";

<span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
  {type === "expense" ? "Gasto" : "Ingreso"}
</span>;
```

---

## Referencias

- **Design System**: `src/index.css` (clases `.glass-card-*`, colores `oklch`)
- **Colors**: `.github/copilot-instructions.md` (paleta semántica completa)
- **UX Spec**: `_docs/planning/ux-design-specification.md` (decisiones de diseño)
- **Formatters**: `src/utils/formatters.ts` (crear si no existe)

---

**Reminder**: Este skill documenta **patterns visuales reutilizables** (colores, effects, typography). Para estructura de componentes específicos, ver `frontend-component-architecture`.

**Uso**: Copilot cargará este skill automáticamente cuando preguntes sobre estilos, colores, glassmorphism, o formateo de montos. No necesitas invocarlo manualmente.
